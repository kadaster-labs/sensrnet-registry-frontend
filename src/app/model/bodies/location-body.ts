import Geometry from 'ol/geom/Geometry';

export class LocationBody {
  public coordinates: [number, number];
  public type: Geometry;
  public baseObjectId: string;
}
