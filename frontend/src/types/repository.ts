export interface GithubRepo {
  name: string;
  fullName: string;
  isPrivate: boolean;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
}