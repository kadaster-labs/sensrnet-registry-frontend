import proj4 from 'proj4';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

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
import { extend, Extent, getBottomLeft, getTopRight } from 'ol/extent';
import VectorSource from 'ol/source/Vector';
import OverlayPositioning from 'ol//OverlayPositioning';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import { Circle as CircleStyle, Fill, Icon, Style, Text } from 'ol/style';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { SearchComponentEvent } from 'generieke-geo-componenten-search';
import { Dataset, DatasetTreeEvent, Theme } from 'generieke-geo-componenten-dataset-tree';
import { MapComponentEvent, MapComponentEventTypes, MapService } from 'generieke-geo-componenten-map';

import { IDevice } from '../../model/bodies/device-model';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { DeviceService } from '../../services/device.service';
import { LocationService } from '../../services/location.service';
import { ConnectionService } from '../../services/connection.service';
import { Category, getCategoryTranslation } from '../../model/bodies/sensorTypes';


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
    private alertService: AlertService,
    private modalService: ModalService,
    private deviceService: DeviceService,
    private locationService: LocationService,
    private connectionService: ConnectionService,
    private oidcSecurityService: OidcSecurityService,
  ) { }

  public mapName = 'srn';
  public subscriptions = [];

  public mapUpdated;
  public overlayVisible = false;
  public selectedDevice: IDevice;

  public getCategoryTranslation = getCategoryTranslation;

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

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 ' +
    '+y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,' +
    '-1.8703473836068,4.0812 +no_defs';
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  public myLayers: Theme[];
  public hideTreeDataset = false;

  public clusterMaxZoom = 15;

  public iconCollapsed = 'fas fa-chevron-right';
  public iconExpanded = 'fas fa-chevron-left';
  public iconUnchecked = 'far fa-square';
  public iconChecked = 'far fa-check-square';
  public iconInfoUrl = 'fas fa-info-circle';

  public locateMeString = $localize`:@@map.locate:Locate me`;
  public confirmTitleString = $localize`:@@map.confirm.title:Please confirm`;
  public confirmBodyString = $localize`:@@map.confirm.body:Do you really want to delete the device?`;
  public geoLocationNotSupportedString = $localize`:@@map.geo.support:Geolocation is not supported by this browser.`;

  private static sensorToFeatureProperties(device: IDevice) {
    return {
      device,
      name: device.name,
      canEdit: device.canEdit,
      description: device.description,
      category: device.category,
      connectivity: device.connectivity,
      locationDetails: device.locationDetails,
      location: device.location,
    };
  }

  public getStyleCache() {
    const styleCache = {};
    for (const item of [true, false]) {
      for (const item1 of Object.keys(Category)) {
        const styleName = `${item}_${item1}`;
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
        })];

        for (const style of Object.values(styleActive)) {
          style.getImage().load();
        }

        styleCache[styleName] = styleActive;
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
      const numberOfFeatures = FEATURES_.length;
      if (numberOfFeatures === 1) {
        const category = feature.get('features')[0].values_.category;
        const ownsDevice = this.ownsDevice(feature.get('features')[0].values_.device);

        style = styleCache[`${ownsDevice}_${category}`];
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
      const zoomLevel = this.mapService.getMap(this.mapName).getView().getZoom();
      if (feature.values_.hasOwnProperty('selectclusterfeature') && zoomLevel > this.clusterMaxZoom) {
        const category = feature.get('features')[0].values_.category;
        const ownsDevice = this.ownsDevice(feature.get('features')[0].values_.device);
        return styleCache[`${ownsDevice}_${category}`];
      }
    };

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
        this.selectedDevice = feature.values_.device;
        this.showOverlay(feature.values_.geometry.flatCoordinates);

        this.highlightFeature(geometry);
      } else if (activeFeatures.length > 1) {
        this.removeHighlight();
        this.hideOverlay();
      }
    });
  }

  public updateMap(devices) {
    const featuresData: Array<object> = devices.map((device) => this.deviceToFeature(device));
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

  public updateDevice(updatedDevice: IDevice) {
    const props = MapComponent.sensorToFeatureProperties(updatedDevice);

    const device = this.vectorSource.getFeatureById(updatedDevice._id);
    if (device) {  // In case the sensor is currently visible on the map: update map.
      device.setProperties(props);
      const geom: Geometry = new Point(proj4(this.epsgWGS84, this.epsgRD, [
        updatedDevice.location.coordinates[0], updatedDevice.location.coordinates[1]
      ]));
      device.setGeometry(geom);
      this.clearLocationLayer();

      if (this.selectedDevice && this.selectedDevice._id === updatedDevice._id) {
        this.selectedDevice = updatedDevice;  // In case the sensor is selected: update overlay.
      }
    }
  }

  public deviceDeleted(deletedDevice: IDevice) {
    this.locationService.hideLocationHighlight();
    const device = this.vectorSource.getFeatureById(deletedDevice._id);
    if (device) {  // In case the sensor is currently visible on the map: update map.
      if (this.selectedDevice && this.selectedDevice._id === deletedDevice._id) {  // In case the sensor is selected.
        this.hideOverlay();
        this.selectedDevice = null;
      }
      this.vectorSource.removeFeature(device);
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
        coordinates: [mapCoordinateWGS84[1], mapCoordinateWGS84[0], 0]
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

  private deviceToFeature(newDevice: IDevice): object {
    return {
      geometry: {
        coordinates: proj4(this.epsgWGS84, this.epsgRD,
          [newDevice.location.coordinates[0], newDevice.location.coordinates[1]]),
        type: 'Point',
      },
      id: newDevice._id,
      properties: MapComponent.sensorToFeatureProperties(newDevice),
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
      alert(this.geoLocationNotSupportedString);
    }
  }

  private addFindMeButton() {
    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = `<button title="${this.locateMeString}">◎</button>`;
    locate.addEventListener('click', () => {
      this.findMe();
    });

    this.mapService.getMap(this.mapName).addControl(new Control({
      element: locate,
    }));
  }

  public ownsDevice(device): boolean {
    return device.canEdit;
  }

  public async editDevice(): Promise<void> {
    await this.router.navigate([`/device/${this.selectedDevice._id}`]);
  }

  public async deleteDevice(): Promise<void> {
    this.modalService.confirm(this.confirmTitleString, this.confirmBodyString)
      .then(async confirmed => {
        if (confirmed) {
          try {
            await this.deviceService.unregister(this.selectedDevice._id);
          } catch (e) {
            this.alertService.error(e.message);
          }
        }
      }).catch(() => console.log('User dismissed the dialog.'));
  }

  public async ngOnInit(): Promise<void> {

    this.oidcSecurityService.checkAuth().subscribe((auth: boolean) => {
      if (auth) {
        this.connectionService.refreshToken();
      }
    });

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

        const devices = await this.deviceService.getDevices(bottomLeft[0].toString(), bottomLeft[1].toString(),
          topRight[0].toString(), topRight[1].toString());

        if (devices) {
          this.updateMap(devices);
        }
      }
    };
    this.mapService.getMap(this.mapName).on('moveend', onMoveEnd);

    this.subscriptions.push(this.httpClient.get('/assets/layers.json').subscribe((data) => {
      this.myLayers = data as Theme[];
    }, () => { }));

    const { onLocate, onUpdate, onRemove } = await this.deviceService.subscribe();

    this.subscriptions.push(onLocate.subscribe((newDevice: IDevice) => {
      const feature: object = this.deviceToFeature(newDevice);
      const newFeature = new GeoJSON().readFeature(feature);
      this.vectorSource.addFeature(newFeature);
    }));

    this.subscriptions.push(onUpdate.subscribe((updatedDevice: IDevice) => {
      this.updateDevice(updatedDevice);
    }));

    this.subscriptions.push(onRemove.subscribe((removedDevice: IDevice) => {
      this.deviceDeleted(removedDevice);
    }));

    this.subscriptions.push(this.locationService.showLocation$.subscribe((deviceLocation) => {
      this.removeLocationFeatures();

      if (deviceLocation) {
        const locationFeature = new Feature({
          geometry: new Point(proj4(this.epsgWGS84, this.epsgRD,
            [deviceLocation.coordinates[1], deviceLocation.coordinates[0]])),
        });
        this.setLocation(locationFeature);
      } else {
        this.clearLocationLayer();
      }
    }));

    this.subscriptions.push(this.locationService.locationHighlight$.subscribe((deviceLocation) => {
      this.removeHighlight();

      if (deviceLocation) {
        const geometry = new Feature({
          geometry: new Point(proj4(this.epsgWGS84, this.epsgRD,
            [deviceLocation.coordinates[0], deviceLocation.coordinates[1]]))
        });

        this.highlightFeature(geometry);
      }
    }));

    if (window.location.protocol === 'https:') {
      this.addFindMeButton();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
