import { ILocation } from './location';

export interface ISensor {
  _id: string;
  nodeId: string;
  ownerIds?: Array<string>;
  name?: string;
  location: ILocation;
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
  typeDetails?: Array<object>;
}
