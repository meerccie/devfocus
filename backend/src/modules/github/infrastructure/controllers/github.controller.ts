import { Controller, Get, Param, Inject } from '@nestjs/common';
import { GITHUB_REPO_PORT } from '../../application/ports/github-repository.port';
// Use 'import type' for the interface to satisfy 'isolatedModules'
import type { IGithubRepository } from '../../application/ports/github-repository.port';
import { SeverityScorerService } from '../services/severity-scorer.service';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

@Controller('github')
export class GithubController {
  constructor(
    @Inject(GITHUB_REPO_PORT)
    private readonly githubRepo: IGithubRepository,
    private readonly severityScorer: SeverityScorerService,
  ) {}

  @Get(':username/audit')
  async getProfileAudit(@Param('username') username: string) {
    const [user, repos] = await Promise.all([
      this.githubRepo.getUser(username),
      this.githubRepo.getUserRepos(username),
    ]);

    const topRepo = [...repos].sort((a, b) => b.stars - a.stars)[0];
    let scanResults: SecurityIssue[] = [];
    let riskReport = { score: 0, level: 'LOW' };

    if (topRepo) {
      scanResults = await this.githubRepo.scanRepository(
        username,
        topRepo.name,
      );
      riskReport = this.severityScorer.calculateRisk(topRepo, scanResults);
    }

    return {
      userProfile: user,
      totalRepos: repos.length,
      deepScan: {
        repoName: topRepo?.name,
        risk: riskReport,
        issues: scanResults,
      },
    };
  }
}
