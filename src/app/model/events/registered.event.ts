import { LocationBody } from '../bodies/location-body';
import { ISensorSchema } from '../bodies/sensor-body';
import { SensorEvent } from './sensor.event';
import { EventType } from './event-type';

export class SensorRegistered extends SensorEvent<ISensorSchema> {

  public readonly nodeId: string;
  public readonly ownerIds: string[];
  public readonly name: string;
  public readonly longitude: number;
  public readonly latitude: number;
  public readonly height: number;
  public readonly baseObjectId: string;
  public readonly aim: string;
  public readonly description: string;
  public readonly manufacturer: string;
  public readonly active: boolean;
  public readonly observationArea: object;
  public readonly documentationUrl: string;
  public readonly theme: string[];
  public readonly typeName: string;
  public readonly typeDetails: object;

  constructor(sensorId: string, nodeId: string, ownerIds: string[],
              name: string, longitude: number, latitude: number, height: number,
              baseObjectId: string, aim: string, description: string,
              manufacturer: string, active: boolean, observationArea: object,
              documentationUrl: string, theme: string[], typeName: string,
              typeDetails: object) {

      super(sensorId);
      this.nodeId = nodeId;
      this.ownerIds = ownerIds;
      this.name = name;
      this.longitude = longitude;
      this.latitude = latitude;
      this.height = height;
      this.baseObjectId = baseObjectId;
      this.aim = aim;
      this.description = description;
      this.manufacturer = manufacturer;
      this.active = active;
      this.observationArea = observationArea;
      this.documentationUrl = documentationUrl;
      this.theme = theme;
      this.typeName = typeName;
      this.typeDetails = typeDetails;
  }
}
