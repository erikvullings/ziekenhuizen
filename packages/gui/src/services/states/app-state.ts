import m from 'mithril';
import { UpdateStream } from '../meiosis';
import { IZiekenhuis } from '../../models/ziekenhuis';
import ziekenhuizen from '../../assets/ziekenhuizen.json';
import aanrijdtijd25 from '../../assets/aanrijden25.json';
import demografie from '../../assets/demografie.json';

type DemografieType = Array<{
  pc: number;
  t: number;
  c: [number, number];
  in25: number[];
  in30: number[];
  overig: number[];
}>;

// Add curline
ziekenhuizen.features = ziekenhuizen.features.map((z: any) => ({
  ...z,
  properties: {
    ...z.properties,
    active: true,
    curline: [0, 0, 0],
  },
}));

/** Application state */

export interface IAppStateModel {
  app: Partial<{
    hospitals: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>;
    aanrijd25: GeoJSON.FeatureCollection<GeoJSON.Polygon>;
    selectedHospitalId: number;
    /** Total births in 25 min area, in 30 min, outside 30 min */
    baseline: [number, number, number];
    /** Total births in 25 min area, in 30 min, outside 30 min */
    curline: [number, number, number];
    isSearching: boolean;
    searchQuery?: string;
  }>;
}

const createFindActiveHospital = (
  hospitals: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>
) => {
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
  hospitals?: GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>
) => {
  if (!hospitals) {
    return hospitals;
  }
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
    (acc, f) => [
      acc[0] + f.properties.curline[0],
      acc[1] + f.properties.curline[1],
      acc[2] + f.properties.curline[2],
    ],
    [0, 0, 0]
  ) as [number, number, number];
  return {
    hospitals,
    curline,
  };
};

export interface IAppStateActions {
  selectHospital: (id: number) => void;
  toggleHospitalActivity: (id: number) => void;
  search: (isSearching: boolean, searchQuery?: string) => void;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream) => IAppStateActions;
}

export const appStateMgmt = {
  initial: {
    app: {
      ...computeCurline(
        ziekenhuizen as GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>
      ),
      aanrijd25: aanrijdtijd25,
      baseline: (ziekenhuizen as GeoJSON.FeatureCollection<
        GeoJSON.Point,
        IZiekenhuis
      >).features.reduce(
        (acc, cur) => {
          return [
            acc[0] + cur.properties.t25,
            acc[1] + cur.properties.t30,
            acc[2] + cur.properties.tOv,
          ] as [number, number, number];
        },
        [0, 0, 0] as [number, number, number]
      ),
      isSearching: false,
      searchQuery: '',
    },
  } as IAppStateModel,
  actions: (us: UpdateStream): IAppStateActions => {
    return {
      selectHospital: (selectedHospitalId: number) => {
        us({ app: { selectedHospitalId } });
        m.redraw();
      },
      toggleHospitalActivity: (id: number) => {
        us(
          ({ app: { hospitals, selectedHospitalId, baseline, aanrijd25 } }) => {
            hospitals?.features.some((h) => {
              if (h.properties.id === id) {
                h.properties.active = !h.properties.active;
                return true;
              }
              return false;
            });
            return {
              app: {
                ...computeCurline(hospitals),
                aanrijd25,
                selectedHospitalId,
                baseline,
              },
            };
          }
        );
        // m.redraw();
      },
      search: (isSearching: boolean, searchQuery?: string) =>
        us({ app: { isSearching, searchQuery } }),
    };
  },
} as IAppState;
