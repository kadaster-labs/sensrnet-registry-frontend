export class Owner {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public name: string,
    public organization: string,
    public phone: string,
    public website: string,
    public accessToken: string,
  ) { }
}
