import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import proj4 from 'proj4';
import { Observable } from 'rxjs';

import { Overlay } from 'ol';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import { Cluster } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Circle, Circle as CircleStyle, Fill, Icon, Style, Text } from 'ol/style';
import Stroke from 'ol/style/Stroke';

import SelectCluster from 'ol-ext/interaction/SelectCluster';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';

import { Dataset, DatasetTreeEvent, Theme } from 'generieke-geo-componenten-dataset-tree';
import { MapComponentEvent, MapComponentEventTypes, MapService } from 'generieke-geo-componenten-map';
import { SearchComponentEvent } from 'generieke-geo-componenten-search';

import { AuthenticationService } from '../services/authentication.service';

import { ISensor } from '../model/bodies/sensor-body';
import { EventType } from '../model/events/event-type';
import { Owner } from '../model/owner';
import { DataService } from '../services/data.service';
import { SensorInfo } from './../model/bodies/sensorInfo';
import { LocationService } from '../services/location.service';
import Geometry from 'ol/geom/Geometry';

@Component({
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit {
  public title = 'SensRNet';
  public mapName = 'srn';

  public currentMapResolution: number = undefined;
  public currentZoomlevel: number = undefined;
  public activeWmtsDatasets: Dataset[] = [];
  public activeWmsDatasets: Dataset[] = [];
  public activeFeatureInfo: SensorInfo;
  public highlightLayer: VectorLayer;
  public highlightSource: VectorSource;
  public selectLocationLayer: VectorLayer;
  public selectLocationSource: VectorSource;
  public clusterLayer: AnimatedCluster;
  public overlay: Overlay;
  public selectLocation = false;
  public locationFeature = Feature;

  public showInfo = false;

  private vectorSource: VectorSource;
  private clusterSource: Cluster;
  private selectCluster: SelectCluster;

  public selectedSensor: ISensor;
  public paneSensorRegisterActive = false;
  public paneSensorUpdateActive = false;
  public paneOwnerUpdateActive = false;

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs';
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  public myLayers: Theme[];
  public hideTreeDataset = false;

  public iconCollapsed = 'fas fa-chevron-right';
  public iconExpanded = 'fas fa-chevron-left';
  public iconUnchecked = 'far fa-square';
  public iconChecked = 'far fa-check-square';
  public iconInfoUrl = 'fas fa-info-circle';

  public iconDir = '/assets/icons/';

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private httpClient: HttpClient,
    public mapService: MapService,
    private dataService: DataService,
    private locationService: LocationService,
  ) {}

  public ngOnInit(): void {
    this.httpClient.get('/assets/layers.json').subscribe(
      (data) => {
        this.myLayers = data as Theme[];
      },
      () => {
      },
    );

    this.dataService.connect();
    this.dataService.subscribeTo('Sensors').subscribe((sensors: Array<ISensor>) => {
      console.log(`Received ${sensors.length} sensors`);
      console.log(sensors);
      const featuresData: Array<object> = sensors.map((sensor) => this.sensorToFeature(sensor));

      const features: Array<Feature> = (new GeoJSON()).readFeatures({
        features: featuresData,
        type: 'FeatureCollection',
      });

      const styleCache = {};

      const styleCluster = (feature) => {
        let numberOfFeatures = feature.get('features').length;
        let style: Style;

        if (numberOfFeatures === 1) {
          const active = feature.get('features')[0].values_.active;
          const sensorType = feature.get('features')[0].values_.typeName[0];
          if (!active) {
            numberOfFeatures = 'inactive' + sensorType;
            style = styleCache[numberOfFeatures];
          } else {
            numberOfFeatures = 'active' + sensorType;
            style = styleCache[numberOfFeatures];
          }
        } else {
          style = styleCache[numberOfFeatures];
        }
        if (!style) {
          if (typeof numberOfFeatures === 'string') {
            const active = feature.get('features')[0].values_.active;
            const sensorType = feature.get('features')[0].values_.typeName;
            if (!active) {
              style = new Style({
                image: new Icon({
                  opacity: 0.25,
                  scale: 0.25,
                  src: `/assets/icons/${sensorType}.png`,
                }),
              });
            } else {
              style = new Style({
                image: new Icon({
                  opacity: 0.9,
                  scale: 0.25,
                  src: `/assets/icons/${sensorType}.png`,
                }),
              });
            }
          } else {
            style = new Style({
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
            });
          }
          styleCache[numberOfFeatures] = style;
        }
        return style;
      };

      const styleSelectedCluster = () => {
        const style1 = new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({
              color: 'rgba(19, 65, 115, 0.9)',
            }),
          }),
          // ,
          // stroke: new Stroke({
          //   color: '#000000',
          //   width: 0.5
          // }),
        });
        return style1;
      };

      this.vectorSource = new VectorSource({
        features,
      });

      this.clusterSource = new Cluster({
        distance: 40,
        source: this.vectorSource,
      });

      this.clusterLayer = new AnimatedCluster({
        name: 'Cluster',
        source: this.clusterSource,
        style: styleCluster,
      });

      this.clusterLayer.setZIndex(10);
      this.mapService.getMap(this.mapName).addLayer(this.clusterLayer);

      this.selectCluster = new SelectCluster({
        pointRadius: 20,
        featureStyle: styleSelectedCluster,
        style: styleCluster,
      });

      this.mapService.getMap(this.mapName).addInteraction(this.selectCluster);

      this.selectCluster.getFeatures().on(['add'], (event) => {
        this.removeHighlight();
        const activeFeatures = event.element.get('features');
        if (activeFeatures.length === 1) {
          const feature = activeFeatures[0];
          const geometry = new Feature({
            geometry: feature.values_.geometry,
          });
          const activeFeature = new SensorInfo(
            feature.get('name'),
            feature.get('typeName'),
            feature.get('active'),
            feature.get('aim'),
            feature.get('description'),
            feature.get('manufacturer'),
            feature.get('theme'),
          );
          this.activeFeatureInfo = activeFeature;
          this.selectedSensor = feature.values_.sensor;
          this.showInfo = true;
          this.highlightFeature(geometry);
        }
        if (activeFeatures.length > 1) {
          this.removeHighlight();
          this.showInfo = false;
          this.activeFeatureInfo = null;
        }
      });
    });

    // subscribe to sensor events
    const sensorRegistered$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorRegistered);
    sensorRegistered$.subscribe((newSensor: ISensor) => {
      console.log(`Socket.io heard that a new SensorCreated event was fired`);
      console.log(newSensor);

      const feature: object = this.sensorToFeature(newSensor);

      const newFeatures: Array<Feature> = (new GeoJSON()).readFeatures({
        features: [feature],
        type: 'FeatureCollection',
      });

      this.vectorSource.addFeatures(newFeatures);
    });

    // subscribe to sensor location events
    const sensorUpdated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorUpdated);
    sensorUpdated$.subscribe((newSensor: ISensor) => {
      console.log(`Socket.io heard that a Updated event was fired`);
      this.updateSensor(newSensor);
    });

    // subscribe to sensor events
    const sensorActivated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorActivated);
    sensorActivated$.subscribe((newSensor: ISensor) => {
      console.log(`Socket.io heard that a Activated event was fired`);
      this.updateSensor(newSensor);
    });

    // subscribe to sensor events
    const sensorDeactivated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorDeactivated);
    sensorDeactivated$.subscribe((newSensor: ISensor) => {
      console.log(`Socket.io heard that a Deactivated event was fired`);
      this.updateSensor(newSensor);
    });

    // subscribe to sensor events
    const sensorLocationUpdated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorRelocated);
    sensorLocationUpdated$.subscribe((newSensor: ISensor) => {
      console.log(`Socket.io heard that a LocationUpdated event was fired`);
      this.updateSensor(newSensor);
    });

    this.locationService.showLocation$.subscribe((sensor) => {
      this.removeLocationFeatures();

      if (!sensor) {
        this.clearLocationLayer();
        this.toggleSensorRegisterPane(false);
        return;
      }

      if (!this.paneSensorRegisterActive && !this.paneSensorUpdateActive) {
        return;
      }

      const locationFeature = new Feature({
        geometry: new Point(proj4(this.epsgWGS84, this.epsgRD, [sensor.coordinates[1], sensor.coordinates[0]])),
      });
      this.setLocation(locationFeature);
    });

    // this.addFindMeButton();
  }

  public updateSensor(updatedSensor: ISensor) {
    const props = this.sensorToFeatureProperties(updatedSensor);

    // update map
    const sensor = this.vectorSource.getFeatureById(updatedSensor._id);
    sensor.setProperties(props);
    const geom: Geometry = new Point(proj4(this.epsgWGS84, this.epsgRD, [
      updatedSensor.location.coordinates[0], updatedSensor.location.coordinates[1]
    ]));
    sensor.setGeometry(geom);
    this.removeHighlight();
    this.clearLocationLayer();
    this.highlightFeature(sensor);

    // update feature info
    this.activeFeatureInfo = new SensorInfo(
      updatedSensor.name,
      updatedSensor.typeName,
      updatedSensor.active,
      updatedSensor.aim,
      updatedSensor.description,
      updatedSensor.manufacturer,
      updatedSensor.theme,
    );

    // update sensor update pane
    this.selectedSensor = updatedSensor;
  }

  public handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResult(event, 'srn');
  }

  public handleMapEvents(mapEvent: MapComponentEvent) {
    const map = this.mapService.getMap(this.mapName);
    this.currentZoomlevel = map.getView().getZoom();
    // console.log(this.currentZoomlevel)

    if (mapEvent.type === MapComponentEventTypes.ZOOMEND) {
      this.currentMapResolution = map.getView().getResolution();
    }
    if (mapEvent.type === MapComponentEventTypes.SINGLECLICK) {
      const mapCoordinateRD = mapEvent.value.coordinate;
      const mapCoordinateWGS84 = proj4(this.epsgRD, this.epsgWGS84, mapCoordinateRD);

      if (!this.paneSensorUpdateActive) {
        this.removeHighlight();
        this.activeFeatureInfo = null;
        this.showInfo = false;
      }

      // this.removeHighlight()
      // this.activeFeatureInfo = []
      // this.showInfo = false

      // map.forEachFeatureAtPixel(mapEvent.value.pixel, (data, layer) => {
      // const features = data.getProperties().features;
      // const zoomlevel = map.getView().getZoom()
      // if (features.length === 1) {
      //   console.log(features)
      //   const feature = features[0]
      //   const geometry = new Feature({
      //     geometry: feature.values_.geometry
      //   })
      //   this.highlightFeature(geometry)
      //   this.activeFeatureInfo.push(this.featureToSensorInfo(feature))
      //   this.showInfo = true;
      // }
      // else if (features.length > 1) {
      //   // if (zoomlevel > 19) {
      //     // nasty solution...
      //     const geometry = new Feature({
      //       geometry: features[0].values_.geometry
      //     })
      //     this.highlightFeature(geometry)
      //     let features_ = features.map((feature: Feature) => this.featureToSensorInfo(feature))
      //     this.activeFeatureInfo = features_
      //     this.showInfo = true;
      //   }
      //   // clusters not on the same place
      //   else {
      //   // }
      // }
      // },
      //   {
      //     layerFilter: function (layer) {
      //       return layer.getProperties().source instanceof Cluster;
      //     }
      //   });

      this.locationService.setLocation({
        type: 'Point',
        coordinates: [mapCoordinateWGS84[1], mapCoordinateWGS84[0], 0],
        baseObjectId: 'iets'
      });
    }
  }

  public handleDatasetTreeEvents(event: DatasetTreeEvent) {
    if (event.type === 'layerActivated') {
      const geactiveerdeService = event.value.services[0];
      if (geactiveerdeService.type === 'wms') {
        this.activeWmsDatasets.push(event.value);
      } else if (geactiveerdeService.type === 'wmts') {
        this.activeWmtsDatasets.push(event.value);
      }
    } else if (event.type === 'layerDeactivated') {
      const gedeactiveerdeService = event.value.services[0];
      if (gedeactiveerdeService.type === 'wms') {
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) => dataset.services.length > 0);
      } else if (gedeactiveerdeService.type === 'wmts') {
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) => dataset.services.length > 0);
      }
    }
  }

  private sensorToFeatureProperties(sensor: ISensor) {
    return {
      sensor,
      name: sensor.name,
      typeName: sensor.typeName,
      active: sensor.active,
      aim: sensor.aim,
      description: sensor.description,
      manufacturer: sensor.manufacturer,
      theme: sensor.theme,
    };
  }

  private sensorToFeature(newSensor: ISensor): object {
    return {
      geometry: {
        coordinates: proj4(this.epsgWGS84, this.epsgRD, [newSensor.location.coordinates[0], newSensor.location.coordinates[1]]),
        type: 'Point',
      },
      id: newSensor._id,
      properties: this.sensorToFeatureProperties(newSensor),
      type: 'Feature',
    };
  }

  public featureToSensorInfo(feature: Feature) {
    const info = new SensorInfo(
      feature.get('name'),
      feature.get('typeName'),
      feature.get('active'),
      feature.get('aim'),
      feature.get('description'),
      feature.get('manufacturer'),
      feature.get('theme'),
    );
    return info;
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
    console.log(this.showInfo);
    console.log(this.activeFeatureInfo);
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
            color: '#FF0000 ',
            width: 1,
          }),
        }),
      }), new Style({
        image: new CircleStyle({
          radius: 25,
          stroke: new Stroke({
            color: '#FF0000 ',
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
    console.log('remove highlight');
    this.selectedSensor = undefined;
  }

  public toggleSensorRegisterPane(active?: boolean): void {
    if (active === undefined) {
      active = !this.paneSensorRegisterActive;
    }

    if (!active) {
      this.clearLocationLayer();
    }

    this.paneSensorRegisterActive = active;
  }

  public toggleSensorUpdatePane(active?: boolean): void {
    if (active === undefined) {
      active = !this.paneSensorUpdateActive;
    }

    this.paneSensorUpdateActive = active;
  }

  public toggleOwnerUpdatePane(active?: boolean): void {
    if (active === undefined) {
      active = !this.paneOwnerUpdateActive;
    }

    this.paneOwnerUpdateActive = active;
  }

  public togglePane(pane: string) {
    switch (pane) {
      case 'SensorRegister':
        this.toggleSensorRegisterPane();
        this.toggleSensorUpdatePane(false);
        this.toggleOwnerUpdatePane(false);
        break;
      case 'SensorUpdate':
        this.toggleSensorRegisterPane(false);
        this.toggleSensorUpdatePane();
        this.toggleOwnerUpdatePane(false);
        break;
      case 'OwnerUpdate':
        this.toggleSensorRegisterPane(false);
        this.toggleSensorUpdatePane(false);
        this.toggleOwnerUpdatePane();
        break;
      default:
        this.toggleSensorRegisterPane(false);
        this.toggleSensorUpdatePane(false);
        this.toggleOwnerUpdatePane(false);
        break;
    }
  }

  private zoomToPoint(point: Point) {
    const view = this.mapService.getMap('srn').getView();
    view.fit(point, {
      maxZoom: 10,
    });
  }

  // private zoomToPosition(position: Position) {
  //   const coords = [position.coords.longitude, position.coords.latitude];
  //   const coordsRD = proj4(this.epsgWGS84, this.epsgRD, coords);
  //   const point = new Point(coordsRD);
  //   this.zoomToPoint(point);
  // }

  public async logout() {
    await this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
