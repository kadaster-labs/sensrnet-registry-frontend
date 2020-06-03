import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Owner } from './model/owner';
import { Sensor } from './model/sensor';
import { Component, Inject, OnInit } from '@angular/core';
import {
  SearchComponentElementIds,
  SearchComponentEvent,
  SearchComponentEventTypes
} from 'generieke-geo-componenten-search';
import {
  FeatureCollectionForCoordinate, FeatureCollectionForLayer,
  MapComponentEvent,
  MapComponentEventTypes,
  MapService,
  SelectionService,
  MapComponentDrawTypes,
  DrawInteractionService
} from 'generieke-geo-componenten-map';
import { Dataset, DatasetTreeEvent, Service, Theme } from 'generieke-geo-componenten-dataset-tree';
import { HttpClient } from '@angular/common/http';
import { DatasetLegend } from 'generieke-geo-componenten-dataset-legend';
import {
  FeatureInfoCollection,
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType,
  FeatureInfoConfigService,
  FeatureInfoDisplayType,
  SortFilterConfig
} from 'generieke-geo-componenten-feature-info';
import { Subscription, Observable } from 'rxjs';
import { Coordinate } from 'ol/coordinate';
import { SensorService } from './services/sensor.service';
import { OwnerService } from './services/owner.service';
import { DataService } from './services/data.service';
import { FormGroup, FormControl } from '@angular/forms';

import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Style } from 'ol/style';
import Stroke from 'ol/style/Stroke';
import { SensorCreated } from './model/events/created.event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'SensRNet'
  mapName = 'srn';
  layers: Theme[];
  currentMapResolution: number = undefined;
  activeWmsDatasets: Dataset[] = [];
  hideTreeDataset = false;

  dataTabFeatureInfo: FeatureInfoCollection[];
  currentTabFeatureInfo: FeatureInfoCollection;
  activeGeojsonServices: Service[] = [];
  activeWmtsDatasets: Dataset[] = [];
  datasetsLegends: DatasetLegend[] = [];
  featureInfoDisplay: FeatureInfoDisplayType = FeatureInfoDisplayType.TABLE;

  iconCollapsed = 'fas fa-chevron-right';
  iconExpanded = 'fas fa-chevron-left';
  iconUnchecked = 'far fa-square';
  iconChecked = 'far fa-check-square';
  iconInfoUrl = 'fas fa-info-circle';

  private vectorSource;
  private vectorLayer;

  drawSubscription: Subscription;

  RegisterSensor = new FormGroup({
    name: new FormControl(''),
    aim: new FormControl(''),
    description: new FormControl(''),
    manufacturer: new FormControl(''),
    active: new FormControl(''),
    documentation: new FormControl(''),
    dataStreams: new FormControl(''),
    location: new FormControl('')
  });

  UpdateSensor = new FormGroup({
    name: new FormControl(''),
    aim: new FormControl(''),
    description: new FormControl(''),
    manufacturer: new FormControl(''),
    active: new FormControl(''),
    documentation: new FormControl(''),
    dataStreams: new FormControl(''),
    location: new FormControl('')
  });

  RegisterOwner = new FormGroup({
    organisation: new FormControl(''),
    website: new FormControl(''),
    contactPublic: new FormControl(''),
    contactPerson: new FormControl(''),
  });

  UpdateOwner = new FormGroup({
    organisation: new FormControl(''),
    website: new FormControl(''),
    contactPublic: new FormControl(''),
    contactPerson: new FormControl(''),
  });

  private sensors = [];

  constructor(private drawService: DrawInteractionService, private ownerService: OwnerService, private sensorService: SensorService, private httpClient: HttpClient, public mapService: MapService, private selectionService: SelectionService, private dataService: DataService) {
    this.selectionService.getObservable(this.mapName).subscribe(this.handleSelectionServiceEvents.bind(this))
  }

  ngOnInit(): void {
    this.dataService.connect();

    // subscribe to sensor events
    this.dataService.subscribeTo<any>('Sensors').subscribe((sensors: Array<any>) => {
      console.log(`Received sensors `);
      this.sensors = sensors;
      const features = sensors.map((sensor) => ({
        coordinates: [sensor.location.x, sensor.location.y],
        type: 'Point',
      }));

      this.vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures({
          features,
          type: 'FeatureCollection',
          }),
      });

      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: new Style({
          image: new CircleStyle({
            fill: null,
            radius: 5,
            stroke: new Stroke({color: 'red', width: 1}),
          }),
        }),
      });

      this.mapService.getMap(this.mapName).addLayer(this.vectorLayer);
    });

    // subscribe to sensor events
    const sensorCreated$: Observable<SensorCreated> = this.dataService.subscribeTo<SensorCreated>('SensorCreated');
    sensorCreated$.subscribe((newSensor: SensorCreated) => {
      console.log(`Sensor was created `);
      console.log(newSensor);

      this.sensors.push(newSensor);
      this.vectorSource.addFeature({
        coordinates: [newSensor.data.location.x, newSensor.data.location.y],
        type: 'Point',
      });
    });
  }

  TestRegisterSensor() {
    this.sensorService.registerSensor()
  }

  TestGetAllSensors() {
    this.sensorService.getAllSensors()
  }

  startDrawPoint() {
    this.drawService.startDrawInteraction(MapComponentDrawTypes.POINT, this.mapName);
    this.subscribeOnDrawEvents();
  }

  private subscribeOnDrawEvents() {
    if (!this.drawSubscription) {
      const interactionEventObservable = this.drawService.drawEventsObservableMap.get(this.mapName);
      if (interactionEventObservable) {
        this.drawSubscription = interactionEventObservable.subscribe(evt => {
          console.log('DrawInteractionEvent: ' + evt.type + '; Type geometry: ' + evt.drawType);
        });
      }
    }
  }

  clearDrawing(mapIndex: string) {
    this.drawService.clearDrawInteraction(this.mapName);
  }

  clearFeatures(mapIndex: string) {
    this.drawService.clearDrawInteractionLayer(this.mapName);
  }

  handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResult(event, 'srn');
  }

  clearSelection(mapIndex: string) {
    this.selectionService.clearSelection(this.mapName);
  }

  setSelectionMode(selectionMode: string) {
    if (selectionMode === 'single') {
      this.selectionService.setSingleselectMode(this.mapName);
    } else if (selectionMode === 'multi') {
      this.selectionService.setMultiselectMode(this.mapName);
    }
  }

  handleSelectionServiceEvents(event: MapComponentEvent) {
    if (event.type === MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED) {
      // clear dataFeatureInfo on singleclick
      this.dataTabFeatureInfo = [];
      this.mapService.clearSelectionLayer(event.mapName);
    } else if (event.type === MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED) {
      const result: FeatureCollectionForCoordinate = event.value;
      const featureinfoCollection: FeatureCollectionForLayer[] = result.featureCollectionForLayers;
      this.mapService.clearSelectionLayer(event.mapName);
      featureinfoCollection.forEach((featureinfo) => {
        this.mapService.addFeaturesToSelectionLayer(featureinfo.features, event.mapName);
      });
      this.dataTabFeatureInfo = [...featureinfoCollection];
    } else if (event.type === MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION) {
      this.dataTabFeatureInfo = [];
      this.mapService.clearSelectionLayer(event.mapName);
    }
  }

  handleFeatureInfoEvent(event: FeatureInfoComponentEvent) {
    if (event.type === FeatureInfoComponentEventType.SELECTEDTAB) {
      this.currentTabFeatureInfo = event.value;
    }
  }

  handleMapEvents(mapEvent: MapComponentEvent) {
    if (mapEvent.type === MapComponentEventTypes.ZOOMEND) {
      this.currentMapResolution = this.mapService.getMap(this.mapName).getView().getResolution();
    }
  }

  onFeatureInfoEvent(event: FeatureInfoComponentEvent) {
    if (event.type === FeatureInfoComponentEventType.SELECTEDTAB) {
      this.currentTabFeatureInfo = event.value;
    } else if (event.type === FeatureInfoComponentEventType.SELECTEDOBJECT) {
      this.mapService.clearHighlightLayer(this.mapName);
      if (event.value) { // er is een geselecteerd object
        this.mapService.addFeaturesToHighlightLayer([event.value], this.mapName);
      }
    }
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.RegisterSensor.value);
  }

};


