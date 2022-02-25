import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import {
  ziekenhuisInputFile,
  ziekenhuizenFolder,
  aanrijdGeojson25,
  aanrijdGeojson30,
} from "./settings";

// Maak 2 geojson files, eentje met alle ziekenhuizen als punt op de kaart en de default gegevens,
// de ander met alle aanrijdgebieden.

const ziekenhuisWb = XLSX.readFile(ziekenhuisInputFile);
const ziekenhuisTable = XLSX.utils.sheet_to_json(
  ziekenhuisWb.Sheets[ziekenhuisWb.SheetNames[0]],
  {
    raw: true,
    rawNumbers: true,
  }
) as Array<{
  filename?: string;
  id: number;
  organisatie: string;
  locatie: string;
  plaats: string;
  adres: string;
  pc: string;
  gevoeligeZH: boolean;
  NICU: boolean;
  fullTimeSEH: boolean;
  avond: boolean;
  criteria: boolean;
  /** Totaal aantal bevallingen */
  bevallingen: number;
  /** Percentage bevallingen, 2e lijn ZH */
  perc2lLijnZh: number;
  /** Percentage bevallingen, geboortecentra/ZH 1e lijn */
  perc1lLijnZh: number;
  /** Percentage bevallingen, thuis 1e lijn */
  perc1lLijnThuis: number;
  /** Percentage bevallingen die niet gespecificeerd zijn */
  percOnbekend: number;
  /** Aantekeningen betreffende de berekening */
  notitie?: string;
  /** Verwerkt het ziekenhuis bevallingen */
  active: boolean;
  /** Totaal aantal geboorten binnen 25 min regio */
  t25: number;
  /** Totaal aantal geboorten binnen 30 min regio */
  t30: number;
  /** Totaal aantal geboorten buiten 30 min regio die hier opgevangen worden */
  tOv: number;
}>;

const aanrijdgebieden = ziekenhuisTable.map((z) => {
  const data = fs
    .readFileSync(path.resolve(ziekenhuizenFolder, `${z.filename}.geojson`))
    .slice(3); // remove BOM
  delete z.filename;
  return JSON.parse(data.toString());
});

export const ziekenhuizen = {
  type: "FeatureCollection",
  features: ziekenhuisTable.map((z, i) => ({
    type: "Feature",
    properties: {
      ...z,
      id: i,
      t25: 0,
      t30: 0,
      tOv: 0,
      active: z.bevallingen > 0,
    },
    geometry: {
      type: "Point",
      coordinates: aanrijdgebieden[i].features[0].properties.center,
    },
  })),
};

export const aanrijdgebieden25 = {
  type: "FeatureCollection",
  features: aanrijdgebieden.map((a, i) => ({
    ...a.features[0],
    properties: { ...a.features[0].properties, id: i },
  })),
};

export const aanrijdgebieden30 = {
  type: "FeatureCollection",
  features: aanrijdgebieden.map((a, i) => ({
    ...a.features[1],
    properties: { ...a.features[1].properties, id: i },
  })),
};

// fs.writeFileSync(ziekenhuisGeojson, JSON.stringify(ziekenhuizen, null, 2));
fs.writeFileSync(aanrijdGeojson25, JSON.stringify(aanrijdgebieden25));
fs.writeFileSync(aanrijdGeojson30, JSON.stringify(aanrijdgebieden30));
