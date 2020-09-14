import { IAddress, IPdokSearchResult, pointRegex } from '../models';
import { formatPC } from '../utils';
import axios from 'axios';

export const pdokLocationSvc = async (loc: Partial<IAddress>) => {
  const { pc, hn, toev = '' } = loc;
  if (!pc || !hn) {
    console.log(`Onvoldoende gegevens: ${pc}, ${hn}${toev ? `, ${toev}` : ''} !`);
    return;
  }
  const pdokUrl = `https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?q=${pc.replace(
    / /g,
    ''
  )} ${hn} ${toev}`;
  // console.log(`PDOK resolving ${pc}, ${hn}${toev ? `, ${toev}` : ''}`);
  const searchResult = await axios
    .request<IPdokSearchResult>({ url: pdokUrl })
    .catch((_) => {
      console.log(`Onbekend adres: ${pc}, ${hn}${toev ? `, ${toev}` : ''} !`);
      return;
    });
  if (searchResult && searchResult.data && searchResult.data.response) {
    const {
      data: {
        response: { docs = [] },
      },
    } = searchResult;
    const found = docs.filter((doc) => doc.bron === 'BAG' && doc.type === 'adres');

    if (found.length > 0) {
      const best = found[0];
      const { centroide_ll, centroide_rd, straatnaam, woonplaatsnaam } = best;
      const ll = pointRegex.exec(centroide_ll);
      const rd = pointRegex.exec(centroide_rd);
      if (ll && rd) {
        loc.str = straatnaam;
        loc.wn = woonplaatsnaam;
        (loc.pc = formatPC(pc) as string), (loc.lat = +ll[2]);
        loc.lon = +ll[1];
        loc.x = +rd[1];
        loc.y = +rd[2];
        loc.land = 'Nederland';
        return loc;
      }
    }
  }
  // console.error(`Error resolving ${pc}, ${hn}${toev ? `, ${toev}` : ''}!`);
};
