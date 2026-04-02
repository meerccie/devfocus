import { GithubUser } from '../../domain/models/github-user.entity';

export interface IGithubRepository {
  getUser(username: string): Promise<GithubUser>;
}

// Token for NestJS Dependency Injection
export const GITHUB_REPO_PORT = Symbol('IGithubRepository');
