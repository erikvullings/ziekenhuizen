import * as fs from 'fs';
import * as turf from '@turf/turf';
import { demografie } from './processPostcodes';
import { ziekenhuizen, aanrijdgebieden25, aanrijdgebieden30 } from './processZiekenhuizen';
import { demografieOutput, ziekenhuisGeojson } from './settings';

const distance = turf.distance;
const booleanPointInPolygon = turf.booleanPointInPolygon;

const demografieNearHospital = demografie.map((pc) => {
  const result = {
    /** PC4 */
    pc: pc.pc,
    /** Total number of births in this postcode */
    t: pc.t,
    /** Center point of PC */
    c: [pc.lon, pc.lat],
    /** Postcode is in the 25 min range of hospitals with ID, sorted by distance */
    in25: [] as number[],
    /** Postcode is in the 30 min range of hospitals with ID, sorted by distance */
    in30: [] as number[],
    /** Postcode is outside the 30 min range of hospitals with ID, sorted by distance */
    overig: [] as number[],
  };
  const p = result.c;
  const dist = ziekenhuizen.features
    .map((loc, i) => ({
      distance: distance(p, loc.geometry.coordinates, { units: 'kilometers' }),
      id: i,
    }))
    .sort((a, b) => (a.distance > b.distance ? 1 : a.distance < b.distance ? -1 : 0));
  dist
    .filter(({ distance }) => distance < 40)
    .map(({ id }) => {
      if (booleanPointInPolygon(p, aanrijdgebieden30.features[id])) {
        if (booleanPointInPolygon(p, aanrijdgebieden25.features[id])) {
          result.in25.push(id);
        } else {
          result.in30.push(id);
        }
      }
    });
  result.overig = dist
    .filter(({ id }) => result.in25.indexOf(id) < 0 && result.in30.indexOf(id) < 0)
    .map(({ id }) => id);
  return result;
});

// Bereken het aantal geboorten dat 'in de buurt' van een ziekenhuis plaatsvindt.
// Hiertoe wordt het aantal geboorten in een postcode volledig overgedragen aan het dichtsbijzijnde ziekenhuis.

demografieNearHospital.forEach((pc) => {
  if (pc.in25.length > 0) {
    ziekenhuizen.features[pc.in25[0]].properties.t25 += pc.t;
  } else if (pc.in30.length > 0) {
    ziekenhuizen.features[pc.in30[0]].properties.t30 += pc.t;
  } else {
    ziekenhuizen.features[pc.overig[0]].properties.tOv += pc.t;
  }
});
fs.writeFileSync(demografieOutput, JSON.stringify(demografieNearHospital));
fs.writeFileSync(ziekenhuisGeojson, JSON.stringify(ziekenhuizen));
