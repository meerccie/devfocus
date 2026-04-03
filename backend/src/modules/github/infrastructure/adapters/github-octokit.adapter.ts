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
    if (!res?.user)
      throw new NotFoundException(`User '${username}' not found.`);
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

  async scanRepository(
    owner: string,
    repo: string,
  ): Promise<{ issues: SecurityIssue[]; sensitiveFiles: string[] }> {
    const tree = await this.fetchRepositoryTree(owner, repo);
    const allIssues: SecurityIssue[] = [];
    const sensitiveFilePaths = new Set<string>();

    // PASS 1: Filenames (Catches .env even if empty)
    for (const entry of tree) {
      if (entry.type === 'blob') {
        const found = this.securityScanner.scanPath(entry.path);
        if (found.length > 0) {
          sensitiveFilePaths.add(entry.path);
          allIssues.push(...found);
        }
      }
    }

    // PASS 2: Content (Catches secrets inside files)
    const queue = this.getPriorityQueue(tree).slice(0, 40);
    for (const file of queue) {
      const content = await this.fetchFileContent(owner, repo, file.path);
      if (content !== null) {
        const contentIssues = this.securityScanner.scanContent(
          file.path,
          content,
        );
        if (contentIssues.length > 0) {
          sensitiveFilePaths.add(file.path);
          allIssues.push(...contentIssues);
        }
      }
    }

    // Deduplicate issues by Path + Description
    const issues = allIssues.filter(
      (issue, index, self) =>
        index ===
        self.findIndex(
          (t) => t.path === issue.path && t.description === issue.description,
        ),
    );

    return { issues, sensitiveFiles: [...sensitiveFilePaths] };
  }

  private async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
  ): Promise<string | null> {
    try {
      const response = await this.octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        { owner, repo, path },
      );
      const data = response.data as GithubContentResponse;
      return data.content
        ? Buffer.from(data.content, 'base64').toString('utf-8')
        : null;
    } catch {
      return null;
    }
  }

  private async fetchRepositoryTree(
    owner: string,
    repo: string,
  ): Promise<TreeEntry[]> {
    const res = await this.octokit.request(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
      {
        owner,
        repo,
        tree_sha: 'HEAD',
        recursive: '1',
      },
    );
    return (res.data.tree as unknown as TreeEntry[]) || [];
  }

  private getPriorityQueue(tree: TreeEntry[]): TreeEntry[] {
    const highRisk =
      /(\.env|config|secret|key|cert|auth|vault|token|dockerfile|\.yml|\.yaml|\.conf|sql)/i;
    return tree.filter((e) => e.type === 'blob' && highRisk.test(e.path));
  }
}
