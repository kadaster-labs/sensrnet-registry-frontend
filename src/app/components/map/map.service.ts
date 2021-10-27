import { Injectable } from '@angular/core';
import { Map, View } from 'ol';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { Extent, getTopLeft } from 'ol/extent';
import { Group } from 'ol/layer';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import { TileWMS } from 'ol/source';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import proj4 from 'proj4';

/**
 * Openlayers map service to acces maps by id
 * Inject the service in the class that have to use it and access the map with the getMap method.
 */
@Injectable({
    providedIn: 'root',
})
export class MapService {
    extent: Extent = [-285401.92, 22598.08, 595401.92, 903401.92];
    projection: Projection;

    /**
     * List of Openlayer map objects [ol.Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html)
     */
    private map = {};

    constructor() {
        proj4.defs(
            'EPSG:28992',
            '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 ' +
                '+y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,' +
                '-1.8703473836068,4.0812 +no_defs',
        );
        register(proj4);

        this.projection = getProjection('EPSG:28992');
        this.projection.setExtent(this.extent);
    }

    private createLayers(): BaseLayer[] {
        // Resoluties (pixels per meter) van de zoomniveaus:
        const resolutions = [
            3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21,
        ];
        // Er zijn 15 (0 tot 14) zoomniveaus beschikbaar van de WMTS-service voor de BRT-Achtergrondkaart:
        const matrixIds = new Array(15);
        for (let z = 0; z < 15; ++z) {
            matrixIds[z] = 'EPSG:28992:' + z;
        }

        const bagLayer = new TileLayer({
            title: $localize`BAG`,
            visible: false,
            opacity: 0.85,
            source: new TileWMS({
                attributions: 'Kaartgegevens: &copy; <a href="https://www.kadaster.nl">Kadaster</a>',
                url: 'https://geodata.nationaalgeoregister.nl/bag/wms/v1_1?',
                // projection,
                params: { LAYERS: 'pand', TILED: true },
                wrapX: false,
            }),
        } as BaseLayerOptions);

        const overlayGroup = new Group({
            title: $localize`Overlays`,
            layers: [bagLayer],
        } as GroupLayerOptions);

        const brtLayer = new TileLayer({
            title: $localize`BRT`,
            type: 'base',
            visible: true,
            opacity: 1,
            source: new WMTS({
                attributions: 'Kaartgegevens: &copy; <a href="https://www.kadaster.nl">Kadaster</a>',
                url: 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?',
                layer: 'grijs',
                matrixSet: 'EPSG:28992',
                format: 'image/png',
                projection: this.projection,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(this.extent),
                    resolutions,
                    matrixIds,
                }),
                style: 'default',
                wrapX: false,
            }),
        } as BaseLayerOptions);

        const luchtfotoLayer = new TileLayer({
            title: $localize`Aerial photo`,
            type: 'base',
            visible: true,
            source: new WMTS({
                attributions: 'Kaartgegevens: &copy; <a href="https://www.kadaster.nl">Kadaster</a>',
                url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0?',
                layer: 'Actueel_ortho25',
                matrixSet: 'EPSG:28992',
                format: 'image/png',
                projection: this.projection,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(this.extent),
                    resolutions,
                    matrixIds,
                }),
                style: 'default',
                wrapX: false,
            }),
        } as BaseLayerOptions);

        const baseLayers = new Group({
            title: $localize`Base maps`,
            layers: [luchtfotoLayer, brtLayer],
        } as GroupLayerOptions);

        return [baseLayers, overlayGroup];
    }

    private createMap(id): Map {
        const map = new Map({
            controls: defaultControls().extend([
                new ScaleLine({
                    units: 'metric',
                }),
            ]),
            target: id,
            view: new View({
                center: [155000, 463000],
                projection: this.projection,
                extent: this.extent,
                zoom: 3,
            }),
            layers: this.createLayers(),
        });

        return map;
    }

    /**
     * Get a map. If it doesn't exist it will be created.
     */
    getMap(id?): Map {
        id = id || 'map';

        if (!this.map[id]) {
            this.map[id] = this.createMap(id); // Create map if not exist
        }

        return this.map[id]; // return the map
    }

    deleteMap(id?): void {
        id = id || 'map';

        if (!this.map[id]) {
            return;
        }

        delete this.map[id];
    }
}
