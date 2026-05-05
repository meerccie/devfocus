export const githubService = {
  // Use the environment variable with a fallback
  async getProfile(username: string) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/github/${username}/profile`);
    
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  async scanRepository(username: string, repo: string) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(
      `${baseUrl}/github/${username}/scan/${repo}`,
      { headers: { 'Cache-Control': 'no-cache' } }
    );
    
    if (!res.ok) throw new Error('Scan failed');
    return res.json();
  },
};