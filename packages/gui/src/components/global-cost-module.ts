import m from 'mithril';
import { MeiosisComponent } from '../services/meiosis';

export const GlobalCostModule: MeiosisComponent = () => {
  return {
    view: () => {
      return m('div', 'Todo landelijke kosten');
    },
  };
};
