export interface ISensorSchema {
  sensorId: string;
  nodeId: string;
  ownerIds?: Array<string>;
  name?: string;
  location: {
      x: number,
      y: number,
      z: number,
      epsgCode: number,
      baseObjectId: string,
  };
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
