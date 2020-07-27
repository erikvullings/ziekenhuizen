import m from 'mithril';
import { HospitalMap } from './hospital-map';
import { states, actions } from './services/meiosis';
import './styles.css';

m.mount(document.body, {
  view: () => {
    return m(HospitalMap, { state: states(), actions: actions });
  },
});
