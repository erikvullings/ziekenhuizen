import fs from 'fs';
import path from 'path';
import { IAmbulancePost } from './models';
import axios from 'axios';

/** Convert the ambulanceposten.json data to GeoJSON, and include accessibility information using howfar and OSRM */

const filename = path.join(process.cwd(), './data/ambulancestandplaatsen.json');
const outputPosten = path.join(process.cwd(), './data/ambulancestandplaatsen.geojson');
const outputBereik = path.join(process.cwd(), './data/ambulancesbereik.geojson');

const ambulanceposten = JSON.parse(fs.readFileSync(filename, 'utf8')) as IAmbulancePost[];
const posten = {
  type: 'FeatureCollection',
  features: ambulanceposten
    .map(({ lat, lon, ...properties }) => {
      if (!lat || !lon) {
        console.error('Error: ' + JSON.stringify(properties, null, 2));
        return undefined;
      }
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties,
      };
    })
    .filter(Boolean),
};
fs.writeFileSync(outputPosten, JSON.stringify(posten));

const processBereik = async () => {
  const bereik = {
    type: 'FeatureCollection',
    features: [] as any[],
  };
  for (const p of posten.features) {
    if (p) {
      const [lon, lat] = p.geometry.coordinates;
      const url = `http://localhost:3000/${lat}/${lon}?bands=1&distance=15`;
      const result = await axios.request<{ features: any[] }>({ url });
      const f = result.data.features
        ? result.data.features.map((f) => ({ ...f, properties: { ...p.properties, ...f.properties } }))
        : undefined;
      if (f) {
        bereik.features.push(...f);
      }
    }
  }
  fs.writeFileSync(outputBereik, JSON.stringify(bereik));
};

processBereik();
// console.log(posten);
