import proj4 from 'proj4';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Cluster } from 'ol/source';
import Stroke from 'ol/style/Stroke';
import { FitOptions } from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import Control from 'ol/control/Control';
import VectorLayer from 'ol/layer/Vector';
import { extend, Extent } from 'ol/extent';
import VectorSource from 'ol/source/Vector';
import { getBottomLeft, getTopRight } from 'ol/extent';
import OverlayPositioning from 'ol//OverlayPositioning';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import { Circle as CircleStyle, Fill, Icon, Style, Text } from 'ol/style';

import { SearchComponentEvent } from 'generieke-geo-componenten-search';
import { Dataset, DatasetTreeEvent, Theme } from 'generieke-geo-componenten-dataset-tree';
import { MapComponentEvent, MapComponentEventTypes, MapService } from 'generieke-geo-componenten-map';

import { ISensor } from '../../model/bodies/sensor-body';
import { Category } from '../../model/bodies/sensorTypes';
import { ModalService } from '../../services/modal.service';
import { SensorService } from '../../services/sensor.service';
import { LocationService } from '../../services/location.service';
import { ConnectionService } from '../../services/connection.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() searchBarHeight;
  @Input() clearLocationHighLight = true;

  constructor(
    private router: Router,
    private mapService: MapService,
    private httpClient: HttpClient,
    private modalService: ModalService,
    private sensorService: SensorService,
    private locationService: LocationService,
    private connectionService: ConnectionService,
  ) {}

  public mapName = 'srn';
  public subscriptions = [];

  public mapUpdated;
  public overlayVisible = false;
  public selectedSensor: ISensor;

  public popupOverlay: Overlay;
  public clusterSource: Cluster;
  public vectorSource: VectorSource;
  public highlightLayer: VectorLayer;
  public selectCluster: SelectCluster;
  public highlightSource: VectorSource;
  public clusterLayer: AnimatedCluster;
  public selectLocationLayer: VectorLayer;
  public selectLocationSource: VectorSource;

  public activeWmsDatasets: Dataset[] = [];
  public activeWmtsDatasets: Dataset[] = [];
  public currentZoomlevel: number = undefined;
  public currentMapResolution: number = undefined;

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 ' +
    '+y_0=463000 +ellps=bessel +units=m +no_defs';
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  public myLayers: Theme[];
  public hideTreeDataset = false;

  public clusterMaxZoom = 15;

  public iconCollapsed = 'fas fa-chevron-right';
  public iconExpanded = 'fas fa-chevron-left';
  public iconUnchecked = 'far fa-square';
  public iconChecked = 'far fa-check-square';
  public iconInfoUrl = 'fas fa-info-circle';

  private static sensorToFeatureProperties(sensor: ISensor) {
    return {
      sensor,
      name: sensor.name,
      category: sensor.category,
      typeName: sensor.typeName,
      active: sensor.active,
      aim: sensor.aim,
      description: sensor.description,
      manufacturer: sensor.manufacturer,
      theme: sensor.theme,
      nodeId: sensor.nodeId,
    };
  }

  public getStyleCache() {
    const styleCache = {};
    for (const item of [true, false]) {
      for (const item1 of Object.keys(Category).filter(String)) {
        for (const item2 of [true, false]) {
          switch (item2) {
            case true:
              const styleNameActive = item + '_' + item1 + '_active';
              const styleActive = [new Style({
                image: new CircleStyle({
                  radius: 15,
                  fill: new Fill({
                    color: this.getNodeColor(item, 0.9),
                  }),
                  stroke: new Stroke({
                    color: '#fff',
                    width: 1.5
                  })
                })
              }), new Style({
                image: new Icon({
                  scale: 0.25,
                  src: `/assets/icons/${item1}_op.png`
                })
              })
              ];

              for (const style of Object.values(styleActive)) {
                style.getImage().load();
              }
              styleCache[styleNameActive] = styleActive;
              break;

            case false:
              const styleNameInactive = item + '_' + item1 + '_inactive';
              const styleInActive = [new Style({
                image: new CircleStyle({
                  radius: 15,
                  fill: new Fill({
                    color: this.getNodeColor(item, 0.25),
                  }),
                  stroke: new Stroke({
                    color: '#fff',
                    width: 1.5
                  })
                })
              }), new Style({
                image: new Icon({
                  scale: 0.25,
                  src: `/assets/icons/${item1}_op.png`
                })
              })
              ];

              for (const style of Object.values(styleInActive)) {
                style.getImage().load();
              }
              styleCache[styleNameInactive] = styleInActive;

              break;
          }
        }
      }
    }

    return styleCache;
  }

  public initMap() {
    const features: Array<Feature> = new GeoJSON().readFeatures({
      features: [],
      type: 'FeatureCollection',
    });

    const styleCache = this.getStyleCache();
    const styleCluster = (feature) => {
      let style: Style[];

      const FEATURES_ = feature.get('features');
      let numberOfFeatures = FEATURES_.length;
      if (numberOfFeatures === 1) {
        const active = feature.get('features')[0].values_.active;
        const category = feature.get('features')[0].values_.category;
        const ownsSensor = this.ownsSensor(feature.get('features')[0].values_.sensor);

        if (!active) {
          numberOfFeatures = `${ownsSensor}_${category}_inactive`;
          style = styleCache[numberOfFeatures];
        } else {
          numberOfFeatures = `${ownsSensor}_${category}_active`;
          style = styleCache[numberOfFeatures];
        }
      } else {
        style = styleCache[numberOfFeatures];
      }

      if (!style) {
        style = [new Style({
          image: new CircleStyle({
            radius: 15,
            fill: new Fill({
              color: 'rgba(19, 65, 115, 0.9)',
            }),
          }),
          text: new Text({
            text: numberOfFeatures.toString(),
            font: 'bold 11px "Helvetica Neue", Helvetica,Arial, sans-serif',
            fill: new Fill({
              color: '#ffffff',
            }),
            textAlign: 'center',
          }),
        })];
        styleCache[numberOfFeatures] = style;
      }

      return style;
    };

    const styleSelectedCluster = (feature) => {
      let styleFeatures;
      const zoomLevel = this.mapService.getMap(this.mapName).getView().getZoom();
      if (feature.values_.hasOwnProperty('selectclusterfeature') && zoomLevel > this.clusterMaxZoom) {
        const active = feature.get('features')[0].values_.active;
        const sensorType = feature.get('features')[0].values_.typeName[0];
        const ownsSensor = this.ownsSensor(feature.get('features')[0].values_.sensor);

        let style: Style[];
        if (active) {
          styleFeatures = `${ownsSensor}_${sensorType}_active`;
          style = styleCache[styleFeatures];
        } else {
          styleFeatures = `${ownsSensor}_${sensorType}_inactive`;
          style = styleCache[styleFeatures];
        }

        return style;
      }
    };

    this.vectorSource = new VectorSource({
      features
    });

    this.clusterSource = new Cluster({
      distance: 40,
      source: this.vectorSource
    });

    this.clusterLayer = new AnimatedCluster({
      name: 'Cluster',
      source: this.clusterSource,
      style: styleCluster,
    });

    const map = this.mapService.getMap(this.mapName);
    this.clusterLayer.setZIndex(10);
    map.addLayer(this.clusterLayer);

    this.selectCluster = new SelectCluster({
      pointRadius: 40,
      style: styleCluster,
      featureStyle: styleSelectedCluster,
    });
    map.addInteraction(this.selectCluster);

    this.popupOverlay = new Overlay({
      autoPan: false,
      positioning: OverlayPositioning.BOTTOM_CENTER,
      element: document.getElementById('popup')
    });
    map.addOverlay(this.popupOverlay);

    this.selectCluster.getFeatures().on(['add'], (event) => {
      this.removeHighlight();

      const activeFeatures = event.element.get('features');
      if (activeFeatures.length === 1) {
        const feature = activeFeatures[0];
        const geometry = new Feature({
          geometry: feature.values_.geometry,
        });
        this.selectedSensor = feature.values_.sensor;
        this.showOverlay(feature.values_.geometry.flatCoordinates);

        this.highlightFeature(geometry);
      } else if (activeFeatures.length > 1) {
        this.removeHighlight();
        this.hideOverlay();
      }
    });
  }

  public updateMap(sensors) {
    const featuresData: Array<object> = sensors.map((sensor) => this.sensorToFeature(sensor));
    const features: Array<Feature> = new GeoJSON().readFeatures({
      features: featuresData,
      type: 'FeatureCollection',
    });

    this.vectorSource.clear();
    this.vectorSource.addFeatures(features);
  }

  public showOverlay(coordinates) {
    this.overlayVisible = true;
    this.popupOverlay.setPosition(coordinates);
    this.popupOverlay.getElement().classList.remove('hidden');
  }

  public hideOverlay() {
    this.overlayVisible = false;
    this.popupOverlay.getElement().classList.add('hidden');
  }

  public getNodeColor(ownerType: boolean, opacity: number) {
    return ownerType ? `rgba(0,160,60, ${opacity})` : `rgba(19, 65, 115, ${opacity})`;
  }

  public updateSensor(updatedSensor: ISensor) {
    const props = MapComponent.sensorToFeatureProperties(updatedSensor);

    const sensor = this.vectorSource.getFeatureById(updatedSensor._id);
    if (sensor) {  // In case the sensor is currently visible on the map: update map.
      sensor.setProperties(props);
      const geom: Geometry = new Point(proj4(this.epsgWGS84, this.epsgRD, [
        updatedSensor.location.coordinates[0], updatedSensor.location.coordinates[1]
      ]));
      sensor.setGeometry(geom);
      this.clearLocationLayer();

      if (this.selectedSensor && this.selectedSensor._id === updatedSensor._id) {
        this.selectedSensor = updatedSensor;  // In case the sensor is selected: update overlay.
      }
    }
  }

  public sensorDeleted(deletedSensor: ISensor) {
    this.locationService.hideLocationHighlight();

    const sensor = this.vectorSource.getFeatureById(deletedSensor._id);
    if (sensor) {  // In case the sensor is currently visible on the map: update map.
      if (this.selectedSensor && this.selectedSensor._id === deletedSensor._id) {  // In case the sensor is selected.
        this.hideOverlay();
        this.selectedSensor = null;
      }
      this.vectorSource.removeFeature(sensor);
    }
  }

  public handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResult(event, this.mapName);
  }

  public handleMapEvents(mapEvent: MapComponentEvent) {
    const map = this.mapService.getMap(this.mapName);

    if (mapEvent.type === MapComponentEventTypes.ZOOMEND) {
      this.currentMapResolution = map.getView().getResolution();
      this.currentZoomlevel = this.mapService.getMap(this.mapName).getView().getZoom();
    } else if (mapEvent.type === MapComponentEventTypes.SINGLECLICK) {
      const mapCoordinateRD = mapEvent.value.coordinate;
      const mapCoordinateWGS84 = proj4(this.epsgRD, this.epsgWGS84, mapCoordinateRD);

      this.hideOverlay();
      this.removeHighlight();

      this.locationService.setLocation({
        type: 'Point',
        coordinates: [mapCoordinateWGS84[1], mapCoordinateWGS84[0], 0],
        baseObjectId: 'placeholder'
      });

      map.forEachFeatureAtPixel(mapEvent.value.pixel, (data) => {
        const features = data.getProperties().features;

        // check if feature is a cluster with multiple features
        if (features.length < 2) {
          return;
        }

        // determine extent for new view
        const extent: Extent = features[0].getGeometry().getExtent().slice(0) as Extent;
        features.forEach((f: Feature) => { extend(extent, f.getGeometry().getExtent()); });

        // if we're already zoomed in, zoom in no more. Setting maxZoom in fit() also does this to some extent, however,
        // in that case the camera is also centered. Returning early here also prevents the unnecessary panning.
        if (map.getView().getZoom() > this.clusterMaxZoom) {
          return;
        }

        const size = this.mapService.getMap(this.mapName).getSize();  // [width, height]
        const fitOptions: FitOptions = {
          duration: 1000,
          maxZoom: this.clusterMaxZoom + 1,
          padding: [size[1] * 0.2, size[0] * 0.2, size[1] * 0.2, size[0] * 0.2],  // up, right, down, left
          size,
        };
        this.mapService.getMap(this.mapName).getView().fit(extent, fitOptions);
      });
    }
  }

  public handleDatasetTreeEvents(event: DatasetTreeEvent) {
    if (event.type === 'layerActivated') {
      const deactivatedService = event.value.services[0];
      if (deactivatedService.type === 'wms') {
        this.activeWmsDatasets.push(event.value);
      } else if (deactivatedService.type === 'wmts') {
        this.activeWmtsDatasets.push(event.value);
      }
    } else if (event.type === 'layerDeactivated') {
      const deactivatedService = event.value.services[0];
      if (deactivatedService.type === 'wms') {
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== deactivatedService.layers[0].technicalName);
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) => dataset.services.length > 0);
      } else if (deactivatedService.type === 'wmts') {
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== deactivatedService.layers[0].technicalName);
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) => dataset.services.length > 0);
      }
    }
  }

  private sensorToFeature(newSensor: ISensor): object {
    return {
      geometry: {
        coordinates: proj4(this.epsgWGS84, this.epsgRD, [newSensor.location.coordinates[0], newSensor.location.coordinates[1]]),
        type: 'Point',
      },
      id: newSensor._id,
      properties: MapComponent.sensorToFeatureProperties(newSensor),
      type: 'Feature',
    };
  }

  private setLocation(feature: Feature) {
    this.selectLocationSource = new VectorSource({
      features: [feature],
    });
    this.selectLocationLayer = new VectorLayer({
      source: this.selectLocationSource,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: '#F34E15',
            width: 2,
          }),
          fill: new Fill({
            color: '#F34E15',
          }),
        }),
      }),
    });
    this.selectLocationLayer.setZIndex(25);
    this.mapService.getMap(this.mapName).addLayer(this.selectLocationLayer);
  }

  public removeLocationFeatures() {
    this.mapService.getMap(this.mapName).removeLayer(this.selectLocationLayer);
  }

  public clearLocationLayer() {
    this.mapService.getMap(this.mapName).removeLayer(this.selectLocationLayer);
  }

  public highlightFeature(feature: Feature) {
    this.mapService.getMap(this.mapName).removeLayer(this.highlightLayer);
    this.highlightSource = new VectorSource({
      features: [feature],
    });
    this.highlightLayer = new VectorLayer({
      source: this.highlightSource,
      style: [new Style({
        image: new CircleStyle({
          radius: 20,
          stroke: new Stroke({
            color: '#FF0000',
            width: 2,
          }),
        }),
      })], opacity: 0.7,
    });
    this.highlightLayer.setZIndex(20);
    this.mapService.getMap(this.mapName).addLayer(this.highlightLayer);
  }

  public removeHighlight() {
    this.mapService.getMap(this.mapName).removeLayer(this.highlightLayer);
  }

  private zoomToPoint(point: Point) {
    const view = this.mapService.getMap(this.mapName).getView();
    view.fit(point, {
      maxZoom: 10,
    });
  }

  private zoomToPosition(position: Position) {
    const coords = [position.coords.longitude, position.coords.latitude];
    const coordsRD = proj4(this.epsgWGS84, this.epsgRD, coords);
    const point = new Point(coordsRD);
    this.zoomToPoint(point);
  }

  private findMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        this.zoomToPosition(position);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  private addFindMeButton() {
    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = '<button title="Locate me">◎</button>';
    locate.addEventListener('click', () => {
      this.findMe();
    });

    this.mapService.getMap(this.mapName).addControl(new Control({
      element: locate,
    }));
  }

  public ownsSensor(sensor): boolean {
    const claim = this.connectionService.currentClaim;
    return claim && claim.organizationId && sensor.organizations ? sensor.organizations.some(e => e.id === claim.organizationId) : false;
  }

  public async editSensor(): Promise<void> {
    await this.router.navigate([`/sensor/${this.selectedSensor._id}`]);
  }

  public async deleteSensor(): Promise<void> {
    this.modalService.confirm('Please confirm.', 'Do you really want to delete the sensor?')
      .then((confirmed) => {
        if (confirmed) {
          this.sensorService.unregister(this.selectedSensor._id);
        }
      })
      .catch(() => console.log('User dismissed the dialog.'));
  }

  public async ngOnInit(): Promise<void> {
    this.locationService.hideLocationMarker();
    if (this.clearLocationHighLight) {
      this.locationService.hideLocationHighlight();
    }
    this.initMap();

    const onMoveEnd = async (evt) => {
      const evtMap = evt.map;

      const currentRequestTimestamp = new Date().valueOf();
      if (!this.mapUpdated || currentRequestTimestamp - this.mapUpdated > 500) {  // In case of e.g. resizing window.
        this.mapUpdated = currentRequestTimestamp;

        const extent = evtMap.getView().calculateExtent(evtMap.getSize());
        const topRight = proj4(this.epsgRD, this.epsgWGS84, getTopRight(extent));
        const bottomLeft = proj4(this.epsgRD, this.epsgWGS84, getBottomLeft(extent));

        const sensors = await this.sensorService.getSensors(bottomLeft[0].toString(), bottomLeft[1].toString(),
          topRight[0].toString(), topRight[1].toString());

        if (sensors) {
          this.updateMap(sensors);
        }
      }
    };
    this.mapService.getMap(this.mapName).on('moveend', onMoveEnd);

    this.subscriptions.push(this.httpClient.get('/assets/layers.json').subscribe((data) => {
      this.myLayers = data as Theme[];
    }, () => {}));

    const { onRegister, onUpdate, onDelete } = await this.sensorService.subscribe();

    this.subscriptions.push(onRegister.subscribe((newSensor: ISensor) => {
      const feature: object = this.sensorToFeature(newSensor);
      const newFeature = new GeoJSON().readFeature(feature);
      this.vectorSource.addFeature(newFeature);
    }));

    this.subscriptions.push(onUpdate.subscribe((updatedSensor: ISensor) => {
      this.updateSensor(updatedSensor);
    }));

    this.subscriptions.push(onDelete.subscribe((deletedSensor: ISensor) => {
      this.sensorDeleted(deletedSensor);
    }));

    this.subscriptions.push(this.locationService.showLocation$.subscribe((sensor) => {
      this.removeLocationFeatures();

      if (sensor) {
        const locationFeature = new Feature({
          geometry: new Point(proj4(this.epsgWGS84, this.epsgRD, [sensor.coordinates[1], sensor.coordinates[0]])),
        });
        this.setLocation(locationFeature);
      } else {
        this.clearLocationLayer();
      }
    }));

    this.subscriptions.push(this.locationService.locationHighlight$.subscribe((sensor) => {
      this.removeHighlight();

      if (sensor) {
        const geometry = new Feature({
          geometry: new Point(proj4(this.epsgWGS84, this.epsgRD, [sensor.coordinates[0], sensor.coordinates[1]]))
        });

        this.highlightFeature(geometry);
      }
    }));

    if (window.location.protocol === 'https') {
      this.addFindMeButton();
    }
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
