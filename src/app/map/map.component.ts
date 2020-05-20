import { Component, OnInit } from '@angular/core';
import { SearchComponentEvent } from 'generieke-geo-componenten-search';
import { MapService, SelectionService, MapComponentEvent, MapComponentEventTypes, FeatureCollectionForCoordinate, FeatureCollectionForLayer } from 'generieke-geo-componenten-map';
import { FeatureInfoCollection, FeatureInfoComponentEvent, FeatureInfoComponentEventType } from 'generieke-geo-componenten-feature-info';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  mapName = 'srn';

  constructor(public mapService: MapService, private selectionService: SelectionService) {
    this.selectionService.getObservable(this.mapName).subscribe(this.handleSelectionServiceEvents.bind(this))

  }

  ngOnInit(): void {
  }

  handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResultAndMark(event, 'srn');
  }

  dataTabFeatureInfo: FeatureInfoCollection[] = [];

  handleSelectionServiceEvents(event: MapComponentEvent) {
    if (event.type === MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED) {
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
    }
  }

  currentTabFeatureInfo: FeatureInfoCollection;

  handleFeatureInfoEvent(event: FeatureInfoComponentEvent) {
    if (event.type === FeatureInfoComponentEventType.SELECTEDTAB) {
      this.currentTabFeatureInfo = event.value;
    }
  }

};


