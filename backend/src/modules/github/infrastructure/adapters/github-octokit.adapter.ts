import { Injectable } from '@nestjs/common';
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

/**
 * 2. Define the Instance shape (what this.octokit can do).
 */
interface OctokitInstance {
  request<T = unknown>(
    route: string,
    options?: Record<string, unknown>,
  ): Promise<T>;
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
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly githubLogger: GithubLogger,
    private readonly cacheService: CacheService,
    private readonly securityScanner: SecurityScannerService,
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

    // 5. Strictly typed call with GitHub GraphQL response
    const response = await this.octokit.request<{
      headers: Record<string, string | undefined>;
      data: GithubGraphqlUser;
    }>('POST /graphql', {
      query,
      variables: { login: username },
    });

    const userExists = !!response.data.user;
    this.githubLogger.logRateLimit(
      response.headers,
      username,
      userExists ? 'found' : 'notfound',
    );

    if (!response.data.user) {
      throw new Error(`User ${username} not found`);
    }

    const user = GithubUserMapper.fromGraphqlToDomain(response.data);

    // Cache the result with type safety
    await this.cacheService.set(cacheKey, user, this.CACHE_TTL);
    this.githubLogger.logCacheMiss(username);
    return user;
  }

  async getUserRepos(username: string): Promise<GithubRepo[]> {
    const cacheKey = this.cacheService.generateKey(
      'github-user-repos',
      username,
    );
    const cachedRepos = await this.cacheService.get<GithubRepo[]>(cacheKey);
    if (cachedRepos) {
      this.githubLogger.logCacheHit(username);
      return cachedRepos;
    }

    const repoData = await this.octokit.request<
      Array<{
        name: string;
        full_name: string;
        private: boolean;
        description: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
      }>
    >('GET /users/{username}/repos', {
      username,
      type: 'public',
      per_page: 100,
    });

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
    this.githubLogger.logCacheMiss(username);
    return repos;
  }

  private async getRepoDefaultBranch(
    owner: string,
    repo: string,
  ): Promise<string> {
    const repoInfo = await this.octokit.request<{ default_branch: string }>(
      'GET /repos/{owner}/{repo}',
      {
        owner,
        repo,
      },
    );
    return repoInfo.default_branch;
  }

  private async getBranchTreeSha(
    owner: string,
    repo: string,
    branch: string,
  ): Promise<string> {
    const branchInfo = await this.octokit.request<{
      commit: { commit: { tree: { sha: string } } };
    }>('GET /repos/{owner}/{repo}/branches/{branch}', {
      owner,
      repo,
      branch,
    });
    return branchInfo.commit.commit.tree.sha;
  }

  private async getTree(
    owner: string,
    repo: string,
    treeSha: string,
  ): Promise<Array<{ path: string; type: string }>> {
    const treeResponse = await this.octokit.request<{
      tree: Array<{ path: string; type: string }>;
    }>('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
      owner,
      repo,
      tree_sha: treeSha,
      recursive: '1',
    });
    return treeResponse.tree;
  }

  async scanRepository(owner: string, repo: string): Promise<SecurityIssue[]> {
    const cacheKey = this.cacheService.generateKey(
      'github-repo-scan',
      `${owner}/${repo}`,
    );
    const cachedIssues = await this.cacheService.get<SecurityIssue[]>(cacheKey);
    if (cachedIssues) {
      this.githubLogger.logCacheHit(`${owner}/${repo}`);
      return cachedIssues;
    }

    const defaultBranch = await this.getRepoDefaultBranch(owner, repo);
    const treeSha = await this.getBranchTreeSha(owner, repo, defaultBranch);
    const tree = await this.getTree(owner, repo, treeSha);

    const issues = this.securityScanner.scanTree(tree);

    await this.cacheService.set(cacheKey, issues, this.CACHE_TTL);
    this.githubLogger.logCacheMiss(`${owner}/${repo}`);
    return issues;
  }
}
