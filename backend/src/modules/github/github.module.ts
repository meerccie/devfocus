import { Module } from '@nestjs/common';
import { GITHUB_REPO_PORT } from './application/ports/github-repository.port';
import { GithubOctokitAdapter } from './infrastructure/adapters/github-octokit.adapter';
import { GithubController } from './infrastructure/controllers/github.controller';
import { GithubLogger } from './infrastructure/services/github-logger.service';

@Module({
  controllers: [GithubController],
  providers: [
    GithubLogger,
    {
      provide: GITHUB_REPO_PORT,
      useClass: GithubOctokitAdapter,
    },
  ],
})
export class GithubModule {}
