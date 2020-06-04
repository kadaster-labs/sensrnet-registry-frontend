import { LocationBody } from './location-body';

export interface ISensorSchema {
  sensorId: string;
  nodeId: string;
  ownerIds?: Array<string>;
  name?: string;
  location: LocationBody;
  dataStreams?: Array<any>;
  aim?: string;
  description?: string;
  manufacturer?: string;
  active: boolean;
  observationArea?: object;
  documentationUrl?: string;
  theme?: Array<string>;
  typeName: string;
  typeDetails: object;
}
