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
import { formatRoundedNumber as f } from '../utils';

export const HospitalCostModule: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { hospitals, selectedHospitalId },
        },
      },
    }) => {
      const selectedHospital = hospitals?.features
        .filter((f) => f.properties.id === selectedHospitalId)
        .shift();

      if (!selectedHospital) {
        return;
      }
      const h = selectedHospital.properties;
      const aantalGeboorten = Math.round(h.t25 + h.t30 + h.tOv);
      const aantalTweedelijn = Math.round(aantalGeboorten * 0.71);
      /** Huidig aantal geboorten na het sluiten van andere ziekenhuizen */
      const aantalGeboorten2 = h
        ? Math.round(h.curline.reduce((acc, cur) => acc + cur))
        : 0;
      /** Huidig aantal 2e-lijns geboorten na het sluiten van andere ziekenhuizen */
      const aantalTweedelijn2 = Math.round(aantalGeboorten2 * 0.71);
      const bevalling_2e_lijn = aantalTweedelijn2 - aantalTweedelijn;
      const sectio = bevalling_2e_lijn * aandeel_sectio;
      const overig =
        bevalling_2e_lijn * aandeel_sectio * aandeel_overige_sectio;
      const acuut = bevalling_2e_lijn * aandeel_sectio * aandeel_acute_sectio;
      const overige_bevallingen =
        bevalling_2e_lijn - bevalling_2e_lijn * aandeel_sectio;
      const post_partum =
        bevalling_2e_lijn * (1 - aandeel_sectio) * aandeel_post_partum_ops;
      console.table({ overige_bevallingen, bevallingen_in_bedrijfstijd });
      const overige_bevallingen_binnen =
        overige_bevallingen * bevallingen_in_bedrijfstijd;
      const overige_bevallingen_buiten =
        overige_bevallingen * (1 - bevallingen_in_bedrijfstijd);
      const sectios_electief_binnen =
        bevalling_2e_lijn *
        aandeel_sectio *
        electieve_sectio_in_bedrijfstijd *
        aandeel_electieve_sectio;
      const sectios_electief_buiten =
        bevalling_2e_lijn *
        aandeel_sectio *
        (1 - electieve_sectio_in_bedrijfstijd) *
        aandeel_electieve_sectio;
      const sectios_spoed_binnen =
        bevalling_2e_lijn *
        aandeel_sectio *
        spoed_sectio_in_bedrijfstijd *
        aandeel_spoed_sectio;
      const sectios_spoed_buiten =
        bevalling_2e_lijn *
        aandeel_sectio *
        (1 - spoed_sectio_in_bedrijfstijd) *
        aandeel_spoed_sectio;
      const sectios_acuut_binnen =
        bevalling_2e_lijn *
        aandeel_sectio *
        (1 - acute_sectio_in_bedrijfstijd) *
        aandeel_acute_sectio;
      const sectios_acuut_buiten =
        bevalling_2e_lijn *
        aandeel_sectio *
        acute_sectio_in_bedrijfstijd *
        aandeel_acute_sectio;
      const post_partum_ops_binnen =
        bevalling_2e_lijn *
        (1 - aandeel_sectio) *
        aandeel_post_partum_ops *
        bevallingen_in_bedrijfstijd;
      const post_partum_ops_buiten =
        bevalling_2e_lijn *
        (1 - aandeel_sectio) *
        aandeel_post_partum_ops *
        (1 - bevallingen_in_bedrijfstijd);
      const investeringen =
        (bevalling_2e_lijn * investering_per_partus) / 1000000;
      const ok_benutting =
        (bevalling_2e_lijn * aandeel_sectio +
          bevalling_2e_lijn * (1 - aandeel_sectio) * aandeel_post_partum_ops) *
        ok_per_partus;
      const oppervlakte = bevalling_2e_lijn * bvo_per_partus_2e_lijn;
      const fte = bevalling_2e_lijn * aantal_fte;
      const kraamafdeling1op1_fte = bevalling_2e_lijn * fte_kraam_direct;
      const kraamafdeling_indirect_fte = bevalling_2e_lijn * fte_kraam_indirect;
      const salariskosten = (bevalling_2e_lijn * salaris) / 1000;
      const kraamafdeling1op1_salaris =
        (bevalling_2e_lijn * salaris_kraam_direct) / 1000;
      const kraamafdeling_indirect_salaris =
        (bevalling_2e_lijn * salaris_kraam_indirect) / 1000;
      return m(
        'table',
        m('tbody', [
          m('tr', m('td.table-header[colspan=4]', 'Productie verschuivingen')),
          m('tr', [
            m('td', "Sectio's"),
            m('td', f(sectio)),
            m('td', 'overig'),
            m('td', f(overig)),
          ]),
          m('tr', [m('td'), m('td'), m('td', 'acuut'), m('td', f(acuut))]),
          m('tr', [
            m('td', 'overige bevallingen'),
            m('td', f(overige_bevallingen)),
          ]),
          m('tr', [m('td', 'Totaal'), m('td', f(bevalling_2e_lijn))]),
          m('tr', [m('td', 'post partum operaties'), m('td', f(post_partum))]),
          m('tr', [
            m('td', 'Binnen bedrijfstijd'),
            m('td', 'Ja'),
            m('td'),
            m('td', 'Nee'),
          ]),
          m('tr', [
            m('td', 'overige bevallingen'),
            m('td', f(overige_bevallingen_binnen)),
            m('td'),
            m('td', f(overige_bevallingen_buiten)),
          ]),
          m('tr', [
            m('td', "Sectio's Electief"),
            m('td', f(sectios_electief_binnen)),
            m('td'),
            m('td', f(sectios_electief_buiten)),
          ]),
          m('tr', [
            m('td', "Sectio's spoed"),
            m('td', f(sectios_spoed_binnen)),
            m('td'),
            m('td', f(sectios_spoed_buiten)),
          ]),
          m('tr', [
            m('td', "Sectio's Acuut"),
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
          m('tr', [
            m('td', '(des)investeringen'),
            m('td', f(investeringen, 100)),
            m('td', { colspan: '2' }, 'in mln EURO'),
          ]),
          m('tr', [
            m('td', 'OK-benutting'),
            m('td', f(ok_benutting, 100)),
            m('td', { colspan: '2' }, "in aantal OK's"),
          ]),
          m('tr', [
            m('td', 'oppervakte'),
            m('td', f(oppervlakte)),
            m('td', { colspan: '2' }, 'in m2 BVO'),
          ]),
          m('tr', m('td.table-header[colspan=4]', 'Personeel')),
          m('tr', [
            m('td', 'aantal FTE'),
            m('td', f(fte, 10)),
            m('td', { colspan: '2' }, 'basis 2e-lijns partussen'),
          ]),
          m('tr', [
            m('td', '1:1 kraamafdeling'),
            m('td', f(kraamafdeling1op1_fte, 10)),
            m('td', 'FTE'),
            m('td'),
          ]),
          m('tr', [
            m('td', 'indirect kraamafdeling'),
            m('td', f(kraamafdeling_indirect_fte, 10)),
            m('td', 'FTE'),
            m('td'),
          ]),
          m('tr', [
            m('td', 'salariskosten'),
            m('td', f(salariskosten)),
            m('td', { colspan: '2' }, 'in kEURO'),
          ]),
          m('tr', [
            m('td', '1:1 kraamafdeling'),
            m('td', f(kraamafdeling1op1_salaris, 10)),
            m('td', 'direct'),
            m('td'),
          ]),
          m('tr', [
            m('td', 'indirect kraamafdeling'),
            m('td', f(kraamafdeling_indirect_salaris, 10)),
            m('td', 'indirect'),
            m('td'),
          ]),
          m('tr', m('td.table-header[colspan=4]', 'Geboortecijfers')),
        ])
      );
    },
  };
};
