export class SecurityIssue {
  constructor(
    public readonly path: string,
    public readonly description: string,
    public readonly severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    public readonly remediation?: string,
  ) {}
}
