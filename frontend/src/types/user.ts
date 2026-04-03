export interface GithubUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string;
  bio: string | null;
  repoCount: number;
  totalCommits?: number;
}