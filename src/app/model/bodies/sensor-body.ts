import { ISensorLocation } from './location';

export interface ISensor {
  _id: string;
  nodeId: string;
  ownerIds?: Array<string>;
  name?: string;
  location: ISensorLocation;
  baseObjectId: string;
  dataStreams?: Array<any>;
  aim?: string;
  description?: string;
  manufacturer?: string;
  active: boolean;
  observationArea?: object;
  documentationUrl?: string;
  theme?: Array<string>;
  typeName: Array<string>;
  typeDetails?: Record<string, any>;
}
