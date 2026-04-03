import { Injectable, NotFoundException } from '@nestjs/common';
import { Octokit } from 'octokit';
import { IGithubRepository } from '../../application/ports/github-repository.port';
import { GithubUser } from '../../domain/models/github-user.entity';
import { GithubRepo } from '../../domain/models/github-repo.entity';
import { SecurityIssue } from '../../domain/models/security-issue.entity';
import { SecurityScannerService } from '../services/security-scanner.service';
import { GithubUserMapper } from '../mappers/github-user.mapper';
import {
  GithubGraphqlUser,
  GithubContentResponse,
  TreeEntry,
} from '../types/github-api.types';

@Injectable()
export class GithubOctokitAdapter implements IGithubRepository {
  private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  constructor(private readonly securityScanner: SecurityScannerService) {}

  async getUser(username: string): Promise<GithubUser> {
    const query = `
      query getStats($login: String!) {
        user(login: $login) {
          id login name avatarUrl bio
          repositories(first: 50, ownerAffiliations: OWNER) {
            nodes {
              name
              defaultBranchRef {
                target { ... on Commit { history { totalCount } } }
              }
            }
          }
        }
      }
    `;

    const res = await this.octokit.graphql<GithubGraphqlUser>(query, {
      login: username,
    });

    if (!res?.user) {
      throw new NotFoundException(`User '${username}' not found.`);
    }

    return GithubUserMapper.fromGraphqlToDomain(res);
  }

  async getUserRepos(username: string): Promise<GithubRepo[]> {
    const { data } = await this.octokit.request('GET /users/{username}/repos', {
      username,
      per_page: 100,
      sort: 'updated',
    });

    return data.map(
      (r) =>
        new GithubRepo(
          r.name,
          r.full_name,
          r.private,
          r.description ?? null,
          r.language ?? null,
          r.stargazers_count ?? 0,
          r.forks_count ?? 0,
        ),
    );
  }

  async scanRepository(owner: string, repo: string): Promise<SecurityIssue[]> {
    const tree = await this.fetchRepositoryTree(owner, repo);
    const issues: SecurityIssue[] = [];

    // entry is now correctly typed as TreeEntry
    tree.forEach((entry: TreeEntry) => {
      if (entry.type === 'blob') {
        issues.push(...this.securityScanner.scanPath(entry.path));
      }
    });

    const queue = this.getPriorityQueue(tree).slice(0, 40);

    for (const file of queue) {
      const content = await this.fetchFileContent(owner, repo, file.path);
      if (content) {
        issues.push(...this.securityScanner.scanContent(file.path, content));
      }
      // Circuit breaker for too many critical issues
      if (issues.filter((i) => i.severity === 'CRITICAL').length > 5) break;
    }

    return issues;
  }

  private async fetchRepositoryTree(
    owner: string,
    repo: string,
  ): Promise<TreeEntry[]> {
    const res = await this.octokit.request(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
      { owner, repo, tree_sha: 'HEAD', recursive: '1' },
    );

    // Explicitly cast the generic Octokit data to our TreeEntry interface
    return res.data.tree as unknown as TreeEntry[];
  }

  private getPriorityQueue(tree: TreeEntry[]): TreeEntry[] {
    const highRisk =
      /(\.env|config|secret|key|cert|auth|vault|token|dockerfile|\.yml|\.yaml|\.conf|sql)/i;
    const standard = /\.(ts|js|json|txt|sh|py|go|php|cs|rb)$/i;

    const high = tree.filter((e) => e.type === 'blob' && highRisk.test(e.path));
    const code = tree.filter((e) => e.type === 'blob' && standard.test(e.path));

    return [...high, ...code];
  }

  private async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
  ): Promise<string | null> {
    try {
      const response = (await this.octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        { owner, repo, path },
      )) as { data: GithubContentResponse };

      if (response.data.content) {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch {
      return null;
    }
  }
}
