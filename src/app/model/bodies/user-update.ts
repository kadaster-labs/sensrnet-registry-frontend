export class UserUpdateBody {
  constructor(
    public password?: string,
    public organization?: string,
  ) { }
}
