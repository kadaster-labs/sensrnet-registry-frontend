import { Component, Inject, OnInit } from '@angular/core';
import {
  SearchComponentElementIds,
  SearchComponentEvent,
  SearchComponentEventTypes
} from 'generieke-geo-componenten-search';
import {
  DrawInteractionService, FeatureCollectionForCoordinate, FeatureCollectionForLayer,
  MapComponentDrawTypes,
  MapComponentEvent,
  MapComponentEventTypes,
  MapService,
  MeasureEventTypes,
  MeasureService,
  SelectionService
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
import { Subscription } from 'rxjs';
import { PrintComponentEvent, PrintConfig } from 'generieke-geo-componenten-print';
import { Coordinate } from 'ol/coordinate';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
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

  constructor(private httpClient: HttpClient, public mapService: MapService, private selectionService: SelectionService) {
    this.selectionService.getObservable(this.mapName).subscribe(this.handleSelectionServiceEvents.bind(this))
    this.httpClient.get('/assets/layers.json').subscribe(
      data => {
        this.layers = data as Theme[];
      },
      error => {
        // error
      }
    );
  }


  ngOnInit(): void {
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

  handleDatasetTreeEvents(event: DatasetTreeEvent) {
    /*
     * Activeren en deactiveren van kaartlagen
     */
    if (event.type === 'layerActivated') {
      const geactiveerdeService = event.value.services[0];
      if (geactiveerdeService.type === 'wms') {
        this.activeWmsDatasets.push(event.value);
      } else if (geactiveerdeService.type === 'wmts') {
        this.activeWmtsDatasets.push(event.value);
      } else if (geactiveerdeService.type === 'geojson') {
        this.activeGeojsonServices.push(geactiveerdeService);
      }
    } else if (event.type === 'layerDeactivated') {
      const gedeactiveerdeService = event.value.services[0];
      if (gedeactiveerdeService.type === 'wms') {
        this.activeWmsDatasets = this.activeWmsDatasets.filter(dataset =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmsDatasets = this.activeWmsDatasets.filter(dataset => dataset.services.length > 0);
      } else if (gedeactiveerdeService.type === 'geojson') {
        this.activeGeojsonServices = this.activeGeojsonServices.filter(service => service.url !== gedeactiveerdeService.url);
      } else if (gedeactiveerdeService.type === 'wmts') {
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter(dataset =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter(dataset => dataset.services.length > 0);
      }
    }

    /*
     * Aan en uitzetten van legend
     */
    if (event.type === 'layerActivated') {
      const activatedLayer = event.value.services[0].layers[0];
      const datasetLegend = this.datasetsLegends.find(object => object.name === event.value.datasetName);

      if (datasetLegend !== null && datasetLegend !== undefined) {
        datasetLegend.legendUrls.push(activatedLayer.legendUrl);
      } else {
        const newDatasetLegend = new DatasetLegend(event.value.datasetName, activatedLayer.technicalName, [activatedLayer.legendUrl]);
        this.datasetsLegends.push(newDatasetLegend);
      }
    } else if (event.type === 'layerDeactivated') {
      const deActivatedLayer = event.value.services[0].layers[0];
      const datasetLegend = this.datasetsLegends.find(datasetsLegend => datasetsLegend.name === event.value.datasetName);

      datasetLegend.legendUrls = datasetLegend.legendUrls.filter(legendUrl => legendUrl !== deActivatedLayer.legendUrl);

      if (datasetLegend.legendUrls.length === 0) {
        this.datasetsLegends = this.datasetsLegends.filter(dataset => dataset.name !== datasetLegend.name);
      }
    }
  }

  activeDatasets: Dataset[] = [];

  datasetTreeEventToMap(event: DatasetTreeEvent) {
    /*
     * Activeren en deactiveren van kaartlagen
     */
    if (event.type === 'layerActivated') {
      this.activeDatasets.push(event.value);
    } else if (event.type === 'layerDeactivated') {
      const gedeactiveerdeService = event.value.services[0];
      this.activeDatasets = this.activeDatasets.filter(dataset =>
        dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
      this.activeDatasets = this.activeDatasets.filter(dataset => dataset.services.length > 0);
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

};


