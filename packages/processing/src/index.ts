import * as fs from "fs";
import * as turf from "@turf/turf";
import { demografie } from "./processPostcodes";
import {
  ziekenhuizen,
  aanrijdgebieden25,
  aanrijdgebieden30,
} from "./processZiekenhuizen";
import { demografieOutput, ziekenhuisGeojson } from "./settings";

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
      distance: distance(p, loc.geometry.coordinates, { units: "kilometers" }),
      id: i,
    }))
    .sort((a, b) =>
      a.distance > b.distance ? 1 : a.distance < b.distance ? -1 : 0
    );
  dist
    // .filter(({ distance }) => distance < 40)
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
    .filter(
      ({ id }) => result.in25.indexOf(id) < 0 && result.in30.indexOf(id) < 0
    )
    .map(({ id }) => id);
  return result;
});

const inactiveHospitalIds = ziekenhuizen.features
  .filter((z) => !z.properties.active)
  .map((z) => z.properties.id);

const updateDemografieToFitRegisteredBirths = () => {
  const zh2pc = demografieNearHospital.reduce(
    (acc, { in25, in30, overig, t }, i) => {
      const nearestId = [...in25, ...in30, ...overig]
        .filter((n) => !inactiveHospitalIds.includes(n))
        .shift();
      if (typeof nearestId !== "undefined") {
        if (!acc[nearestId]) {
          acc[nearestId] = { pcs: [i], t };
        } else {
          acc[nearestId].pcs.push(i);
          acc[nearestId].t += t;
        }
      }
      return acc;
    },
    {} as { [zhId: number]: { pcs: number[]; t: number } }
  );
  ziekenhuizen.features
    .filter((zh) => zh.properties.active)
    .forEach((zh) => {
      const { bevallingen, id } = zh.properties;
      const { pcs, t: totalExpectedBirths } = zh2pc[id];
      pcs.forEach((pcIdx) => {
        const expectedBirthsInPc = demografieNearHospital[pcIdx].t;
        const realBirthsInPc =
          (bevallingen * expectedBirthsInPc) / totalExpectedBirths;
        demografieNearHospital[pcIdx].t = realBirthsInPc;
      });
    });
};
updateDemografieToFitRegisteredBirths();

// Bereken het aantal geboorten dat 'in de buurt' van een ziekenhuis plaatsvindt.
// Hiertoe wordt het aantal geboorten in een postcode volledig overgedragen aan het dichtsbijzijnde ziekenhuis.

demografieNearHospital.forEach((pc) => {
  const in25 = pc.in25.filter((n) => !inactiveHospitalIds.includes(n));
  if (in25.length > 0) {
    ziekenhuizen.features[in25[0]].properties.t25 += pc.t;
  } else {
    const in30 = pc.in30.filter((n) => !inactiveHospitalIds.includes(n));
    if (in30.length > 0) {
      ziekenhuizen.features[in30[0]].properties.t30 += pc.t;
    } else {
      const overig = pc.overig.filter((n) => !inactiveHospitalIds.includes(n));
      if (overig.length > 0)
        ziekenhuizen.features[overig[0]].properties.tOv += pc.t;
    }
  }
});
fs.writeFileSync(demografieOutput, JSON.stringify(demografieNearHospital));
fs.writeFileSync(ziekenhuisGeojson, JSON.stringify(ziekenhuizen));
