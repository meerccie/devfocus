export const githubService = {
  // Just gets the user and repo list
  async getProfile(username: string) {
    const res = await fetch(`http://localhost:3000/github/${username}/profile`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  // Performs the security audit on a specific repo
  async scanRepository(username: string, repo: string) {
    const res = await fetch(
      `http://localhost:3000/github/${username}/scan/${repo}`,
      { headers: { 'Cache-Control': 'no-cache' } }, // ← forces a fresh request every time
    );
    if (!res.ok) throw new Error('Scan failed');
    return res.json();
  },
};