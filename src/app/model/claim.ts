export class Claim {
  constructor(
    public userId?: string,
    public organizationId?: string,
    public expires?: number,
    public accessToken?: string,
  ) {}
}
