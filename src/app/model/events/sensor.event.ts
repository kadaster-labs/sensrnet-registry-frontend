export abstract class SensorEvent<T> {

  private readonly sensorId: string;

  constructor(sensorId: string) {
    this.sensorId = sensorId;
  }
}
