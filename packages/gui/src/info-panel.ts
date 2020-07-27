import m, { FactoryComponent } from 'mithril';
import { MeiosisComponent } from './services/meiosis';
import houseImg from './assets/icons/house.svg';
import healthImg from './assets/icons/health_centre.svg';
import ziekenhuisImg from './assets/icons/ziekenhuis.svg';
import childImg from './assets/icons/child.svg';
import { formatNumber, showDiff } from './utils';

const DashboardPanel: FactoryComponent<{
  status: [number, number, number];
}> = () => {
  return {
    view: ({ attrs: { status } }) => {
      const aantalGeboorten = status.reduce((acc, cur) => acc + cur);
      const aantalThuisgeboren = Math.round(aantalGeboorten * 0.129);
      const aantalGeboortecentrum = Math.round(aantalGeboorten * 0.15);
      const aantalTweedelijn = Math.round(aantalGeboorten * 0.71);
      const overig = Math.round(
        aantalGeboorten -
          aantalThuisgeboren -
          aantalTweedelijn -
          aantalGeboortecentrum
      );
      console.log(`Aantal geboorten: ${aantalGeboorten}`);

      return m('ul.list-inline', [
        m('li', [
          m('img', { src: houseImg, width: 20, height: 20 }),
          m('span', formatNumber(aantalThuisgeboren)),
        ]),
        m('li', [
          m('img', { src: healthImg, width: 20, height: 20 }),
          m('span', formatNumber(aantalGeboortecentrum)),
        ]),
        m('li', [
          m('img', { src: ziekenhuisImg, width: 20, height: 20 }),
          m('span', formatNumber(aantalTweedelijn)),
        ]),
        m('li', [
          m('img', { src: childImg, width: 20, height: 20 }),
          m('span', formatNumber(overig)),
        ]),
      ]);
    },
  };
};

export const InfoPanel: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state } }) => {
      const { baseline = [0, 0, 0], curline = [0, 0, 0] } = state.app;
      return [
        m('h1', 'Baseline 2018'),
        m(DashboardPanel, { status: baseline }),
        m('ul', [
          m('li', `< 25 min: ${showDiff(curline[0], baseline[0])}`),
          m('li', `< 30 min: ${showDiff(curline[1], baseline[1])}`),
          m('li', `> 30 min: ${showDiff(curline[2], baseline[2])}`),
        ]),
      ];
    },
  };
};
