export abstract class SensorEvent<T> {

  private readonly _sensorId: string;

  constructor(sensorId: string) {
    this._sensorId = sensorId;
  }

  public get sensorId() {
    return this._sensorId;
  }
}
