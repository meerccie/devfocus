import { Injectable } from '@nestjs/common';
import { SecurityIssue } from '../../domain/models/security-issue.entity';
import { GithubRepo } from '../../domain/models/github-repo.entity';

@Injectable()
export class SeverityScorerService {
  calculateRisk(repo: GithubRepo, issues: SecurityIssue[]) {
    if (issues.length === 0) return { score: 0, level: 'SAFE' };

    const weights: Record<string, number> = {
      CRITICAL: 40,
      HIGH: 20,
      MEDIUM: 10,
      LOW: 5,
    };

    const baseScore = issues.reduce((acc, issue) => {
      const severity = (issue.severity || 'LOW').toUpperCase();
      return acc + (weights[severity] || 5);
    }, 0);

    const exposure = repo.isPrivate ? 1.0 : 2.5;
    const popularity =
      Math.log10(repo.stars + 1) * 3 + Math.log10(repo.forks + 1) * 6;

    const score = Math.min(100, Math.round(baseScore * exposure + popularity));
    const level =
      score > 80
        ? 'CRITICAL'
        : score > 50
          ? 'HIGH'
          : score > 20
            ? 'MEDIUM'
            : 'LOW';

    return { score, level };
  }
}
