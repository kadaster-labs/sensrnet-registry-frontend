import { Component, Input, OnInit } from '@angular/core';

import { MapService } from '../map/map.service';
import OlMap from 'ol/Map';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import OlTileLayer from 'ol/layer/Tile';
import BaseTileLayer from 'ol/layer/BaseTile';
import BaseLayer from 'ol/layer/Base';

/**
 * Add layers to a map
 */
@Component({
  selector: 'app-layer',
  template: ''
})

export class LayerComponent implements OnInit {
  /** Layer */
  @Input() layer;

  /** Define the service */
  constructor(
    private mapService: MapService,
  ) { }

  /** Add layer to the map */
  ngOnInit() {
    const map: OlMap = this.mapService.getMap();
    let layer: BaseLayer;
    switch (this.layer) {
      case 'watercolor': {
        layer = new OlTileLayer({
          source: new Stamen({ layer: 'watercolor' })
        });
        break;
      }
      case 'labels': {
        layer = new OlTileLayer({
          source: new Stamen({ layer: 'toner-labels' })
        });
        break;
      }
      case 'OSM':
      default: {
        layer = new OlTileLayer({
          source: new OSM()
        });
      }
    }
    layer.set('', this.layer);
    map.addLayer(layer);
  }
}
