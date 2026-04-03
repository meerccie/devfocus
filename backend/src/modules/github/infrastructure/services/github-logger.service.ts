import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GithubLogger {
  private readonly logger = new Logger('GitHubAPI');

  logRateLimit(
    headers: Record<string, string | undefined>,
    username: string,
    status: 'found' | 'notfound' | 'error' = 'found',
  ): void {
    const remaining = headers['x-ratelimit-remaining'];
    const limit = headers['x-ratelimit-limit'];
    const reset = headers['x-ratelimit-reset'];

    if (remaining && limit) {
      let statusTag = 'OK';
      if (status === 'notfound') {
        statusTag = 'NOT FOUND';
      } else if (status === 'error') {
        statusTag = 'ERROR';
      }
      this.logger.log(
        `Quota: ${remaining}/${limit} | Target: ${username} | Status: ${statusTag}`,
      );

      // Warning if you're running low (less than 10%)
      if (Number(remaining) < Number(limit) * 0.1) {
        const resetDate = new Date(Number(reset) * 1000).toLocaleTimeString();
        this.logger.warn(`Low Rate Limit! Resets at ${resetDate}`);
      }
    }
  }

  logCacheHit(username: string): void {
    this.logger.log(`Cache HIT for user: ${username}`);
  }

  logCacheMiss(username: string): void {
    this.logger.log(
      `Cache MISS for user: ${username} - Fetching from GitHub API`,
    );
  }
}
