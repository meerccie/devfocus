import {
  Controller,
  Get,
  Param,
  Inject,
  NotFoundException,
  Header,
} from '@nestjs/common';
import type { IGithubRepository } from '../../application/ports/github-repository.port';
import { GITHUB_REPO_PORT } from '../../application/ports/github-repository.port';
import { SeverityScorerService } from '../services/severity-scorer.service';

@Controller('github')
export class GithubController {
  constructor(
    @Inject(GITHUB_REPO_PORT) private readonly githubRepo: IGithubRepository,
    private readonly severityScorer: SeverityScorerService,
  ) {}

  @Get(':username/profile')
  async getProfile(@Param('username') username: string) {
    const [user, repos] = await Promise.all([
      this.githubRepo.getUser(username),
      this.githubRepo.getUserRepos(username),
    ]);

    return { userProfile: user, repositories: repos };
  }

  @Get(':username/scan/:repo')
  @Header('Cache-Control', 'no-store') // ← prevents browser from caching scan results
  async scanRepo(
    @Param('username') username: string,
    @Param('repo') repo: string,
  ) {
    const repos = await this.githubRepo.getUserRepos(username);
    const targetRepo = repos.find((r) => r.name === repo);

    if (!targetRepo)
      throw new NotFoundException(
        `Repository ${repo} not found for user ${username}`,
      );

    const { issues, sensitiveFiles } = await this.githubRepo.scanRepository(
      username,
      repo,
    );
    const riskReport = this.severityScorer.calculateRisk(targetRepo, issues);

    return { repoName: repo, risk: riskReport, issues, sensitiveFiles };
  }
}
