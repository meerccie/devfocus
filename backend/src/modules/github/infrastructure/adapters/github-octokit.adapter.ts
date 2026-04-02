import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';
import { GithubLogger } from '../services/github-logger.service';
import { CacheService } from '../services/cache.service';
import { GithubUserMapper } from '../mappers/github-user.mapper';
import type { GithubGraphqlUser } from '../types/github-graphql-user.interface';
import type { IGithubRepository } from '../../application/ports/github-repository.port';
import { GithubUser } from '../../domain/models/github-user.entity';

/**
 * 1. Define the Response shape strictly.
 */
interface OctokitGraphqlResponse {
  data: {
    data: GithubGraphqlUser;
  };
  headers: Record<string, string | undefined>;
}

/**
 * 2. Define the Instance shape (what this.octokit can do).
 */
interface OctokitInstance {
  request(
    route: string,
    options: { query: string; variables: Record<string, unknown> },
  ): Promise<OctokitGraphqlResponse>;
}

/**
 * 3. Define the Constructor shape.
 * This tells the linter exactly how 'new Octokit()' should behave.
 */
interface OctokitConstructor {
  new (options: { auth: string | undefined }): OctokitInstance;
}

@Injectable()
export class GithubOctokitAdapter implements IGithubRepository {
  private readonly octokit: OctokitInstance;

  constructor(
    private readonly githubLogger: GithubLogger,
    private readonly cacheService: CacheService,
  ) {
    /**
     * 4. Cast the CLASS, not the instance.
     * We use 'unknown' as a safe bridge to re-map the unresolved Octokit class
     * to our strict OctokitConstructor interface.
     */
    const SafeOctokit = Octokit as unknown as OctokitConstructor;

    this.octokit = new SafeOctokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async getUser(username: string): Promise<GithubUser> {
    const cacheKey = this.cacheService.generateKey('github-user', username);
    const cachedUser = await this.cacheService.get<GithubUser>(cacheKey);

    if (cachedUser) {
      this.githubLogger.logCacheHit(username);
      return cachedUser;
    }

    const query = `
      query getStats($login: String!) {
        user(login: $login) {
          id
          login
          name
          avatarUrl
          bio
          repositories(first: 50, ownerAffiliations: OWNER) {
            nodes {
              name
              defaultBranchRef {
                target {
                  ... on Commit {
                    history {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    // 5. Strictly typed call - no 'any' required
    const response = await this.octokit.request('POST /graphql', {
      query,
      variables: { login: username },
    });

    this.githubLogger.logRateLimit(
      response.headers as Record<string, string>,
      username,
    );

    const user = GithubUserMapper.fromGraphqlToDomain(response.data.data);

    // Cache the result with type safety
    await this.cacheService.set(cacheKey, user, 300);
    this.githubLogger.logCacheMiss(username);

    return user;
  }
}
