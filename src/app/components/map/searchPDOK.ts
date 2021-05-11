import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { wktToGeoJSON } from '@terraformer/wkt';
import SearchJSON from 'ol-ext/control/SearchJSON';

export class SearchPDOK extends SearchJSON {

  constructor(options) {
    super({
      ...options,
      url: 'https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest'
    });
  }

  requestData(query) {
    // SearchJSON doesn't allow for additional parameters by default, therefore add 'fl' here
    return {
      q: query,
      fl: '*',
    };
  }

  handleResponse(response): Feature[] {
    const features: Feature[] = [];

    response.response.docs.forEach(doc => {
      const geometry: Geometry = (doc.type === 'adres') ? wktToGeoJSON(doc.centroide_rd) : wktToGeoJSON(doc.geometrie_rd);

      const feature: Feature = new GeoJSON().readFeature(geometry);
      feature.set('type', doc.type);
      feature.set('name', doc.weergavenaam);

      features.push(feature);
    });

    return features;
  }

  getTitle(feature): string {
    return feature.values_.name;
  }
}
