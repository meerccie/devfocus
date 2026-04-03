import { Injectable } from '@nestjs/common';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

@Injectable()
export class SecurityScannerService {
  private readonly FILENAME_RULES = [
    {
      pattern: /(^|\/)\.env(\..+)?$/i,
      name: 'Environment File',
      severity: 'CRITICAL',
      remediation: 'Move secrets to a Vault and add to .gitignore.',
    },
    {
      pattern: /\.(pem|key|pub|p12|pfx|crt)$/i,
      name: 'Cryptographic Asset',
      severity: 'CRITICAL',
      remediation: 'Remove private keys or certificates from version control.',
    },
    {
      pattern: /(^|\/)(aws_config|credentials|terraform\.tfstate|kubeconfig)$/i,
      name: 'Cloud Infrastructure Secret',
      severity: 'CRITICAL',
      remediation:
        'Revoke these credentials in your Cloud Console immediately.',
    },
    {
      pattern: /\.(sql|sqlite|db|dump|bak)$/i,
      name: 'Database/Backup File',
      severity: 'HIGH',
      remediation:
        'Remove raw data files. Use migrations or secure cloud storage.',
    },
    {
      pattern:
        /(^|\/)(\.kube\/config|config\.json|docker-compose\.yml|dockerfile)$/i,
      name: 'Orchestration Config',
      severity: 'MEDIUM',
      remediation:
        'Ensure no hardcoded passwords or tokens exist in these manifests.',
    },
  ];

  private readonly CONTENT_RULES = [
    {
      name: 'Slack Token',
      regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
      severity: 'CRITICAL',
      remediation: 'Revoke token in Slack dashboard.',
    },
    {
      name: 'AWS Key',
      regex: /(?:AKIA|ASIA)[0-9A-Z]{16}/g,
      severity: 'CRITICAL',
      remediation: 'Deactivate key in AWS IAM and rotate.',
    },
    {
      name: 'GitHub PAT',
      regex: /ghp_[a-zA-Z0-9]{36}/g,
      severity: 'CRITICAL',
      remediation: 'Revoke the Personal Access Token in GitHub Settings.',
    },
    {
      name: 'Private Key Header',
      regex: /-----BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY-----/g,
      severity: 'CRITICAL',
      remediation: 'Delete file and rotate SSH/SSL keys.',
    },
    {
      name: 'Generic Secret',
      regex:
        /(key|secret|password|token|auth|api_key|client_secret)\s*[:=]\s*["'][0-9a-zA-Z\-_]{16,}["']/gi,
      severity: 'HIGH',
      remediation: 'Move hardcoded secrets to environment variables.',
    },
  ];

  scanPath(path: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    for (const rule of this.FILENAME_RULES) {
      if (rule.pattern.test(path)) {
        issues.push(
          new SecurityIssue(
            path,
            `Forbidden file detected: ${rule.name}`,
            rule.severity as any,
            rule.remediation,
          ),
        );
      }
    }
    return issues;
  }

  scanContent(path: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    if (!content || content.trim().length === 0) return issues;

    for (const rule of this.CONTENT_RULES) {
      rule.regex.lastIndex = 0;
      if (rule.regex.test(content)) {
        issues.push(
          new SecurityIssue(
            path,
            `Potential Leak: ${rule.name}`,
            rule.severity as any,
            rule.remediation,
          ),
        );
      }
    }

    const tokens = content.split(/[\s'":=,;]+/);
    for (const token of tokens) {
      if (token.length > 32 && token.length < 512) {
        if (this.calculateEntropy(token) > 4.5) {
          issues.push(
            new SecurityIssue(
              path,
              'High-entropy string detected',
              'HIGH',
              'Review this string; it has a high probability of being an API key.',
            ),
          );
          break;
        }
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
