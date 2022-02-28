import m, { FactoryComponent } from 'mithril';
import { MeiosisComponent } from './services/meiosis';
import houseImg from './assets/icons/house.svg';
import healthImg from './assets/icons/health_centre.svg';
import ziekenhuisImg from './assets/icons/ziekenhuis.svg';
import childImg from './assets/icons/child.svg';
import { formatNumber } from './utils';
import { GlobalCostModule } from './components/global-cost-module';
import { gemPerc1eLijnTh, gemPerc1eLijnZh, gemPerc2eLijnZh } from './models/cost-variables';

const DashboardPanel: FactoryComponent<{
  status: [number, number, number];
}> = () => {
  return {
    view: ({ attrs: { status } }) => {
      const aantalGeboorten = status.reduce((acc, cur) => acc + cur);
      const aantalThuisgeboren = Math.round(aantalGeboorten * gemPerc1eLijnTh);
      const aantalGeboortecentrum = Math.round(aantalGeboorten * gemPerc1eLijnZh);
      const aantalTweedelijn = Math.round(aantalGeboorten * gemPerc2eLijnZh);
      const overig = Math.round(aantalGeboorten - aantalThuisgeboren - aantalTweedelijn - aantalGeboortecentrum);
      console.log(`Aantal geboorten: ${aantalGeboorten}`);

      return m('ul.list-inline', [
        m('li', [m('img', { src: houseImg, width: 20, height: 20 }), m('span', formatNumber(aantalThuisgeboren))]),
        m('li', [m('img', { src: healthImg, width: 20, height: 20 }), m('span', formatNumber(aantalGeboortecentrum))]),
        m('li', [m('img', { src: ziekenhuisImg, width: 20, height: 20 }), m('span', formatNumber(aantalTweedelijn))]),
        m('li', [m('img', { src: childImg, width: 20, height: 20 }), m('span', formatNumber(overig))]),
      ]);
    },
  };
};

const ScenarioButton: FactoryComponent<{
  buttonName: number;
  activeScenario?: number;
  reload: (index: number) => void;
}> = () => {
  return {
    view: ({ attrs: { buttonName, activeScenario, reload } }) => {
      return m('input[type=button]', {
        value: `S${buttonName}`,
        style: buttonName === activeScenario ? 'color: red' : '',
        onclick: () => reload && reload(buttonName),
      });
    },
  };
};

const SaveScenarioButton: FactoryComponent<{
  activeScenario?: number;
  save: (index: number) => void;
}> = () => {
  return {
    view: ({ attrs: { activeScenario, save } }) => {
      return m('input[type=button]', {
        value: `Save`,
        onclick: () => activeScenario && save && save(activeScenario),
      });
    },
  };
};

const SaveScenarioPanel: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { activeScenario = parseInt(localStorage.getItem('ziekenhuizen.activeScenario') || '1') },
        },
        actions,
      },
    }) => {
      const reload = actions.activateScenario;
      const save = actions.saveScenario;
      return m(
        '.right-align',
        m('ul.list-inline', [
          m('li', m(ScenarioButton, { buttonName: 1, activeScenario, reload })),
          m('li', m(ScenarioButton, { buttonName: 2, activeScenario, reload })),
          m('li', m(ScenarioButton, { buttonName: 3, activeScenario, reload })),
          m('li', m(SaveScenarioButton, { activeScenario, save })),
        ])
      );
    },
  };
};

export const InfoPanel: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) => {
      const { baseline = [0, 0, 0], hospitals } = state.app;
      const selectedHospitalsCount = hospitals?.features.filter((h) => h.properties.active).length;
      const totalBirths = baseline.reduce((acc, cur) => acc + cur);
      const qosBaseline = Math.round(100 * (1 - (baseline[1] + 2 * baseline[2]) / totalBirths));
      return [
        m(SaveScenarioPanel, { state, actions }),
        m(
          'h2',
          m.trust(
            `Baseline 2018 (QoS: ${qosBaseline}, 
            <a href="https://www.zorginstituutnederland.nl/publicaties/rapport/2017/06/06/definitieve-indicatorenset-integrale-geboortezorg" target="_blank">bron</a>)`
          )
        ),
        m('h3', `Geselecteerd aantal ziekenhuizen: ${selectedHospitalsCount}/${hospitals?.features.length}`),
        m(DashboardPanel, { status: baseline }),
        m(GlobalCostModule, { state, actions }),
      ];
    },
  };
};
