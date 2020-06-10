export interface ISensor {
  _id: string;
  nodeId: string;
  ownerIds?: Array<string>;
  name?: string;
  location: {
      type: 'Point',
      coordinates: Array<number>,
  };
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
