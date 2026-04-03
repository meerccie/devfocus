import type { GithubUser } from '../types/user';
import type { GithubRepo } from '../types/repository';
import type { SecurityIssue } from '../types/security';

const API_BASE = 'http://localhost:3000/github';

export const githubService = {
  async getUser(username: string): Promise<GithubUser> {
    const res = await fetch(`${API_BASE}/user/${username}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  async getRepos(username: string): Promise<GithubRepo[]> {
    const res = await fetch(`${API_BASE}/user/${username}/repos`);
    return res.json();
  },

  async scanRepo(username: string, repoName: string): Promise<SecurityIssue[]> {
    const res = await fetch(`${API_BASE}/user/${username}/repos/${repoName}/security`);
    return res.json();
  }
};