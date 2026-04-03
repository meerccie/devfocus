import { Injectable } from '@nestjs/common';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

@Injectable()
export class SecurityScannerService {
  // Use a Set for faster O(1) lookups compared to Array.some()
  // Added more common sensitive file patterns
  private readonly SUSPICIOUS_EXTENSIONS = new Set([
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    '.pem',
    '.key',
    '.p12',
    '.pfx',
    '.secret',
    '.git-credentials',
    '.npmrc',
    '.dockercfg',
  ]);

  scanTree(tree: Array<{ path: string; type: string }>): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const entry of tree) {
      // 1. Only scan blobs (files)
      if (entry.type !== 'blob') continue;

      // 2. Normalize path for case-insensitive matching
      const lowerPath = entry.path.toLowerCase();

      // 3. Optimized check: find the last dot to extract extension
      const lastDotIndex = lowerPath.lastIndexOf('.');
      if (lastDotIndex === -1) continue;

      const extension = lowerPath.substring(lastDotIndex);

      if (
        this.SUSPICIOUS_EXTENSIONS.has(extension) ||
        lowerPath.includes('secret')
      ) {
        issues.push(
          new SecurityIssue(
            entry.path,
            `Security risk: Sensitive file detected (${entry.path})`,
          ),
        );
      }
    }

    return issues;
  }
}
