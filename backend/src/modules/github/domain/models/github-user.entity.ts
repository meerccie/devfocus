export class GithubUser {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly displayName: string | null,
    public readonly avatarUrl: string,
    public readonly bio: string | null,
    public readonly repoCount: number,
    public readonly totalCommits?: number,
  ) {}
}
