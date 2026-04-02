import { Module } from '@nestjs/common';
import { GITHUB_REPO_PORT } from './application/ports/github-repository.port';
import { GithubOctokitAdapter } from './infrastructure/adapters/github-octokit.adapter';
import { GithubController } from './infrastructure/controllers/github.controller';
import { GithubLogger } from './infrastructure/services/github-logger.service';
import { CacheService } from './infrastructure/services/cache.service';
import { SecurityScannerService } from './infrastructure/services/security-scanner.service';

@Module({
  controllers: [GithubController],
  providers: [
    GithubLogger,
    CacheService,
    SecurityScannerService,
    {
      provide: GITHUB_REPO_PORT,
      useClass: GithubOctokitAdapter,
    },
  ],
})
export class GithubModule {}
