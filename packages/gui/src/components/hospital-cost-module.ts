import m from 'mithril';
import {
  aandeel_acute_sectio,
  aandeel_electieve_sectio,
  aandeel_overige_sectio,
  aandeel_post_partum_ops,
  aandeel_sectio,
  aandeel_spoed_sectio,
  aantal_fte,
  acute_sectio_in_bedrijfstijd,
  bevallingen_in_bedrijfstijd,
  bvo_per_partus_2e_lijn,
  electieve_sectio_in_bedrijfstijd,
  fte_kraam_direct,
  fte_kraam_indirect,
  investering_per_partus,
  ok_per_partus,
  salaris,
  salaris_kraam_direct,
  salaris_kraam_indirect,
  spoed_sectio_in_bedrijfstijd,
} from '../models/cost-variables';
import { MeiosisComponent } from '../services/meiosis';
import { formatRoundedNumber as f, showDiffInColumns } from '../utils';

export const HospitalCostModule: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { hospitals, selectedHospitalId },
        },
      },
    }) => {
      const selectedHospital = hospitals?.features.filter((f) => f.properties.id === selectedHospitalId).shift();

      if (!selectedHospital) {
        return;
      }
      const h = selectedHospital.properties;
      const aantalGeboorten = Math.round(h.t25 + h.t30 + h.tOv);
      const aantalGeboortecentrum = Math.round(aantalGeboorten * h.perc1lLijnZh);
      const aantalTweedelijn = Math.round(aantalGeboorten * h.perc2lLijnZh); // 0.71 + 0.011 voor overige bevallingen
      /** Huidig aantal geboorten na het sluiten van andere ziekenhuizen */
      const aantalGeboorten2 = h ? Math.round(h.curline.reduce((acc, cur) => acc + cur)) : 0;
      const aantalGeboortecentrum2 = Math.round(aantalGeboorten2 * h.perc1lLijnZh);
      /** Huidig aantal 2e-lijns geboorten na het sluiten van andere ziekenhuizen */
      const aantalTweedelijn2 = Math.round(aantalGeboorten2 * h.perc2lLijnZh);
      const bevalling_2e_lijn = aantalTweedelijn2 - aantalTweedelijn;
      const sectio = bevalling_2e_lijn * aandeel_sectio;
      const overig = bevalling_2e_lijn * aandeel_sectio * aandeel_overige_sectio;
      const acuut = bevalling_2e_lijn * aandeel_sectio * aandeel_acute_sectio;
      const overige_bevallingen = bevalling_2e_lijn - bevalling_2e_lijn * aandeel_sectio;
      const post_partum = bevalling_2e_lijn * (1 - aandeel_sectio) * aandeel_post_partum_ops;
      console.table({ overige_bevallingen, bevallingen_in_bedrijfstijd });
      const overige_bevallingen_binnen = overige_bevallingen * bevallingen_in_bedrijfstijd;
      const overige_bevallingen_buiten = overige_bevallingen * (1 - bevallingen_in_bedrijfstijd);
      const sectios_electief_binnen =
        bevalling_2e_lijn * aandeel_sectio * electieve_sectio_in_bedrijfstijd * aandeel_electieve_sectio;
      const sectios_electief_buiten =
        bevalling_2e_lijn * aandeel_sectio * (1 - electieve_sectio_in_bedrijfstijd) * aandeel_electieve_sectio;
      const sectios_spoed_binnen =
        bevalling_2e_lijn * aandeel_sectio * spoed_sectio_in_bedrijfstijd * aandeel_spoed_sectio;
      const sectios_spoed_buiten =
        bevalling_2e_lijn * aandeel_sectio * (1 - spoed_sectio_in_bedrijfstijd) * aandeel_spoed_sectio;
      const sectios_acuut_binnen =
        bevalling_2e_lijn * aandeel_sectio * acute_sectio_in_bedrijfstijd * aandeel_acute_sectio;
      const sectios_acuut_buiten =
        bevalling_2e_lijn * aandeel_sectio * (1 - acute_sectio_in_bedrijfstijd) * aandeel_acute_sectio;
      const post_partum_ops_binnen =
        bevalling_2e_lijn * (1 - aandeel_sectio) * aandeel_post_partum_ops * bevallingen_in_bedrijfstijd;
      const post_partum_ops_buiten =
        bevalling_2e_lijn * (1 - aandeel_sectio) * aandeel_post_partum_ops * (1 - bevallingen_in_bedrijfstijd);
      const investeringen = (bevalling_2e_lijn * investering_per_partus) / 1000000;
      const ok_benutting =
        (bevalling_2e_lijn * aandeel_sectio + bevalling_2e_lijn * (1 - aandeel_sectio) * aandeel_post_partum_ops) *
        ok_per_partus;
      const oppervlakte = bevalling_2e_lijn * bvo_per_partus_2e_lijn;
      const fte = bevalling_2e_lijn * aantal_fte;
      const kraamafdeling1op1_fte = bevalling_2e_lijn * fte_kraam_direct;
      const kraamafdeling_generiek_fte = bevalling_2e_lijn * fte_kraam_indirect;
      const salariskosten = (bevalling_2e_lijn * salaris) / 1000;
      const kraamafdeling1op1_salaris = (bevalling_2e_lijn * salaris_kraam_direct) / 1000;
      const kraamafdeling_generiek_salaris = (bevalling_2e_lijn * salaris_kraam_indirect) / 1000;
      return m(
        'table',
        m('tbody', [
          m('tr', m('td.table-header[colspan=4]', 'Geboortecijfers')),
          m('tr', [
            m('td', 'kenmerken'),
            m(
              'td.left-align[colspan=3]',
              [h.NICU ? 'NICU' : '', h.fullTimeSEH ? '24/7' : '', h.gevoeligeZH ? 'gevoelig' : '']
                .filter(Boolean)
                .join(', ')
            ),
          ]),
          m('tr', [m('td', 'aantal geboorten'), ...showDiffInColumns(aantalGeboorten2, aantalGeboorten)]),
          h.curline[0] ? m('tr', [m('td', 'binnen 25 min'), ...showDiffInColumns(h.curline[0], h.t25)]) : '',
          h.curline[1] ? m('tr', [m('td', 'binnen 30 min'), ...showDiffInColumns(h.curline[1], h.t30)]) : '',
          h.curline[2] ? m('tr', [m('td', 'overig'), ...showDiffInColumns(h.curline[2], h.tOv)]) : '',
          m('tr', [m('td', 'geboortecentrum'), ...showDiffInColumns(aantalGeboortecentrum2, aantalGeboortecentrum)]),
          m('tr', [m('td', 'ziekenhuis 2de-lijn'), ...showDiffInColumns(aantalTweedelijn2, aantalTweedelijn)]),

          m('tr', m('td.table-header[colspan=4]', 'Productie verschuivingen')),
          m('tr', [m('td', 'TOTAAL'), m('td', f(bevalling_2e_lijn)), m('td.left-align[colspan=2]', 'bevallingen')]),
          m('tr', [m('td', 'sectio'), m('td', f(sectio)), m('td', 'overig'), m('td', f(overig))]),
          m('tr', [m('td'), m('td'), m('td', 'acuut'), m('td', f(acuut))]),
          m('tr', [m('td', 'overige bevallingen'), m('td', f(overige_bevallingen))]),
          m('tr', [m('td', 'post partum operaties'), m('td', f(post_partum))]),
          m('tr', [
            m('td', m('b', 'Tijd productie')),
            m('td.small', '09:00-17:00'),
            m('td'),
            m('td.small', '17:00-09:00'),
          ]),
          m('tr', [
            m('td', 'overige bevallingen'),
            m('td', f(overige_bevallingen_binnen)),
            m('td'),
            m('td', f(overige_bevallingen_buiten)),
          ]),
          m('tr', [
            m('td', 'sectio electief'),
            m('td', f(sectios_electief_binnen)),
            m('td'),
            m('td', f(sectios_electief_buiten)),
          ]),
          m('tr', [
            m('td', 'sectio spoed'),
            m('td', f(sectios_spoed_binnen)),
            m('td'),
            m('td', f(sectios_spoed_buiten)),
          ]),
          m('tr', [
            m('td', 'sectio acuut'),
            m('td', f(sectios_acuut_binnen)),
            m('td'),
            m('td', f(sectios_acuut_buiten)),
          ]),
          m('tr', [
            m('td', 'post partum operaties'),
            m('td', f(post_partum_ops_binnen)),
            m('td'),
            m('td', f(post_partum_ops_buiten)),
          ]),

          m('tr', m('td.table-header[colspan=4]', 'Infrastructuur')),
          h.active
            ? m('tr', [
                m('td', 'investeringen'),
                m('td', f(investeringen, 100)),
                m('td.left-align[colspan=2]', 'mln. €'),
              ])
            : m('tr', [
                m('td', 'boekwaarde'),
                m('td', f(-investeringen * 0.5, 100)),
                m('td.left-align[colspan=2]', 'mln. €'),
              ]),
          m('tr', [m('td', 'OK-gebruik'), m('td', f(ok_benutting, 100)), m('td.left-align[colspan=2]', 'aantal OK')]),
          m('tr', [m('td', 'oppervlakte'), m('td', f(oppervlakte)), m('td.left-align[colspan=2]', 'm² BVO')]),

          m('tr', m('td.table-header[colspan=4]', 'Personeel')),
          m('tr', [m('td', 'TOTAAL'), m('td', f(fte, 10)), m('td.left-align[colspan=2]', 'FTE')]),
          m('tr', [m('td', 'specifiek'), m('td', f(kraamafdeling1op1_fte, 10))]),
          m('tr', [m('td', 'generiek'), m('td', f(kraamafdeling_generiek_fte, 10))]),
          m('tr', [m('td', 'salariskosten'), m('td', f(salariskosten, 10)), m('td.left-align[colspan=2]', 'K€')]),
          m('tr', [m('td', 'specifiek'), m('td', f(kraamafdeling1op1_salaris, 10))]),
          m('tr', [m('td', 'generiek'), m('td', f(kraamafdeling_generiek_salaris, 10))]),
        ])
      );
    },
  };
};
