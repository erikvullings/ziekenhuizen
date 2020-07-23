// import * as fs from 'fs';
// import { demografieOutput } from './settings';
import * as XLSX from 'xlsx';
import { demografieFile } from './settings';

// Bereken het aantal geboorten per postcode 4, per relevante leeftijdscategorie
// (15-20, 20-25, 25-30, 30-35, 35-40, 40-45, 45-50) en als totaal. Save de output als JSON.

const index15_20 = 3; // Index voor de leeftijdscategorie 15-20
const index20_25 = 4;
const index25_30 = 5;
const index30_35 = 6;
const index35_40 = 7;
const index40_45 = 8;
const index45_50 = 9;

const demografieWb = XLSX.readFile(demografieFile, { sheets: [0, 1] });
const demografieTable = XLSX.utils.sheet_to_json(demografieWb.Sheets[demografieWb.SheetNames[0]], {
  raw: true,
  rawNumbers: true,
}) as Array<{
  pc: number;
  lat: number;
  lon: number;
  m: string;
  v: string;
  p: string;
}>;
export const demografie = demografieTable.map((d) => ({
  ...d,
  m: d.m ? JSON.parse(d.m) : undefined,
  v: d.v ? JSON.parse(d.v) : undefined,
  g: [0, 0, 0, 0, 0, 0, 0],
  t: 0,
})) as Array<{
  /** Postcode 4 */
  pc: number;
  lat: number;
  lon: number;
  /** Mannen in leeftijdscategorie van 5 jaar */
  m: number[];
  /** Vrouwen in leeftijdscategorie van 5 jaar */
  v: number[];
  /** Aantal geboorten per leeftijdscategorie van 5 jaar */
  g: number[];
  /** Aantal geboorten totaal */
  t: number;
  /** Provincie code */
  p: string;
}>;

const provincieTable = XLSX.utils.sheet_to_json(demografieWb.Sheets[demografieWb.SheetNames[1]], {
  raw: true,
  rawNumbers: true,
}) as Array<{
  p: string;
  aantalGeboorten2018: string;
  aantalVrouwen: string;
}>;
const geboortesPerProvincie = provincieTable.reduce(
  (acc, pg) => {
    acc[pg.p] = {
      aantalGeboorten2018: JSON.parse(pg.aantalGeboorten2018),
      aantalVrouwen: JSON.parse(pg.aantalVrouwen), // Allemaal 0, moet berekend worden obv de pc dat,
    };
    return acc;
  },
  {} as {
    [provincieCode: string]: {
      aantalGeboorten2018: number[];
      aantalVrouwen: number[];
    };
  }
);
// Bereken het aantal vrouwen in de gewenste leeftijdscategorie
demografie
  .filter((d) => d.v)
  .forEach((d) => {
    const av = geboortesPerProvincie[d.p].aantalVrouwen;
    av[0] += d.v[index15_20];
    av[1] += d.v[index20_25];
    av[2] += d.v[index25_30];
    av[3] += d.v[index30_35];
    av[4] += d.v[index35_40];
    av[5] += d.v[index40_45];
    av[6] += d.v[index45_50];
  });
// Bereken aantal geboorten per postcode per leeftijdscategorie
demografie
  .filter((d) => d.v)
  .forEach((d) => {
    const av = geboortesPerProvincie[d.p].aantalVrouwen;
    const ag = geboortesPerProvincie[d.p].aantalGeboorten2018;
    for (let i = 0; i < 7; i++) {
      d.g[i] = av[i] > 0 ? (d.v[index15_20 + i] * ag[i]) / av[i] : 0;
    }
    d.t = d.g.reduce((acc, cur) => acc + cur, 0);
  });

const totaalGeboorten = demografie.reduce((acc, cur) => acc + cur.t, 0);
console.log(`Check totaal aantal geboorten in 2018: ${Math.round(totaalGeboorten)}.`);
// fs.writeFileSync(demografieOutput, JSON.stringify(demografie));
