import { Theme as SensorTheme } from './../model/bodies/sensorTheme';
import { sensorInfo } from './../model/bodies/sensorInfo';
import { Component, OnInit } from '@angular/core';
import { SearchComponentEvent } from 'generieke-geo-componenten-search';
import {
  MapComponentEvent,
  MapComponentEventTypes,
  MapService,
} from 'generieke-geo-componenten-map';
import { HttpClient } from '@angular/common/http';
import {
  FeatureInfoCollection,
} from 'generieke-geo-componenten-feature-info';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import proj4 from 'proj4';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Cluster } from 'ol/source';
import { Circle as CircleStyle, Style, Fill, Text, Icon, Circle } from 'ol/style';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import { ISensor } from '../model/bodies/sensor-body';
import { Theme, Dataset, DatasetTreeEvent } from 'generieke-geo-componenten-dataset-tree';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { Owner } from '../model/owner';
import { Category, TypeSensor, TypeCamera, TypeBeacon } from '../model/bodies/sensorTypes';
import { EventType } from '../model/events/event-type';
import { environment } from 'src/environments/environment';
import Point from 'ol/geom/Point';
import Control from 'ol/control/Control';
import { Overlay } from 'ol';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import SelectCluster from 'ol-ext/interaction/SelectCluster';

@Component({
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
})
export class ViewerComponent implements OnInit {
  title = 'SensRNet'
  mapName = 'srn';

  sensorCategories = Category;
  sensorCategoriesList: string[];
  sensorTypes = TypeSensor;
  sensorTypesList: string[];
  subtypesList: string[];
  beaconTypes = TypeBeacon;
  beaconTypesList: string[];
  cameraTypes = TypeCamera;
  cameraTypesList: string[];
  sensorThemes = SensorTheme;
  sensorThemesList: string[];

  currentMapResolution: number = undefined;
  dataTabFeatureInfo: FeatureInfoCollection[];
  currentTabFeatureInfo: FeatureInfoCollection;
  activeDatasets: Dataset[] = [];
  activeWmtsDatasets: Dataset[] = [];
  activeWmsDatasets: Dataset[] = [];
  activeFeatureInfo: sensorInfo[] = [];
  highlightLayer: VectorLayer;
  highlightSource: VectorSource;
  selectLocationLayer: VectorLayer;
  selectLocationSource: VectorSource;
  clusterLayer: AnimatedCluster;
  overlay: Overlay
  selectLocation = false;
  locationFeature = Feature;
  locationList = ["Select Location", "Confirm", "Clear"]

  public showInfo = false;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private clusterSource: Cluster;
  private selectCluster: SelectCluster;

  public registerOwnerSent = false;
  public registerSensorSent = false;

  RegisterSensor = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(6)]),
    aim: new FormControl(''),
    description: new FormControl(''),
    manufacturer: new FormControl('', Validators.required),
    active: new FormControl(''),
    documentation: new FormControl('', Validators.required),
    location: new FormControl({}, Validators.required),
    typeName: new FormControl('', Validators.required),
    subtypeName: new FormControl('', Validators.required),
    theme: new FormControl('', Validators.required)
  });

  UpdateSensor = new FormGroup({
    name: new FormControl(''),
    aim: new FormControl(''),
    description: new FormControl(''),
    manufacturer: new FormControl(''),
    active: new FormControl(''),
    documentation: new FormControl(''),
    typeName: new FormControl(''),
    location: new FormControl('')
  });

  RegisterOwner = new FormGroup({
    companyName: new FormControl(''),
    email: new FormControl(''),
    name: new FormControl(''),
    publicName: new FormControl(''),
    website: new FormControl(''),
  });

  UpdateOwner = new FormGroup({
    organisation: new FormControl(''),
    website: new FormControl(''),
    contactPublic: new FormControl(''),
    contactPerson: new FormControl(''),
  });

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs'
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'
  private mapCoordinateWGS84: [];
  private mapCoordinateRD: [];

  private sensors = [];

  currentOwner: Owner;

  myLayers: Theme[];
  hideTreeDataset = false;

  iconCollapsed = 'fas fa-chevron-right';
  iconExpanded = 'fas fa-chevron-left';
  iconUnchecked = 'far fa-square';
  iconChecked = 'far fa-check-square';
  iconInfoUrl = 'fas fa-info-circle';

  iconDir = '/assets/icons/'

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private httpClient: HttpClient,
    public mapService: MapService,
    private dataService: DataService,
  ) {
    this.authenticationService.currentOwner.subscribe(x => this.currentOwner = x);
  }

  ngOnInit(): void {
    this.httpClient.get('/assets/layers.json').subscribe(
      data => {
        this.myLayers = data as Theme[];
      },
      error => {
      }
    );

    this.sensorCategoriesList = Object.keys(this.sensorCategories).filter(String);
    this.sensorThemesList = Object.keys(this.sensorThemes).filter(String);
    this.beaconTypesList = Object.keys(this.beaconTypes).filter(String);
    this.cameraTypesList = Object.keys(this.cameraTypes).filter(String);
    this.sensorTypesList = Object.keys(this.sensorTypes).filter(String);

    this.dataService.connect();
    this.dataService.subscribeTo('Sensors').subscribe((sensors: Array<ISensor>) => {
      console.log(`Received ${sensors.length} sensors`);
      this.sensors = sensors;
      const featuresData: Array<object> = sensors.map((sensor) => this.sensorToFeature(sensor));

      const features: Array<Feature> = (new GeoJSON()).readFeatures({
        features: featuresData,
        type: 'FeatureCollection',
      });

      const styleCache = {}

      let styleCluster = function (feature) {
        let numberOfFeatures = feature.get('features').length
        let style: Style

        if (numberOfFeatures === 1) {
          let active = feature.get('features')[0].values_.active
          let sensorType = feature.get('features')[0].values_.typeName[0]
          if (!active) {
            numberOfFeatures = 'inactive' + sensorType
            style = styleCache[numberOfFeatures]
          }
          else {
            numberOfFeatures = 'active' + sensorType
            style = styleCache[numberOfFeatures]
          }
        }
        else {
          style = styleCache[numberOfFeatures]
        }
        if (!style) {
          if (typeof numberOfFeatures === 'string') {
            let active = feature.get('features')[0].values_.active
            let sensorType = feature.get('features')[0].values_.typeName[0]
            if (!active) {
              style = new Style({
                image: new Icon({
                  opacity: 0.25,
                  scale: 0.25,
                  src: `/assets/icons/${sensorType}.png`,
                })
              });
            }
            else {
              style = new Style({
                image: new Icon({
                  opacity: 0.9,
                  scale: 0.25,
                  src: `/assets/icons/${sensorType}.png`,
                })
              });
            }
          }
          else {
            style = new Style({
              image: new CircleStyle({
                radius: 15,
                fill: new Fill({
                  color: 'rgba(19, 65, 115, 0.9)'
                })
              }),
              text: new Text({
                text: numberOfFeatures.toString(),
                font: 'bold 11px "Helvetica Neue", Helvetica,Arial, sans-serif',
                fill: new Fill({
                  color: '#ffffff'
                }),
                textAlign: 'center'
              })
            })
          }
          styleCache[numberOfFeatures] = style;
        }
        return style;
      }

      let styleSelectedCluster = function () {
        var img = new Circle({
          radius: 8,
          fill: new Fill({
            color: 'rgba(19, 65, 115, 0.9)'
          })
        });
        var style1 = new Style({
          image: img,
          stroke: new Stroke({
            color: '#000000',
            width: 0.5
          }),
        });
        return style1
      }

      this.vectorSource = new VectorSource({
        features,
      });

      this.clusterSource = new Cluster({
        distance: 40,
        source: this.vectorSource
      });

      this.clusterLayer = new AnimatedCluster({
        name: 'Cluster',
        source: this.clusterSource,
        style: styleCluster
      });

      this.clusterLayer.setZIndex(10);
      this.mapService.getMap(this.mapName).addLayer(this.clusterLayer);

      console.log(this.mapService.getMap(this.mapName))

      this.selectCluster = new SelectCluster({
        pointRadius: 30,
        spiral: true,
        featureStyle: styleSelectedCluster,
        style: styleCluster
      });

      this.mapService.getMap(this.mapName).addInteraction(this.selectCluster);
    });

    // subscribe to sensor events
    const sensorCreated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorRegistered);
    sensorCreated$.subscribe((newSensor: ISensor) => {
      console.log(`Socket.io heard that a new SensorCreated event was fired`);
      console.log(newSensor);

      this.sensors.push(newSensor);

      const feature: object = this.sensorToFeature(newSensor);

      const newFeatures: Array<Feature> = (new GeoJSON()).readFeatures({
        features: [feature],
        type: 'FeatureCollection',
      });

      this.vectorSource.addFeatures(newFeatures);
    });

    this.addFindMeButton();
    this.onFormChanges();
  }

  handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResult(event, 'srn');
  }

  handleMapEvents(mapEvent: MapComponentEvent) {
    const map = this.mapService.getMap(this.mapName);
    console.log(this.currentMapResolution = map.getView().getZoom());

    if (mapEvent.type === MapComponentEventTypes.ZOOMEND) {
      this.currentMapResolution = map.getView().getResolution();
    }
    if (mapEvent.type === MapComponentEventTypes.SINGLECLICK) {
      const mapCoordinateRD = mapEvent.value.coordinate
      const mapCoordinateWGS84 = proj4(this.epsgRD, this.epsgWGS84, mapCoordinateRD)
      this.removeHighlight()
      this.activeFeatureInfo = []
      this.showInfo = false

      map.forEachFeatureAtPixel(mapEvent.value.pixel, (data, layer) => {
        const features = data.getProperties().features;
        const zoomlevel = map.getView().getZoom()
        if (features.length === 1) {
          const feature = features[0]
          const geometry = new Feature({
            geometry: feature.values_.geometry
          })
          this.highlightFeature(geometry)
          this.activeFeatureInfo.push(this.featureToSensorInfo(feature))
          console.log(this.activeFeatureInfo)
          this.showInfo = true;
        }

        else if (features.length > 1) {
          if (zoomlevel > 19) {
            // nasty solution...
            const geometry = new Feature({
              geometry: features[0].values_.geometry
            })
            this.highlightFeature(geometry)
            let features_ = features.map((feature: Feature) => this.featureToSensorInfo(feature))
            this.activeFeatureInfo = features_
            console.log(this.activeFeatureInfo)
            this.showInfo = true;
          }
          // clusters not on the same place
          else {
          }
        }
      },
        {
          layerFilter: function (layer) {
            return layer.getProperties().source instanceof Cluster;
          }
        });

      if (this.selectLocation === true) {
        this.removeLocationFeatures()
        this.RegisterSensor.patchValue({
          location: {
            baseObjectId: 'IDK',
            height: 0,
            latitude: mapCoordinateWGS84[1],
            longitude: mapCoordinateWGS84[0],
          }
        })
        const locationFeature = new Feature({
          geometry: new Point(mapCoordinateRD)
        })
        this.setLocation(locationFeature)
      }
    }
  }

  handleDatasetTreeEvents(event: DatasetTreeEvent) {
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
        this.activeWmsDatasets = this.activeWmsDatasets.filter(dataset =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmsDatasets = this.activeWmsDatasets.filter(dataset => dataset.services.length > 0);
      } else if (gedeactiveerdeService.type === 'wmts') {
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter(dataset =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter(dataset => dataset.services.length > 0);
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
      properties: {
        name: newSensor.name,
        typeName: newSensor.typeName,
        active: newSensor.active,
        aim: newSensor.aim,
        description: newSensor.description,
        manufacturer: newSensor.manufacturer,
        theme: newSensor.theme,
      },
      type: 'Feature',
    };
  }

  featureToSensorInfo(feature: Feature) {
    const s_info = new sensorInfo(
      feature.get("name"),
      feature.get("typeName"),
      feature.get("active"),
      feature.get("aim"),
      feature.get("description"),
      feature.get("manufacturer"),
      feature.get("theme")
    )
    return s_info
  }

  get form() {
    return this.RegisterSensor.controls;
  }

  SelectLocationOn() {
    this.selectLocation = true;
  }

  SelectLocationOff() {
    this.selectLocation = false;
  }

  private setLocation(feature: Feature) {
    this.selectLocationSource = new VectorSource({
      features: [feature]
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
            color: '#F34E15'
          })
        })
      })
    })
    this.selectLocationLayer.setZIndex(25);
    this.mapService.getMap(this.mapName).addLayer(this.selectLocationLayer);
  }

  removeLocationFeatures() {
    this.mapService.getMap(this.mapName).removeLayer(this.selectLocationLayer);
  }

  clearLocationLayer() {
    this.SelectLocationOff();
    this.mapService.getMap(this.mapName).removeLayer(this.selectLocationLayer);
  }

  private highlightFeature(feature: Feature) {
    this.highlightSource = new VectorSource({
      features: [feature]
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
      })], opacity: 0.7
    });
    this.highlightLayer.setZIndex(20);
    this.mapService.getMap(this.mapName).addLayer(this.highlightLayer);
  }

  private removeHighlight() {
    this.mapService.getMap(this.mapName).removeLayer(this.highlightLayer);
  }

  submitCreateSensor() {
    console.warn(this.RegisterSensor.value);
    const sensor: object = {
      active: this.RegisterSensor.value.active || false,
      aim: this.RegisterSensor.value.aim,
      description: this.RegisterSensor.value.description,
      documentation: this.RegisterSensor.value.documentation,
      location: this.RegisterSensor.value.location || { x: 0, y: 0, z: 0 },
      manufacturer: this.RegisterSensor.value.manufacturer,
      name: this.RegisterSensor.value.name,
      dataStreams: this.RegisterSensor.value.dataStreams || [],
      typeName: this.RegisterSensor.value.typeName || [],
      theme: this.RegisterSensor.value.theme || [],
    };

    this.httpClient.post(`${environment.apiUrl}/Sensor`, sensor, {}).subscribe((data: any) => {
      console.log(`Sensor was succesfully posted, received id ${data.sensorId}`);
      this.clearLocationLayer()

      this.registerSensorSent = true;
      setTimeout(() => {
        this.registerSensorSent = false;
      }, 2500);
    }, err => {
      console.log(err);
    });
  }

  submitCreateOwner() {
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
    }, err => {
      console.log(err);
    });
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
          this.subtypesList = this.beaconTypesList;
          break;
        case Category.Camera:
          this.subtypesList = this.cameraTypesList;
          break;
        case Category.Sensor:
          this.subtypesList = this.sensorTypesList;
          break;
        default:
          this.subtypesList = [];
          break;
      }
    });
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
    console.log(this.mapService.getMap().getControls());
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
};
