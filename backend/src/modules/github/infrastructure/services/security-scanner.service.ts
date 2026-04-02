import { Injectable } from '@nestjs/common';
import { SecurityIssue } from '../../domain/models/security-issue.entity';

@Injectable()
export class SecurityScannerService {
  private readonly SUSPICIOUS_EXTENSIONS = [
    '.env',
    '.env.local',
    '.pem',
    '.key',
    '.p12',
    '.pfx',
    '.secret',
  ];

  scanTree(tree: Array<{ path: string; type: string }>): SecurityIssue[] {
    return tree
      .filter((entry) => entry.type === 'blob')
      .filter((entry) =>
        this.SUSPICIOUS_EXTENSIONS.some((ext) => entry.path.endsWith(ext)),
      )
      .map(
        (entry) =>
          new SecurityIssue(entry.path, `Suspicious extension: ${entry.path}`),
      );
  }
}
