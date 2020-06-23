import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import proj4 from 'proj4';
import { Observable } from 'rxjs';

import { Overlay } from 'ol';
import Control from 'ol/control/Control';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import { Cluster } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Circle, Circle as CircleStyle, Fill, Icon, Style, Text } from 'ol/style';
import Stroke from 'ol/style/Stroke';

import { IDropdownSettings } from 'ng-multiselect-dropdown';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';

import { Dataset, DatasetTreeEvent, Theme } from 'generieke-geo-componenten-dataset-tree';
import { MapComponentEvent, MapComponentEventTypes, MapService } from 'generieke-geo-componenten-map';
import { SearchComponentEvent } from 'generieke-geo-componenten-search';

import { AuthenticationService } from '../services/authentication.service';

import { environment } from '../../environments/environment';
import { ISensor } from '../model/bodies/sensor-body';
import { Category, TypeBeacon, TypeCamera, TypeSensor } from '../model/bodies/sensorTypes';
import { EventType } from '../model/events/event-type';
import { Owner } from '../model/owner';
import { DataService } from '../services/data.service';
import { IRegisterSensorBody, SensorService } from '../services/sensor.service';
import { SensorInfo } from './../model/bodies/sensorInfo';
import { Theme as SensorTheme } from './../model/bodies/sensorTheme';

@Component({
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
})
export class ViewerComponent implements OnInit {
  public title = 'SensRNet';
  public mapName = 'srn';

  public sensorCategories = Category;
  public sensorCategoriesList: string[];
  public sensorTypes = TypeSensor;
  public sensorTypesList: string[];
  public typeDetailsList: string[];
  public beaconTypes = TypeBeacon;
  public beaconTypesList: string[];
  public cameraTypes = TypeCamera;
  public cameraTypesList: string[];
  public sensorThemes = SensorTheme;
  public sensorThemesList: string[];
  public dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    itemsShowLimit: 2,
    allowSearchFilter: false,
    enableCheckAll: false,
  };

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

  public registerOwnerSent = false;
  public registerSensorSent = false;

  public selectedSensor: ISensor;
  public paneSensorRegisterActive = false;
  public paneSensorUpdateActive = false;
  public paneOwnerRegisterActive = false;

  public registerSensorSubmitted = false;

  public RegisterSensor = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(6)]),
    aim: new FormControl(''),
    description: new FormControl(''),
    manufacturer: new FormControl('', Validators.required),
    active: new FormControl(''),
    documentationUrl: new FormControl('', Validators.required),
    location: new FormGroup({
      latitude: new FormControl(undefined, [Validators.required]),
      longitude: new FormControl(undefined, [Validators.required]),
      height: new FormControl(undefined, [Validators.required]),
      baseObjectId: new FormControl('non-empty'),
    }, this.locationValidator),
    typeName: new FormControl('', Validators.required),
    typeDetailsName: new FormControl('', Validators.required),
    theme: new FormControl([], Validators.required),
  });

  public RegisterOwner = new FormGroup({
    companyName: new FormControl(''),
    email: new FormControl(''),
    name: new FormControl(''),
    publicName: new FormControl(''),
    website: new FormControl(''),
  });

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs';
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
  private mapCoordinateWGS84: [];
  private mapCoordinateRD: [];

  public currentOwner: Owner;

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
    private sensorService: SensorService,
  ) {
    this.authenticationService.currentOwner.subscribe((x) => this.currentOwner = x);
  }

  public ngOnInit(): void {
    this.httpClient.get('/assets/layers.json').subscribe(
      (data) => {
        this.myLayers = data as Theme[];
      },
      (error) => {
      },
    );

    this.sensorCategoriesList = Object.keys(this.sensorCategories).filter(String);
    this.sensorThemesList = Object.keys(this.sensorThemes).filter(String);
    this.beaconTypesList = Object.keys(this.beaconTypes).filter(String);
    this.cameraTypesList = Object.keys(this.cameraTypes).filter(String);
    this.sensorTypesList = Object.keys(this.sensorTypes).filter(String);

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

    // subscribe to sensor events
    const sensorUpdated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorUpdated);
    sensorUpdated$.subscribe((newSensor: ISensor) => {
      console.log(`Socket.io heard that a Updated event was fired`);
      console.log(newSensor);
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

    this.addFindMeButton();
    this.onFormChanges();
  }

  public locationValidator(g: FormGroup) {
    return g.get('latitude').value && g.get('longitude') && g.get('height') && g.get('baseObjectId') ? null :
      {'required': true};
  }

  public updateSensor(updatedSensor: ISensor) {
    const props = this.sensorToFeatureProperties(updatedSensor);

    // update map
    const sensor = this.vectorSource.getFeatureById(updatedSensor._id);
    sensor.setProperties(props);

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
      this.removeHighlight();
      this.activeFeatureInfo = null;
      this.showInfo = false;

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

      if (this.selectLocation === true) {
        this.removeLocationFeatures();
        this.RegisterSensor.patchValue({
          location: {
            height: 0,
            latitude: mapCoordinateWGS84[1],
            longitude: mapCoordinateWGS84[0],
            baseObjectId: 'non-empty',
          },
        });
        const locationFeature = new Feature({
          geometry: new Point(mapCoordinateRD),
        });
        this.setLocation(locationFeature);
      }
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

  get form() {
    return this.RegisterSensor.controls;
  }

  public changeOpenInfo() {
    this.showInfo = !this.showInfo;
  }

  public SelectLocationOn() {
    this.selectLocation = true;
  }

  public SelectLocationOff() {
    this.selectLocation = false;
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
    this.SelectLocationOff();
    this.mapService.getMap(this.mapName).removeLayer(this.selectLocationLayer);
    console.log(this.showInfo);
    console.log(this.activeFeatureInfo);
  }

  public highlightFeature(feature: Feature) {
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

  public async submitRegisterSensor() {
    this.registerSensorSubmitted = true;

    // stop here if form is invalid
    if (this.RegisterSensor.invalid) {
      return;
    }

    console.log(`posting ${this.RegisterSensor.value}`);
    // TODO: perform extra validation
    const sensor: IRegisterSensorBody = {
      typeName: this.RegisterSensor.value.typeName,
      location: this.RegisterSensor.value.location || { x: 0, y: 0, z: 0 },
      dataStreams: this.RegisterSensor.value.dataStreams || [],

      active: this.RegisterSensor.value.active || false,
      aim: this.RegisterSensor.value.aim,
      description: this.RegisterSensor.value.description,
      documentationUrl: this.RegisterSensor.value.documentationUrl,
      manufacturer: this.RegisterSensor.value.manufacturer,
      name: this.RegisterSensor.value.name,
      theme: this.RegisterSensor.value.theme || [],
    };

    try {
      const result = await this.sensorService.register(sensor);

      console.log(`Sensor was succesfully posted, received id ${result}`);
      this.clearLocationLayer();
      this.togglePane('SensorRegister');
    } catch (error) {
      console.log(error);
    }
  }

  public submitCreateOwner() {
    console.log('Create owner');

    console.warn(this.RegisterOwner.value);
    const owner: object = {
      companyName: this.RegisterOwner.value.companyName,
      email: this.RegisterOwner.value.email,
      name: this.RegisterOwner.value.name,
      publicName: this.RegisterOwner.value.publicName,
      ssoId: 'local',
      website: this.RegisterOwner.value.website,
    };

    this.httpClient.post(`${environment.apiUrl}/Owner`, owner, {}).subscribe((data: any) => {
      console.log(`Owner was succesfully posted, received id ${data.ownerId}`);

      this.registerOwnerSent = true;
      setTimeout(() => {
        this.registerOwnerSent = false;
      }, 2500);
    }, (err) => {
      console.log(err);
    });
  }

  private toggleSensorRegisterPane(active?: boolean): void {
    if (active === undefined) {
      active = !this.paneSensorRegisterActive;
    }

    if (!active) {
      this.clearLocationLayer();
    }

    this.paneSensorRegisterActive = active;
  }

  private toggleSensorUpdatePane(active?: boolean): void {
    if (active === undefined) {
      active = !this.paneSensorUpdateActive;
    }

    this.paneSensorUpdateActive = active;
  }

  private toggleOwnerRegisterPane(active?: boolean): void {
    if (active === undefined) {
      active = !this.paneSensorUpdateActive;
    }

    this.paneOwnerRegisterActive = active;
  }

  public togglePane(pane: string) {
    switch (pane) {
      case 'SensorRegister':
        this.toggleSensorRegisterPane();
        this.toggleSensorUpdatePane(false);
        this.toggleOwnerRegisterPane(false);
        break;
      case 'SensorUpdate':
        this.toggleSensorRegisterPane(false);
        this.toggleSensorUpdatePane();
        this.toggleOwnerRegisterPane(false);
        break;
      case 'OwnerRegister':
        this.toggleSensorRegisterPane(false);
        this.toggleSensorUpdatePane(false);
        this.toggleOwnerRegisterPane();
        break;
      default:
        this.toggleSensorRegisterPane(false);
        this.toggleSensorUpdatePane(false);
        this.toggleOwnerRegisterPane(false);
        break;
    }
  }

  private zoomToPoint(point: Point) {
    const view = this.mapService.getMap('srn').getView();
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

  private onFormChanges() {
    this.RegisterSensor.get('typeName').valueChanges.subscribe((category: Category) => {
      switch (category) {
        case Category.Beacon:
          this.typeDetailsList = this.beaconTypesList;
          break;
        case Category.Camera:
          this.typeDetailsList = this.cameraTypesList;
          break;
        case Category.Sensor:
          this.typeDetailsList = this.sensorTypesList;
          break;
        default:
          this.typeDetailsList = [];
          break;
      }
    });
  }

  public onSelectTheme(event) {
    const control: AbstractControl = this.RegisterSensor.controls.theme;
    const themes = control.value;
    themes.push(event);
    control.setValue(themes);
  }

  public onDeselectTheme(event) {
    const control: AbstractControl = this.RegisterSensor.controls.theme;
    let themes = control.value;
    themes = themes.filter((theme: string) => theme !== event);
    control.setValue(themes);
  }

  private addFindMeButton() {
    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = '<button title="Locate me">◎</button>';
    locate.addEventListener('click', () => {
      this.findMe();
    });

    this.mapService.getMap('srn').addControl(new Control({
      element: locate,
    }));
    // console.log(this.mapService.getMap().getControls());
  }

  public logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
