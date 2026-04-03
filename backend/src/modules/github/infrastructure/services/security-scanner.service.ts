import { Injectable } from '@nestjs/common';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

@Injectable()
export class SecurityScannerService {
  // Rules for forbidden filenames (detects even if file is empty)
  private readonly FILENAME_RULES = [
    {
      pattern: /\.env(\..+)?$/i,
      name: 'Environment File',
      severity: 'CRITICAL',
      fix: 'Move secrets to a Vault and add to .gitignore.',
    },
    {
      pattern: /\.(pem|key|pub)$/i,
      name: 'Cryptographic Key',
      severity: 'CRITICAL',
      fix: 'Remove private keys from version control immediately.',
    },
    {
      pattern: /\.(sql|sqlite|db)$/i,
      name: 'Database File',
      severity: 'HIGH',
      fix: 'Remove raw database files; use migrations instead.',
    },
    {
      pattern: /(docker-compose\.yml|dockerfile)$/i,
      name: 'Docker Config',
      severity: 'MEDIUM',
      fix: 'Ensure no hardcoded credentials exist in env vars.',
    },
  ];

  // Rules for secrets found INSIDE the code
  private readonly CONTENT_RULES = [
    {
      name: 'Slack Token',
      regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
      severity: 'CRITICAL',
      fix: 'Revoke token in Slack dashboard.',
    },
    {
      name: 'AWS Key',
      regex: /(?:AKIA|ASIA)[0-9A-Z]{16}/g,
      severity: 'CRITICAL',
      fix: 'Deactivate key in AWS IAM and rotate.',
    },
    {
      name: 'Private Key Header',
      regex: /-----BEGIN RSA PRIVATE KEY-----/g,
      severity: 'HIGH',
      fix: 'Delete file and rotate SSH/SSL keys.',
    },
  ];

  /**
   * Scans a file path string for forbidden extensions
   */
  scanPath(path: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    for (const rule of this.FILENAME_RULES) {
      if (rule.pattern.test(path)) {
        issues.push(
          new SecurityIssue(
            path,
            `Forbidden file: ${rule.name}`,
            rule.severity as any,
            rule.fix,
          ),
        );
      }
    }
    return issues;
  }

  /**
   * Scans file content using Regex and Shannon Entropy
   */
  scanContent(path: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // 1. Run Regex Rules
    for (const rule of this.CONTENT_RULES) {
      rule.regex.lastIndex = 0; // CRITICAL: Reset regex state for global flags
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

    // 2. Run Entropy Check (Detects random strings/API Keys)
    const tokens = content.split(/[\s'":=]+/);
    for (const token of tokens) {
      if (token.length > 25 && this.calculateEntropy(token) > 4.5) {
        issues.push(
          new SecurityIssue(
            path,
            'Detected high-entropy string',
            'HIGH',
            'Verify if this is a raw secret or API key.',
          ),
        );
        break; // Only report one entropy issue per file to reduce noise
      }
    }

    return issues;
  }

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
}
