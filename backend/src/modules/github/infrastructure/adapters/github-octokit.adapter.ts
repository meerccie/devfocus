import { Injectable, NotFoundException } from '@nestjs/common';
import { Octokit } from 'octokit';
import { IGithubRepository } from '../../application/ports/github-repository.port';
import { GithubUser } from '../../domain/models/github-user.entity';
import { GithubRepo } from '../../domain/models/github-repo.entity';
import { SecurityIssue } from '../../domain/models/security-issue.entity';
import { SecurityScannerService } from '../services/security-scanner.service';

// 1. Define Internal Interfaces for Type Safety
interface GithubGraphqlResponse {
  user: {
    id: string;
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    repositories: {
      totalCount: number;
      nodes: Array<{
        defaultBranchRef: {
          target: { history: { totalCount: number } };
        } | null;
      }>;
    };
  } | null;
}

interface GithubTreeEntry {
  path: string;
  type: string;
  sha: string;
}

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
            totalCount
            nodes {
              defaultBranchRef {
                target { ... on Commit { history { totalCount } } }
              }
            }
          }
        }
      }
    `;

    const res = await this.octokit.graphql<{
      user: GithubGraphqlResponse['user'];
    }>(query, { login: username });
    const u = res.user;

    if (!u) throw new NotFoundException('User not found');

    const commits = u.repositories.nodes.reduce(
      (acc, n) => acc + (n?.defaultBranchRef?.target?.history?.totalCount || 0),
      0,
    );

    return new GithubUser(
      u.id,
      u.login,
      u.name,
      u.avatarUrl,
      u.bio,
      u.repositories.totalCount,
      commits,
    );
  }

  async getUserRepos(username: string): Promise<GithubRepo[]> {
    const { data } = await this.octokit.request('GET /users/{username}/repos', {
      username,
      per_page: 100,
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
    const res = await this.octokit.request(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
      {
        owner,
        repo,
        tree_sha: 'HEAD',
        recursive: '1',
      },
    );

    const issues: SecurityIssue[] = [];
    const tree = res.data.tree as GithubTreeEntry[];

    const files = tree
      .filter(
        (f) =>
          f.type === 'blob' && /\.(ts|js|json|env|yml|yaml|txt)$/i.test(f.path),
      )
      .slice(0, 30);

    for (const file of files) {
      try {
        const { data } = (await this.octokit.request(
          'GET /repos/{owner}/{repo}/contents/{path}',
          {
            owner,
            repo,
            path: file.path,
          },
        )) as { data: { content: string } };

        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        issues.push(...this.securityScanner.scanContent(file.path, content));
      } catch {
        continue;
      }
    }
    return issues;
  }
}
