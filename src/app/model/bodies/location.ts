export interface ISensorLocation {
  type: 'Point';
  /** [latitude, longitude, height] */
  coordinates: [number, number, number];
  baseObjectId: string;
}
