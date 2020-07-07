export class Owner {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public name: string,
    public organisationName: string,
    public contactEmail: string,
    public contactPhone: string,
    public website: string,
    // tslint:disable-next-line: variable-name
    public access_token: string,
    // tslint:disable-next-line: variable-name
    public expires_in: number,
  ) { }
}
