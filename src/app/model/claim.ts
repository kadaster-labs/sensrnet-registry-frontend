export class Claim {
  constructor(
    public userId?: string,
    public exp?: number,
    public accessToken?: string,
  ) {}
}
