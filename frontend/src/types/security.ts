export interface SecurityIssue {
  /** The file path where the issue was found */
  path: string;

  /** Detailed information about what was found (e.g., 'Potential Leak: AWS Key') */
  description: string;

  /** Risk level: CRITICAL, HIGH, MEDIUM, or LOW */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /**
   * The suggested action to resolve the vulnerability.
   * Named "remediation" to match the backend SecurityIssue entity —
   * the old "fix" field was undefined at runtime because the backend
   * never sent a property by that name.
   */
  remediation?: string;
}