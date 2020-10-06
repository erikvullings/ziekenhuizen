import m from 'mithril';
import { investering_per_partus } from '../models/cost-variables';
import { MeiosisComponent } from '../services/meiosis';
import { formatRoundedNumber as f, showDiff, showDiffInColumns } from '../utils';

export const GlobalCostModule: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { hospitals, baseline = [0, 0, 0], curline = [0, 0, 0] },
        },
      },
    }) => {
      if (!hospitals) {
        return;
      }
      const totalBirths = baseline.reduce((acc, cur) => acc + cur);
      const qosBaseline = Math.round(100 * (1 - (baseline[1] + 2 * baseline[2]) / totalBirths));
      const qosCurline = Math.round(100 * (1 - (curline[1] + 2 * curline[2]) / totalBirths));

      const [investering, boekwaarde] = hospitals.features.reduce(
        (acc, cur) => {
          const h = cur.properties;
          const aantalGeboorten = Math.round(h.t25 + h.t30 + h.tOv);
          const aantalTweedelijn = Math.round(aantalGeboorten * 0.71);
          /** Huidig aantal geboorten na het sluiten van andere ziekenhuizen */
          const aantalGeboorten2 = h ? Math.round(h.curline.reduce((acc, cur) => acc + cur)) : 0;
          /** Huidig aantal 2e-lijns geboorten na het sluiten van andere ziekenhuizen */
          const aantalTweedelijn2 = Math.round(aantalGeboorten2 * 0.71);
          const bevalling_2e_lijn = aantalTweedelijn2 - aantalTweedelijn;
          const investering = bevalling_2e_lijn * investering_per_partus;
          const boekwaarde = investering * 0.5;
          return [acc[0] + (investering >= 0 ? investering : 0), acc[1] + (boekwaarde < 0 ? boekwaarde : 0)];
        },
        [0, 0] as [number, number]
      );
      return m(
        'table',
        { style: 'width: 100%; margin: 1rem 0' },
        m('tr', m('td.table-header[colspan=4]', `Quality of Service ${showDiff(qosCurline, qosBaseline)}`)),
        m('tr', [m('td', '< 25 min'), ...showDiffInColumns(curline[0], baseline[0])]),
        m('tr', [m('td', '< 30 min'), ...showDiffInColumns(curline[1], baseline[1])]),
        m('tr', [m('td', '> 30 min'), ...showDiffInColumns(curline[2], baseline[2])]),
        m('tr', [
          m('td', 'investeringen'),
          m('td', f(investering / 1000000, 10)),
          m('td.left-align[colspan=2]', 'mln. €'),
        ]),
        m('tr', [m('td', 'boekwaarde'), m('td', f(-boekwaarde / 1000000, 10)), m('td.left-align[colspan=2]', 'mln. €')])
      );
    },
  };
};
