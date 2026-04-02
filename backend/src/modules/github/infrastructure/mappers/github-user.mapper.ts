import { GithubUser } from '../../domain/models/github-user.entity';
import type { GithubGraphqlUser } from '../types/github-graphql-user.interface';

export class GithubUserMapper {
  static fromGraphqlToDomain(raw: GithubGraphqlUser): GithubUser {
    // 1. Extract the inner user object
    const data = raw.user;

    // 2. Calculate commits safely
    const totalCommits = data.repositories.nodes.reduce((acc, repo) => {
      const count = repo.defaultBranchRef?.target?.history?.totalCount || 0;
      return acc + count;
    }, 0);

    // 3. Return the clean Domain Entity
    return new GithubUser(
      data.id,
      data.login,
      data.name ?? data.login, // Use nullish coalescing for cleaner fallbacks
      data.avatarUrl,
      data.bio ?? '',
      data.repositories.nodes.length,
      totalCommits,
    );
  }
}
