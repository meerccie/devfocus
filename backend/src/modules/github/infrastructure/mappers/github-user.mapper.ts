import { GithubUser } from '../../domain/models/github-user.entity';
import type { GithubGraphqlUser } from '../types/github-api.types';

export class GithubUserMapper {
  /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
  static fromGraphqlToDomain(raw: GithubGraphqlUser): GithubUser {
    // The Adapter ensures 'raw.user' is not null before calling this
    const data = raw.user;

    const totalCommits = data!.repositories.nodes.reduce((acc, repo) => {
      const count = repo.defaultBranchRef?.target?.history?.totalCount || 0;
      return acc + count;
    }, 0);

    return new GithubUser(
      data!.id,
      data!.login,
      data!.name ?? data!.login,
      data!.avatarUrl,
      data!.bio ?? '',
      data!.repositories.nodes.length,
      totalCommits,
    );
  }
  /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
}
