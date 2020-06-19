export interface ILocation {
  type: 'Point';
  /** [latitude, longitude, height] */
  coordinates: [number, number, number];
  baseObjectId: string;
}
