export class Claim {
  constructor(
    public userId?: string,
    public organizationId?: string,
    public exp?: number,
    public accessToken?: string,
  ) {}
}
