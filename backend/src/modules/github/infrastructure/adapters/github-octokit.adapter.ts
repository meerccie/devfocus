import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Octokit } from 'octokit';
import { GithubLogger } from '../services/github-logger.service';
import { CacheService } from '../services/cache.service';
import { SecurityScannerService } from '../services/security-scanner.service';
import { GithubUserMapper } from '../mappers/github-user.mapper';
import type { GithubGraphqlUser } from '../types/github-graphql-user.interface';
import type { IGithubRepository } from '../../application/ports/github-repository.port';
import { GithubUser } from '../../domain/models/github-user.entity';
import { GithubRepo } from '../../domain/models/github-repo.entity';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

// Define the shape of the GraphQL response body
interface GraphQLResponse {
  data: GithubGraphqlUser;
}

@Injectable()
export class GithubOctokitAdapter implements IGithubRepository {
  private readonly octokit: Octokit;
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly githubLogger: GithubLogger,
    private readonly cacheService: CacheService,
    private readonly securityScanner: SecurityScannerService,
  ) {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async getUser(username: string): Promise<GithubUser> {
    const cleanUsername = username.trim();
    const cacheKey = this.cacheService.generateKey(
      'github-user',
      cleanUsername,
    );
    const cachedUser = await this.cacheService.get<GithubUser>(cacheKey);

    if (cachedUser) {
      this.githubLogger.logCacheHit(cleanUsername);
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

    // Correct way to type GraphQL: .request returns { data, headers, status... }
    // The generic is 'POST /graphql', the response is manually casted for the body
    const response = await this.octokit.request('POST /graphql', {
      query,
      variables: { login: cleanUsername },
    });

    const payload = response.data as GraphQLResponse;
    const graphqlData = payload.data;
    const userExists = !!graphqlData.user;

    this.githubLogger.logRateLimit(
      response.headers as Record<string, string | undefined>,
      cleanUsername,
      userExists ? 'found' : 'notfound',
    );

    if (graphqlData.errors && graphqlData.errors.length > 0) {
      throw new HttpException(
        graphqlData.errors[0].message,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!graphqlData.user) {
      throw new HttpException(
        `User ${cleanUsername} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const user = GithubUserMapper.fromGraphqlToDomain(graphqlData);
    await this.cacheService.set(cacheKey, user, this.CACHE_TTL);
    return user;
  }

  async getUserRepos(username: string): Promise<GithubRepo[]> {
    const cleanUsername = username.trim();
    const cacheKey = this.cacheService.generateKey('repos', cleanUsername);
    const cached = await this.cacheService.get<GithubRepo[]>(cacheKey);
    if (cached) return cached;

    // Use specific Octokit Response types for REST
    const response = await this.octokit.request('GET /users/{username}/repos', {
      username: cleanUsername,
      type: 'owner',
      per_page: 100,
    });

    // Cast the data to the expected shape to satisfy ESLint
    const repoData = response.data as Array<{
      name: string;
      full_name: string;
      private: boolean;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
    }>;

    const repos = repoData.map(
      (repo) =>
        new GithubRepo(
          repo.name,
          repo.full_name,
          repo.private,
          repo.description,
          repo.language,
          repo.stargazers_count,
          repo.forks_count,
        ),
    );

    await this.cacheService.set(cacheKey, repos, this.CACHE_TTL);
    return repos;
  }

  async scanRepository(owner: string, repo: string): Promise<SecurityIssue[]> {
    const repoResponse = await this.octokit.request(
      'GET /repos/{owner}/{repo}',
      {
        owner,
        repo,
      },
    );

    const repoInfo = repoResponse.data as { default_branch: string };

    const treeResponse = await this.octokit.request(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
      {
        owner,
        repo,
        tree_sha: repoInfo.default_branch,
        recursive: '1',
      },
    );

    const treeData = treeResponse.data as {
      tree: Array<{ path: string; type: string }>;
    };

    return this.securityScanner.scanTree(treeData.tree);
  }
}
