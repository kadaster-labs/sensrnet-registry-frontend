/**
 * The JWT Payload
 */
export class Claims {
  constructor(
    public userId?: string,
    public organizationId?: string,
    public exp?: number,
    public access_token?: string,
  ) {}
}
