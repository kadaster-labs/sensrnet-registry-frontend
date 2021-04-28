import SearchJSON from 'ol-ext/control/SearchJSON';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';

export class SearchPDOK extends SearchJSON {

  constructor(options) {
    super({
      ...options,
      url: 'https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest'
    });
  }

  requestData(query) {
    return {
      q: query,
      fl: '*',
    };
  }

  handleResponse(response): Feature[] {
    console.log(response);
    const features: Feature[] = [];
    const regex: RegExp = /[+-]?\d+(\.\d+)?/g;

    response.response.docs.forEach(doc => {
      const coordinates = doc.centroide_rd.match(regex).map((v) => parseFloat(v));

      features.push(new Feature({
        geometry: new Point(coordinates),
        name: doc.weergavenaam,
      }));
    });

    return features;
  }

  getTitle(feature) {
    return feature.values_.name;
  }
}
