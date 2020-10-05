import m from 'mithril';
import { investering_per_partus } from '../models/cost-variables';
import { MeiosisComponent } from '../services/meiosis';
import { formatRoundedNumber as f } from '../utils';

export const GlobalCostModule: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { hospitals },
        },
      },
    }) => {
      if (!hospitals) {
        return;
      }
      const [investering, desinvestering] = hospitals.features.reduce(
        (acc, cur) => {
          const h = cur.properties;
          const aantalGeboorten = Math.round(h.t25 + h.t30 + h.tOv);
          const aantalTweedelijn = Math.round(aantalGeboorten * 0.71);
          /** Huidig aantal geboorten na het sluiten van andere ziekenhuizen */
          const aantalGeboorten2 = h
            ? Math.round(h.curline.reduce((acc, cur) => acc + cur))
            : 0;
          /** Huidig aantal 2e-lijns geboorten na het sluiten van andere ziekenhuizen */
          const aantalTweedelijn2 = Math.round(aantalGeboorten2 * 0.71);
          const bevalling_2e_lijn = aantalTweedelijn2 - aantalTweedelijn;
          const investeringen = bevalling_2e_lijn * investering_per_partus;
          console.log([investeringen, bevalling_2e_lijn]);
          return [
            acc[0] + (investeringen >= 0 ? investeringen : 0),
            acc[1] + (investeringen < 0 ? investeringen : 0),
          ];
        },
        [0, 0] as [number, number]
      );
      return m(
        'div',
        `Investering: ${f(investering / 1000000)}, desinvestering: ${f(
          desinvestering / 1000000
        )} in mln EURO`
      );
    },
  };
};
