export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
}