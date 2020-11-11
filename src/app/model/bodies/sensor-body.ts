import { ISensorLocation } from './location';

export interface ISensor {
  _id: string;
  nodeId: string;
  organizations?: Array<Record<string, string>>;
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
  category: string;
  typeName: string;
  typeDetails?: Record<string, any>;
}
