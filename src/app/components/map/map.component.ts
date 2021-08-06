import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { MapBrowserEvent, Overlay } from 'ol';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import LayerSwitcher from 'ol-layerswitcher';
import OverlayPositioning from 'ol//OverlayPositioning';
import Control from 'ol/control/Control';
import { extend, Extent, getBottomLeft, getCenter, getTopRight } from 'ol/extent';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { MultiPoint } from 'ol/geom';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import { Cluster } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Icon, Style, Text } from 'ol/style';
import Stroke from 'ol/style/Stroke';
import { FitOptions } from 'ol/View';
import proj4 from 'proj4';

import { IDevice } from '../../model/bodies/device-model';
import { Category, getCategoryTranslation } from '../../model/bodies/sensorTypes';
import { AlertService } from '../../services/alert.service';
import { ConnectionService } from '../../services/connection.service';
import { DeviceService } from '../../services/device.service';
import { LocationService } from '../../services/location.service';
import { ModalService } from '../../services/modal.service';
import { MapService } from './map.service';
import { SearchPDOK } from './searchPDOK';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
    @HostBinding('style.--searchBarHeight') @Input() searchBarHeight;
    @Input() clearLocationHighLight = true;

    constructor(
        private router: Router,
        private elementRef: ElementRef,
        private mapService: MapService,
        private httpClient: HttpClient,
        private alertService: AlertService,
        private modalService: ModalService,
        private deviceService: DeviceService,
        private locationService: LocationService,
        private connectionService: ConnectionService,
        private oidcSecurityService: OidcSecurityService,
    ) {}

    public map: OlMap;
    public subscriptions = [];

    public mapUpdated;
    public overlayVisible = false;
    public selectedDevice: IDevice;

    public getCategoryTranslation = getCategoryTranslation;

    public popupOverlay: Overlay;
    public clusterSource: Cluster;
    public vectorSource: VectorSource<any>;
    public highlightLayer: VectorLayer;
    public selectCluster: SelectCluster;
    public highlightSource: VectorSource<Geometry>;
    public clusterLayer: AnimatedCluster;
    public selectLocationLayer: VectorLayer;
    public selectLocationSource: VectorSource<Geometry>;

    private epsgRD =
        '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 ' +
        '+y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,' +
        '-1.8703473836068,4.0812 +no_defs';
    private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

    public hideTreeDataset = false;

    public clusterMaxZoom = 15;

    public locateMeString = $localize`:@@map.locate:Locate me`;
    public confirmTitleString = $localize`:@@confirm.title:Please confirm`;
    public confirmBodyString = $localize`:@@delete.device.confirm.body:Do you really want to delete the device?`;
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
                const styleActive = [
                    new Style({
                        image: new CircleStyle({
                            radius: 15,
                            fill: new Fill({
                                color: this.getNodeColor(item, 0.9),
                            }),
                            stroke: new Stroke({
                                color: '#fff',
                                width: 1.5,
                            }),
                        }),
                    }),
                    new Style({
                        image: new Icon({
                            scale: 0.25,
                            src: `/assets/icons/${item1}_op.png`,
                        }),
                    }),
                ];

                for (const style of Object.values(styleActive)) {
                    style.getImage().load();
                }

                styleCache[styleName] = styleActive;
            }
        }

        return styleCache;
    }

    public initMap() {
        this.map = this.mapService.getMap();
        const mapElement = this.elementRef.nativeElement.querySelector('#map');
        this.map.setTarget(mapElement);

        // Observe map resizes
        // https://openlayers.org/en/latest/doc/faq.html#user-content-why-is-zooming-or-clicking-off-inaccurate
        const sizeObserver = new ResizeObserver(() => {
            this.map.updateSize();
        });
        sizeObserver.observe(mapElement);

        this.addMapEvents();
    }

    public initFeatures() {
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
                style = [
                    new Style({
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
                    }),
                ];
                styleCache[numberOfFeatures] = style;
            }

            return style;
        };

        const styleSelectedCluster = (feature) => {
            const zoomLevel = this.map.getView().getZoom();
            
            if (Object.prototype.hasOwnProperty.call(feature.values_, 'selectclusterfeature') && zoomLevel > this.clusterMaxZoom) {
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
            source: this.vectorSource,
        });

        this.clusterLayer = new AnimatedCluster({
            name: 'Cluster',
            source: this.clusterSource,
            style: styleCluster,
            zIndex: 1,
        });

        this.map.addLayer(this.clusterLayer);

        this.selectCluster = new SelectCluster({
            pointRadius: 40,
            style: styleCluster,
            featureStyle: styleSelectedCluster,
        });
        this.map.addInteraction(this.selectCluster);

        this.popupOverlay = new Overlay({
            autoPan: false,
            positioning: OverlayPositioning.BOTTOM_CENTER,
            element: document.getElementById('popup'),
        });
        this.map.addOverlay(this.popupOverlay);

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
        const featuresData: Array<Record<string, unknown>> = devices.map((device) => this.deviceToFeature(device));
        const features: Array<Feature> = new GeoJSON().readFeatures({
            features: featuresData,
            type: 'FeatureCollection',
        });

        this.vectorSource.clear();
        this.vectorSource.addFeatures(features);

        // TODO features do not show without removing and re-adding the layer. Check if there is a better way
        this.map.removeLayer(this.clusterLayer);
        this.map.addLayer(this.clusterLayer);
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
        if (device) {
            // In case the sensor is currently visible on the map: update map.
            device.setProperties(props);
            const geom: Geometry = new Point(
                proj4(this.epsgWGS84, this.epsgRD, [
                    updatedDevice.location.coordinates[0],
                    updatedDevice.location.coordinates[1],
                ]),
            );
            device.setGeometry(geom);
            this.clearLocationLayer();

            if (this.selectedDevice && this.selectedDevice._id === updatedDevice._id) {
                this.selectedDevice = updatedDevice; // In case the sensor is selected: update overlay.
            }
        }
    }

    public deviceDeleted(deletedDevice: IDevice) {
        this.locationService.hideLocationHighlight();
        const device = this.vectorSource.getFeatureById(deletedDevice._id);
        if (device) {
            // In case the sensor is currently visible on the map: update map.
            if (this.selectedDevice && this.selectedDevice._id === deletedDevice._id) {
                // In case the sensor is selected.
                this.hideOverlay();
                this.selectedDevice = null;
            }
            this.vectorSource.removeFeature(device);
        }
    }

    private async onMoveEnd(event: MapBrowserEvent) {
        const map = event.map;

        const currentRequestTimestamp = new Date().valueOf();
        if (!this.mapUpdated || currentRequestTimestamp - this.mapUpdated > 500) {
            // In case of e.g. resizing window.
            this.mapUpdated = currentRequestTimestamp;

            const extent = map.getView().calculateExtent(map.getSize());
            const topRight = proj4(this.epsgRD, this.epsgWGS84, getTopRight(extent));
            const bottomLeft = proj4(this.epsgRD, this.epsgWGS84, getBottomLeft(extent));

            const devices = await this.deviceService.getDevices(
                bottomLeft[0].toString(),
                bottomLeft[1].toString(),
                topRight[0].toString(),
                topRight[1].toString(),
            );

            if (devices) {
                this.updateMap(devices);
            }
        }
    }

    private onSingleClick(event: MapBrowserEvent) {
        const mapCoordinateRD = event.coordinate;
        const mapCoordinateWGS84 = proj4(this.epsgRD, this.epsgWGS84, mapCoordinateRD);

        this.hideOverlay();
        this.removeHighlight();

        this.locationService.setLocation({
            type: 'Point',
            coordinates: [mapCoordinateWGS84[1], mapCoordinateWGS84[0], 0],
        });

        event.map.forEachFeatureAtPixel(event.pixel, (data) => {
            const features = data.getProperties().features;

            // check if feature is a cluster with multiple features
            if (features.length < 2) {
                return;
            }

            // determine extent for new view
            const extent: Extent = features[0].getGeometry().getExtent().slice(0) as Extent;
            features.forEach((f: Feature<Geometry>) => {
                extend(extent, f.getGeometry().getExtent());
            });

            // if we're already zoomed in, zoom in no more. Setting maxZoom in fit() also does this to some extent, however,
            // in that case the camera is also centered. Returning early here also prevents the unnecessary panning.
            if (event.map.getView().getZoom() > this.clusterMaxZoom) {
                return;
            }

            const size = this.map.getSize(); // [width, height]
            const fitOptions: FitOptions = {
                duration: 1000,
                maxZoom: this.clusterMaxZoom + 1,
                padding: [size[1] * 0.2, size[0] * 0.2, size[1] * 0.2, size[0] * 0.2], // up, right, down, left
                size,
            };
            this.map.getView().fit(extent, fitOptions);
        });
    }

    public addMapEvents() {
        this.map.on('moveend', this.onMoveEnd.bind(this));
        this.map.on('singleclick', this.onSingleClick.bind(this));
    }

    private deviceToFeature(newDevice: IDevice): Record<string, unknown> {
        return {
            geometry: {
                coordinates: proj4(this.epsgWGS84, this.epsgRD, [
                    newDevice.location.coordinates[0],
                    newDevice.location.coordinates[1],
                ]),
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
            zIndex: 3,
        });

        this.map.addLayer(this.selectLocationLayer);
    }

    public removeLocationFeatures() {
        this.map.removeLayer(this.selectLocationLayer);
    }

    public clearLocationLayer() {
        this.map.removeLayer(this.selectLocationLayer);
    }

    public highlightFeature(feature: Feature) {
        this.map.removeLayer(this.highlightLayer);
        this.highlightSource = new VectorSource({
            features: [feature],
        });
        this.highlightLayer = new VectorLayer({
            source: this.highlightSource,
            style: [
                new Style({
                    image: new CircleStyle({
                        radius: 20,
                        stroke: new Stroke({
                            color: '#FF0000',
                            width: 2,
                        }),
                    }),
                }),
            ],
            opacity: 0.7,
            zIndex: 2,
        });

        this.map.addLayer(this.highlightLayer);
    }

    public removeHighlight() {
        this.map.removeLayer(this.highlightLayer);
    }

    private zoomToPoint(point: Point) {
        const view = this.map.getView();
        view.fit(point, {
            duration: 250,
            maxZoom: 14,
        });
    }

    private zoomToExtent(extent: Extent) {
        const view = this.map.getView();
        const resolution = view.getResolutionForExtent(extent, this.map.getSize());
        const zoom = view.getZoomForResolution(resolution);
        const center = getCenter(extent);

        setTimeout(() => {
            view.animate({
                center,
                zoom: Math.min(zoom, 16),
            });
        }, 250);
    }

    private zoomToPosition(position: GeolocationPosition) {
        const coords = [position.coords.longitude, position.coords.latitude];
        const coordsRD = proj4(this.epsgWGS84, this.epsgRD, coords);
        const point = new Point(coordsRD);
        this.zoomToPoint(point);
    }

    private zoomToGeometry(geometry: Geometry): void {
        if (geometry instanceof Point) {
            this.zoomToPoint(geometry);
        } else {
            this.zoomToExtent(geometry.getExtent());
        }
    }

    private findMe() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
                this.zoomToPosition(position);
            });
        } else {
            alert(this.geoLocationNotSupportedString);
        }
    }

    private addFindMeButton() {
        if (window.location.protocol !== 'https:') {
            console.warn('Geolocation only allowed over secure connections');
            return;
        }

        const locate = document.createElement('div');
        locate.className = 'ol-control ol-unselectable locate';
        locate.innerHTML = `<button title="${this.locateMeString}">◎</button>`;
        locate.addEventListener('click', () => {
            this.findMe();
        });

        this.map.addControl(
            new Control({
                element: locate,
            }),
        );
    }

    private addLayerSwitcher(): void {
        const layerSwitcher = new LayerSwitcher({
            reverse: true,
            groupSelectStyle: 'children',
        });

        this.map.addControl(layerSwitcher);
    }

    /**
     * Adds a search button on the map which can be used to search for a location
     * Makes use of the 'Locatieserver' of PDOK (Dutch address lookup) https://github.com/PDOK/locatieserver/wiki
     */
    private addSearchButton(): void {
        const search = new SearchPDOK({
            minLength: 1,
            maxHistory: -1,
            collapsed: false,
            className: 'search-bar',
            placeholder: $localize`Enter location`,
        }) as any;
        search.clearHistory();

        search.on('select', (event) => {
            let feature: Feature;
            if (event.search instanceof Feature) {
                feature = event.search;
            } else {
                const values = event.search.values_;
                const geometry = new MultiPoint(values.geometry.flatCoordinates, values.geometry.layout);

                feature = new Feature({
                    geometry,
                    name: values.name,
                    type: values.type,
                });
            }

            this.zoomToGeometry(feature.getGeometry());
        });

        this.map.addControl(search);
    }

    public ownsDevice(device): boolean {
        return device.canEdit;
    }

    public async editDevice(): Promise<void> {
        await this.router.navigate([`/device/${this.selectedDevice._id}`]);
    }

    public async deleteDevice(): Promise<void> {
        await this.modalService.confirm(this.confirmTitleString, this.confirmBodyString).then(
            async () => {
                try {
                    await this.deviceService.unregister(this.selectedDevice._id);
                } catch (e) {
                    this.alertService.error(e.error.message);
                }
            },
            () => {},
        );
    }

    public async ngOnInit(): Promise<void> {
        this.oidcSecurityService.checkAuth().subscribe((auth: boolean) => {
            if (auth) {
                this.connectionService.refreshLegalEntity();
            }
        });

        this.locationService.hideLocationMarker();
        if (this.clearLocationHighLight) {
            this.locationService.hideLocationHighlight();
        }
        this.initMap();
        this.initFeatures();

        const { onLocate, onUpdate, onRemove } = await this.deviceService.subscribe();

        this.subscriptions.push(
            onLocate.subscribe((newDevice: IDevice) => {
                const feature: Record<string, unknown> = this.deviceToFeature(newDevice);
                const newFeature = new GeoJSON().readFeature(feature);
                this.vectorSource.addFeature(newFeature);
            }),
        );

        this.subscriptions.push(
            onUpdate.subscribe((updatedDevice: IDevice) => {
                this.updateDevice(updatedDevice);
            }),
        );

        this.subscriptions.push(
            onRemove.subscribe((removedDevice: IDevice) => {
                this.deviceDeleted(removedDevice);
            }),
        );

        this.subscriptions.push(
            this.locationService.showLocation$.subscribe((deviceLocation) => {
                this.removeLocationFeatures();

                if (deviceLocation) {
                    const locationFeature = new Feature({
                        geometry: new Point(
                            proj4(this.epsgWGS84, this.epsgRD, [
                                deviceLocation.coordinates[1],
                                deviceLocation.coordinates[0],
                            ]),
                        ),
                    });
                    this.setLocation(locationFeature);
                } else {
                    this.clearLocationLayer();
                }
            }),
        );

        this.subscriptions.push(
            this.locationService.locationHighlight$.subscribe((deviceLocation) => {
                this.removeHighlight();

                if (deviceLocation) {
                    const geometry = new Feature({
                        geometry: new Point(
                            proj4(this.epsgWGS84, this.epsgRD, [
                                deviceLocation.coordinates[0],
                                deviceLocation.coordinates[1],
                            ]),
                        ),
                    });

                    this.highlightFeature(geometry);
                }
            }),
        );

        this.addSearchButton();
        this.addLayerSwitcher();
        this.addFindMeButton();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((x) => x.unsubscribe());

        // this.map actually lives in map.service.ts. If we let it live, all layers and listeners are re-added each time the
        // map component is recreated. Instead of manually keeping track of it, just kill the map and recreate it next time.
        // Perhaps not an efficient way, but at least keeps this component more predictable.
        this.mapService.deleteMap();
    }
}
