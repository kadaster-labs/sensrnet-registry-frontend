import { Injectable } from '@angular/core';

import { Map, View } from 'ol';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';
import { Extent } from 'ol/extent';

/**
 * Openlayers map service to acces maps by id
 * Inject the service in the class that have to use it and access the map with the getMap method.
 */
@Injectable({
  providedIn: 'root'
})
export class MapService {

  /**
   * List of Openlayer map objects [ol.Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html)
   */
  private map = {};

  constructor() { }

  /**
   * Create a map
   * @param id map id
   * @returns [ol.Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html) the map
   */
  private createMap(id): Map {
    proj4.defs('EPSG:28992',
      '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 ' +
      '+y_0=463000 +ellps=bessel +units=m +no_defs');
    register(proj4);
    const dutchProjection = getProjection('EPSG:28992');
    const extent: Extent = [-285401.92, 22598.08, 595401.92, 903401.92];
    dutchProjection.setExtent(extent);

    const map = new Map({
      target: id,
      view: new View({
        center: [155000, 463000],
        extent,
        projection: dutchProjection,
        zoom: 3,
      })
    });

    return map;
  }

  /**
   * Get a map. If it doesn't exist it will be created.
   * @param id id of the map or an objet with a getId method (from mapid service), default 'map'
   */
  getMap(id?): Map {
    id = id || 'map';

    if (!this.map[id]) {
      this.map[id] = this.createMap(id); // Create map if not exist
    }

    return this.map[id]; // return the map
  }

  /** Get all maps
   * NB: to access the complete list of maps you should use the ngAfterViewInit() method to have all maps instanced.
   * @return the list of maps
   */
  getMaps() {
    return this.map;
  }

  /** Get all maps
   * NB: to access the complete list of maps you should use the ngAfterViewInit() method to have all maps instanced.
   * @return array of maps
   */
  getArrayMaps() {
    return Object.values(this.map);
  }

  /** Delete a maps
   * @param id map id
   */
  deleteMap(id?): void {
    id = id || 'map';

    if (!this.map[id]) {
      return;
    }

    delete this.map[id];
  }
}
