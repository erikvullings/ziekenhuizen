import m from 'mithril';
import { UpdateStream } from '../meiosis';
import { IZiekenhuis } from '../../models/ziekenhuis';
import amublances from '../../assets/ambulancestandplaatsen.json';
import amublancesReach from '../../assets/ambulancesbereik.json';
import ziekenhuizen from '../../assets/ziekenhuizen.json';
import aanrijdtijd25 from '../../assets/aanrijden25.json';
import demografie from '../../assets/demografie.json';
import { createIcon, getColor, ziekenhuisIconX } from '../../utils';
import { IAmbulancePost } from '../../models';

type DemografieType = Array<{
  pc: number;
  t: number;
  c: [number, number];
  in25: number[];
  in30: number[];
  overig: number[];
}>;

// Add curline
ziekenhuizen.features = (ziekenhuizen as GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>).features.map((z) => ({
  ...z,
  properties: {
    ...z.properties,
    // active: true,
    curline: [0, 0, 0],
  },
}));

const inactive = '?inactive';

const updateHash = (hospitals?: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>) => {
  const inactiveHospitals = hospitals?.features.filter((h) => !h.properties.active).map((h) => h.properties.id);
  // const i = location.href.indexOf(inactive);
  // const href = i > 0 ? location.href.substr(0, i) : location.href;
  if (inactiveHospitals && inactiveHospitals.length > 0) {
    console.log(`Inactive hospitals: ${inactiveHospitals.join(',')}`);
  }
  m.route.set(inactiveHospitals && inactiveHospitals.length > 0 ? `${inactive}=${inactiveHospitals.join(',')}` : '');
  // location.replace(
  //   href +
  //     (inactiveHospitals && inactiveHospitals.length > 0
  //       ? `${inactive}=${inactiveHospitals.join(',')}`
  //       : '')
  // );
};

const inactivateHospitalsFromHash = (hospitals?: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>) => {
  const i = location.href.indexOf(inactive);
  if (i < 0) return;
  try {
    const inactiveHospitalIds = location.href
      .substring(i + inactive.length + 1)
      .split(',')
      .map((n) => +n);
    hospitals?.features.forEach((h) => {
      const isActive = inactiveHospitalIds.indexOf(h.properties.id) < 0;
      h.properties.active = isActive;
    });
    console.log(`Inactive hospitals from hash: ${inactiveHospitalIds}`);
  } catch (e) {
    console.log(e);
  }
};

export type BirthsInArea = [totalBirthsIn25min: number, totalBirthsIn30min: number, totalBirthsOutside30min: number];

/** Application state */

export interface IAppStateModel {
  app: Partial<{
    ambulancePosts: GeoJSON.FeatureCollection<GeoJSON.Point, IAmbulancePost>;
    ambulanceReach: GeoJSON.FeatureCollection<GeoJSON.Polygon, IAmbulancePost & { v: string }>;
    hospitals: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>;
    aanrijd25: GeoJSON.FeatureCollection<GeoJSON.Polygon>;
    selectedHospitalId: number;
    /** Total births in 25 min area, in 30 min, outside 30 min */
    baseline: BirthsInArea;
    /** Total births in 25 min area, in 30 min, outside 30 min */
    curline: BirthsInArea;
    activeScenario?: number;
    isSearching: boolean;
    searchQuery?: string;
  }>;
}

const createFindActiveHospital = (hospitals: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>) => {
  const activeHospitals = hospitals.features.filter((h) => h.properties.active);
  return (ids: number[]) =>
    ids.length > 0
      ? activeHospitals
          .filter((h) => ids.indexOf(h.properties.id) >= 0)
          .sort((a, b) => {
            const idA = ids.indexOf(a.properties.id);
            const idB = ids.indexOf(b.properties.id);
            return idA < idB ? -1 : idA > idB ? 1 : 0;
          })
          .shift()
      : undefined;
};

const computeCurline = (
  hospitals: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis> = {
    type: 'FeatureCollection',
    features: [],
  }
) => {
  inactivateHospitalsFromHash(hospitals);
  // if (!hospitals) {
  //   return { hospitals, curline: [0,0,0] };
  // }
  const resetCurlineCount = () =>
    hospitals.features.forEach((f) => {
      f.properties.curline = [0, 0, 0];
      f.properties.coverage = [];
    });

  resetCurlineCount();
  const findActiveHospital = createFindActiveHospital(hospitals);

  (demografie as DemografieType).forEach((pc) => {
    if (pc.in25.length > 0) {
      const f = findActiveHospital(pc.in25);
      if (f) {
        f.properties.curline[0] += pc.t;
        f.properties.coverage.push({
          pc: pc.pc,
          coord: pc.c,
          births: pc.t,
          cat: 0,
        });
        return;
      }
    }
    if (pc.in30.length > 0) {
      const f = findActiveHospital(pc.in30);
      if (f) {
        f.properties.curline[1] += pc.t;
        f.properties.coverage.push({
          pc: pc.pc,
          coord: pc.c,
          births: pc.t,
          cat: 1,
        });
        return;
      }
    }
    if (pc.overig.length > 0) {
      const f = findActiveHospital(pc.overig);
      if (f) {
        f.properties.curline[2] += pc.t;
        f.properties.coverage.push({
          pc: pc.pc,
          coord: pc.c,
          births: pc.t,
          cat: 2,
        });
        return;
      }
    }
    throw new Error('PC not assigned: ' + pc.pc);
  });

  const curline = hospitals.features.reduce(
    (acc, f) => [acc[0] + f.properties.curline[0], acc[1] + f.properties.curline[1], acc[2] + f.properties.curline[2]],
    [0, 0, 0]
  ) as BirthsInArea;

  return {
    hospitals,
    curline,
  };
};

export interface IAppStateActions {
  inactivateHospitalsFromHash: (layer: L.GeoJSON) => void;
  selectHospital: (id: number) => void;
  toggleHospitalActivity: (id: number, layer?: L.GeoJSON) => void;
  search: (isSearching: boolean, searchQuery?: string) => void;
  activateScenario: (scenarioIndex: number) => void;
  saveScenario: (scenarioIndex: number) => void;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream) => IAppStateActions;
}

export const appStateMgmt = {
  initial: {
    app: {
      ...computeCurline(ziekenhuizen as GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>),
      ambulancePosts: amublances,
      ambulanceReach: amublancesReach,
      aanrijd25: aanrijdtijd25,
      baseline: (ziekenhuizen as GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>).features.reduce(
        (acc, cur) => {
          return [
            acc[0] + cur.properties.t25,
            acc[1] + cur.properties.t30,
            acc[2] + cur.properties.tOv,
          ] as BirthsInArea;
        },
        [0, 0, 0] as BirthsInArea
      ),
      isSearching: false,
      searchQuery: '',
    },
  } as IAppStateModel,
  actions: (update: UpdateStream): IAppStateActions => {
    return {
      inactivateHospitalsFromHash: (layer: L.GeoJSON) => {
        update(({ app: { hospitals, aanrijd25, selectedHospitalId, baseline, activeScenario } }) => {
          const app = {
            ...computeCurline(hospitals),
            aanrijd25,
            selectedHospitalId,
            baseline,
            activeScenario,
          };
          if (layer) {
            let i = 0;
            layer.eachLayer((l) => {
              const curHospital = app.hospitals.features[i].properties;
              if (curHospital.active) {
                const curLoad =
                  ((3 * (curHospital.curline[0] - curHospital.t25)) / curHospital.t25 +
                    (2 * (curHospital.curline[1] - curHospital.t30)) / curHospital.t30 +
                    (curHospital.curline[2] - curHospital.tOv) / curHospital.tOv) /
                  6;
                const curColor = getColor(100 * curLoad);
                (l as L.Marker).setIcon(createIcon(curColor)).setOpacity(1);
              } else {
                (l as L.Marker).setIcon(ziekenhuisIconX).setOpacity(0.3);
              }
              i++;
            });
          }
          return { app };
        });
      },
      selectHospital: (selectedHospitalId: number) => {
        update({ app: { selectedHospitalId } });
        m.redraw();
      },
      toggleHospitalActivity: (id: number, layer?: L.GeoJSON) => {
        update(({ app: { hospitals, selectedHospitalId, baseline, aanrijd25, activeScenario } }) => {
          hospitals?.features.some((h) => {
            if (h.properties.id === id) {
              h.properties.active = !h.properties.active;
              return true;
            }
            return false;
          });
          updateHash(hospitals);
          const app = {
            ...computeCurline(hospitals),
            aanrijd25,
            selectedHospitalId,
            baseline,
            activeScenario,
          };
          if (layer) {
            let i = 0;
            layer.eachLayer((l) => {
              const curHospital = app.hospitals.features[i].properties;
              if (curHospital.active) {
                const curLoad =
                  ((3 * (curHospital.curline[0] - curHospital.t25)) / curHospital.t25 +
                    (2 * (curHospital.curline[1] - curHospital.t30)) / curHospital.t30 +
                    (curHospital.curline[2] - curHospital.tOv) / curHospital.tOv) /
                  6;
                const curColor = getColor(100 * curLoad);
                (l as L.Marker).setIcon(createIcon(curColor)).setOpacity(1);
              } else {
                (l as L.Marker).setIcon(ziekenhuisIconX).setOpacity(0.3);
              }
              i++;
            });
          }
          return { app };
        });
        // m.redraw();
      },
      search: (isSearching: boolean, searchQuery?: string) => update({ app: { isSearching, searchQuery } }),
      activateScenario: (scenarioIndex) => {
        window.localStorage.setItem('ziekenhuizen.activeScenario', scenarioIndex.toString());
        const href = window.localStorage.getItem(`ziekenhuizen.scenario${scenarioIndex}`);
        if (href && href !== window.location.href) {
          window.location.href = href;
          window.location.reload();
        }
        update({ app: { activeScenario: scenarioIndex } });
      },
      saveScenario: (scenarioIndex) => {
        window.localStorage.setItem(`ziekenhuizen.scenario${scenarioIndex}`, window.location.href);
      },
    };
  },
} as IAppState;
