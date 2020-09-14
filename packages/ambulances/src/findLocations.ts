import fs from 'fs';
import path from 'path';
import * as papa from 'papaparse';
import { pdokLocationSvc } from './services';
import { IAddress, IAmbulancePost } from './models';

const filename = path.join(process.cwd(), './data/ambulancestandplaatsen.csv');
const outputFile = path.join(process.cwd(), './data/ambulancestandplaatsen.json');

const run = async () => {
  return new Promise((resolve) => {
    let file = fs.readFileSync(filename, 'utf8');
    if (file.charCodeAt(0) === 0xfeff) {
      file = file.substr(1);
    }
    papa.parse<IAmbulancePost>(file, {
      delimiter: ';',
      header: true,
      complete: async (results) => {
        const ambulanceposten = results.data.reduce((acc, cur) => {
          if (!acc.hasOwnProperty(cur.id)) {
            acc[cur.id] = {} as IAmbulancePost;
          }
          const { Standplaats, Straatnaam, Beschikbaarheid, Postcode, Plaats } = cur;
          if (Standplaats) acc[cur.id].Standplaats = Standplaats;
          if (Straatnaam) {
            const extractHuisnummer = /([\w0-9 .]*) ([\dA-Za-z\-]*)$/;
            const match = extractHuisnummer.exec(Straatnaam.trim());
            if (match) {
              acc[cur.id].Straatnaam = match[1];
              acc[cur.id].Huisnummer = match[2];
            } else {
              console.error(`Failed to extract house number: ${Straatnaam}`);
            }
          }
          if (Postcode) acc[cur.id].Postcode = Postcode;
          if (Plaats) acc[cur.id].Plaats = Plaats;
          if (Beschikbaarheid) acc[cur.id].Beschikbaarheid = Beschikbaarheid;
          return acc;
        }, {} as { [id: string]: IAmbulancePost });
        const output = [] as IAmbulancePost[];
        for (const id in ambulanceposten) {
          const ambulancepost = ambulanceposten[id];
          const loc = await pdokLocationSvc({
            hn: ambulancepost.Huisnummer,
            pc: ambulancepost.Postcode,
          } as IAddress);
          ambulancepost.lat = loc?.lat;
          ambulancepost.lon = loc?.lon;
          output.push(ambulancepost);
        }
        console.log('Finished:', JSON.stringify(output, null, 2));
        fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), { encoding: 'utf8' });
        resolve();
      },
    });
  });
};

run();
