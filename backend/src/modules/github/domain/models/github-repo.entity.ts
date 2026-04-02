export class GithubRepo {
  constructor(
    public readonly name: string,
    public readonly fullName: string,
    public readonly isPrivate: boolean,
    public readonly description: string | null,
    public readonly language: string | null,
    public readonly stars: number,
    public readonly forks: number,
  ) {}
}
