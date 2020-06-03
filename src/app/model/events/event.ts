export abstract class Event<T> {
  constructor(
    public readonly streamId: string,
    public readonly eventType: string,
    public readonly data: T,
    public readonly metadata: object = {},
  ) {}
}
