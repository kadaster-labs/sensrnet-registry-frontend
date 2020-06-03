import { LocationBody } from '../bodies/location-body';
import { ISensorSchema } from '../bodies/sensor-body';
import { Event } from './event';
import { EventType } from './event-type';

export class SensorCreated extends Event<ISensorSchema> {

  constructor(aggregatedId: string, nodeId: string, ownerIds: Array<string>,
              name: string, location: LocationBody, aim: string, description: string,
              manufacturer: string, active: boolean, observationArea: object,
              documentationUrl: string, theme: Array<string>, typeName: string,
              typeDetails: object) {

    super(`sensor-${aggregatedId}`, EventType.SensorCreated, {
      active,
      aim,
      description,
      documentationUrl,
      location,
      manufacturer,
      name,
      nodeId,
      observationArea,
      ownerIds,
      sensorId: aggregatedId,
      theme,
      typeDetails,
      typeName,
    });
  }
}
