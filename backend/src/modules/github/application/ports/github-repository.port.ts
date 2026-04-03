import { GithubUser } from '../../domain/models/github-user.entity';
import { GithubRepo } from '../../domain/models/github-repo.entity';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

export interface IGithubRepository {
  getUser(username: string): Promise<GithubUser>;
  getUserRepos(username: string): Promise<GithubRepo[]>;
  scanRepository(owner: string, repo: string): Promise<SecurityIssue[]>;
}

export const GITHUB_REPO_PORT = Symbol('IGithubRepository');
