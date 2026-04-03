import { Injectable } from '@nestjs/common';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

@Injectable()
export class SecurityScannerService {
  private readonly RULES = [
    {
      name: 'Slack Token',
      regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
      severity: 'CRITICAL',
      fix: 'Revoke token in Slack.',
    },
    {
      name: 'AWS Key',
      regex: /(?:AKIA|ASIA)[0-9A-Z]{16}/g,
      severity: 'CRITICAL',
      fix: 'Deactivate key in AWS IAM.',
    },
    {
      name: 'Private Key',
      regex: /-----BEGIN RSA PRIVATE KEY-----/g,
      severity: 'HIGH',
      fix: 'Delete file and rotate SSH keys.',
    },
  ];

  private calculateEntropy(str: string): number {
    const len = str.length;
    if (len === 0) return 0;
    const freq: Record<string, number> = {};
    for (const char of str) freq[char] = (freq[char] || 0) + 1;
    return Object.values(freq).reduce((sum, f) => {
      const p = f / len;
      return sum - p * Math.log2(p);
    }, 0);
  }

  scanContent(path: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Regex Checks
    for (const rule of this.RULES) {
      if (rule.regex.test(content)) {
        issues.push(
          new SecurityIssue(
            path,
            `Found ${rule.name}`,
            rule.severity as any,
            rule.fix,
          ),
        );
      }
    }

    // Entropy Checks
    const tokens = content.split(/[\s'":=]+/);
    for (const token of tokens) {
      if (token.length > 25 && this.calculateEntropy(token) > 4.5) {
        issues.push(
          new SecurityIssue(
            path,
            'Detected high-entropy string',
            'HIGH',
            'Verify if this is a raw API key.',
          ),
        );
        break;
      }
    }

    return issues;
  }
}
