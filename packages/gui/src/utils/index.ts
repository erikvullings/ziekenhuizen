import 'proj4';
import 'proj4leaflet';
import L from 'leaflet';
import m from 'mithril';
// import ziekenhuisImg from '../assets/icons/ziekenhuis.png';
// import ziekenhuisSvgV from '../assets/icons/ziekenhuis_v.svg';
// import ziekenhuisSvgX from '../assets/icons/ziekenhuis_x.svg';
// import ziekenhuisSvgI from '../assets/icons/ziekenhuis_!.svg';

export const formatNumber = (x: number) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatRoundedNumber = (x: number, div = 1) =>
  (Math.round(x * div) / div).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const round = (x: number) => Math.round(100 * x);

export const showDiff = (cur: number, orig: number) => {
  const c = Math.round(cur);
  const o = Math.round(orig);
  const sign = c > o ? '+' : '';
  return c === o
    ? formatNumber(c)
    : `${formatNumber(c)} (${sign}${formatNumber(c - o)}, 
      ${sign}${round(o ? (c - o) / o : 1)}%)`;
};

export const showDiffInColumns = (cur: number, orig: number) => {
  const c = Math.round(cur);
  const o = Math.round(orig);
  const sign = c > o ? '+' : '';
  return c === o
    ? [m('td', formatNumber(c))]
    : [
        m('td', formatNumber(c)),
        m('td.left-align[colspan=2]', `(${sign}${formatNumber(c - o)}, ${sign}${round(o ? (c - o) / o : 1)}%)`),
      ];
};

export const RDnew = new L.Proj.CRS(
  'EPSG:28992',
  '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs',
  {
    resolutions: [
      3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21,
    ],
    bounds: L.bounds([-285401.92, 22598.08], [595401.9199999999, 903401.9199999999]),
    origin: [-285401.92, 22598.08],
  }
);

/** Convert a number to a color (e.g. for the #births) */
export const getColor = (d: number) =>
  d > 1000
    ? '#8c2d04'
    : d > 500
    ? '#cc4c02'
    : d > 200
    ? '#ec7014'
    : d > 100
    ? '#fe9929'
    : d > 50
    ? '#fec44f'
    : d > 20
    ? '#fee391'
    : d > 10
    ? '#ffffd4'
    : '#fff';

// const LeafletIcon = L.Icon.extend({
//   options: {
//     // shadowUrl: 'leaf-shadow.png',
//     // shadowSize:   [50, 64],
//     // shadowAnchor: [4, 62],
//     iconSize: [25, 25],
//     iconAnchor: [12, 12],
//     popupAnchor: [-3, -30],
//   },
// });

const ziekenhuisSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" stroke="black" stroke-width="4" fill="{mapIconColor}" viewBox="0 0 36 44" width="20" height="20"><path d="M18.664.253a1 1 0 0 0-1.328 0L.328 15.702a1 1 0 0 0-.328.74V44h36V16.443a1 1 0 0 0-.328-.74zM25 29h-4v4a3 3 0 0 1-6 0v-4h-4a3 3 0 0 1 0-6h4v-4a3 3 0 0 1 6 0v4h4a3 3 0 0 1 0 6z"/></svg>';

const ambulancePostSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" stroke="black" stroke-width="4" fill="{mapIconColor}" viewBox="0 0 500 625" enable-background="new 0 0 500 500" xml:space="preserve"><g><g><g><path d="M64.9,443.8c12.3,0,24.5,0,36.8,0c29.5,0,58.9,0,88.4,0c35.6,0,71.3,0,106.9,0c30.8,0,61.7,0,92.5,0     c15,0,30,0.5,45,0c0.2,0,0.4,0,0.6,0c7.8,0,15.4-6.9,15-15c-0.4-8.1-6.6-15-15-15c-12.3,0-24.5,0-36.8,0c-29.5,0-58.9,0-88.4,0     c-35.6,0-71.3,0-106.9,0c-30.8,0-61.7,0-92.5,0c-15,0-30-0.5-45,0c-0.2,0-0.4,0-0.6,0c-7.8,0-15.4,6.9-15,15     C50.2,437,56.4,443.8,64.9,443.8L64.9,443.8z"/></g></g><g><g><path d="M150,429c0-35.3,0-70.5,0-105.8c0-18,0-36,0-54c0-6.5,0.1-12.9,0.8-19.4c-0.3,3.1,0.4-2.6,0.6-3.5     c0.4-2,0.8-4,1.3-6c1-4.1,2.2-8.2,3.7-12.2c0.3-0.8,2.4-5.9,1.2-3.2c0.7-1.6,1.5-3.2,2.2-4.8c2-3.9,4.1-7.8,6.5-11.4     c1-1.5,1.9-2.9,3-4.3c-0.1,0.1,2.5-3.4,1.2-1.6c-1.3,1.7,1.3-1.6,1.3-1.6c2.5-3,5.1-5.9,7.9-8.7c2.8-2.8,5.8-5.3,8.8-7.8     c2.2-1.8,0.5-0.4,0.1-0.1c0.9-0.7,1.8-1.3,2.7-1.9c2-1.4,4-2.7,6-4c3.2-2,6.5-3.8,9.8-5.4c0.8-0.4,5.8-2.6,3.1-1.5     c2-0.9,4.1-1.6,6.2-2.4c3.8-1.3,7.7-2.4,11.6-3.3c2-0.5,4-0.9,6-1.2c0.9-0.2,1.8-0.3,2.7-0.4c1.1-0.2,0.9-0.1-0.6,0.1     c0.7-0.1,1.4-0.2,2.1-0.2c8.1-0.8,16.3-0.7,24.4,0.1c3,0.3,0.7,0.1,0.1,0c0.9,0.1,1.8,0.3,2.7,0.4c2.2,0.4,4.5,0.8,6.7,1.3     c3.9,0.9,7.8,2,11.6,3.3c2.1,0.7,4.2,1.5,6.2,2.4c-2.7-1.1,1.6,0.8,2.5,1.2c4,1.9,7.8,4,11.5,6.4c1.5,0.9,2.9,1.9,4.4,2.9     c0.9,0.6,1.8,1.3,2.7,1.9c1.9,1.3-1.7-1.4,0.1,0.1c3.2,2.6,6.3,5.3,9.3,8.3c2.8,2.8,5.4,5.7,7.9,8.7c0.6,0.7,1.1,1.4,1.6,2     c-1.8-2.3,0,0,0.4,0.6c1.3,1.8,2.5,3.6,3.7,5.4c2.1,3.3,4.1,6.8,5.9,10.3c0.9,1.8,1.7,3.6,2.5,5.4c-1.2-2.8,1.1,2.9,1.4,3.8     c1.4,3.8,2.5,7.7,3.5,11.6c0.4,1.8,0.8,3.5,1.2,5.3c0.2,1.1,0.4,2.2,0.6,3.4c0.1,0.7,0.2,1.4,0.3,2c-0.2-1.5-0.2-1.7-0.1-0.6     c0.5,4.6,0.7,9.2,0.8,13.9c0,14,0,28,0,42c0,40,0,80,0,120c0,0.8,0,1.7,0,2.5c0,7.8,6.9,15.4,15,15c8.1-0.4,15-6.6,15-15     c0-36.7,0-73.4,0-110.1c0-17.4,0-34.7,0-52.1c0-28-7.5-55.8-24.2-78.6c-22.4-30.5-55.6-49.8-93.3-53.9     c-36.3-3.9-73.2,9-100.2,33.4c-26.9,24.3-42.2,59.8-42.4,96c-0.1,12.6,0,25.3,0,37.9c0,41.5,0,83,0,124.6c0,0.9,0,1.8,0,2.8     c0,7.8,6.9,15.4,15,15C143.1,443.6,150,437.4,150,429L150,429z"/></g></g><g><g><path d="M264.2,116.6c0-15.3,0-30.6,0-46c0-7.8-6.9-15.4-15-15c-8.1,0.4-15,6.6-15,15c0,15.3,0,30.6,0,46     c0,7.8,6.9,15.4,15,15C257.4,131.2,264.2,125,264.2,116.6L264.2,116.6z"/></g></g><g><g><path d="M146,153.1c-10.6-10.6-21.3-21.3-31.9-31.9c-5.7-5.7-15.5-5.7-21.2,0c-5.7,5.7-5.7,15.5,0,21.2     c10.6,10.6,21.3,21.3,31.9,31.9c5.7,5.7,15.5,5.7,21.2,0C151.8,168.6,151.8,158.9,146,153.1L146,153.1z"/></g></g><g><g><path d="M385.9,121.2c-10.9,10.9-21.8,21.8-32.7,32.7c-5.7,5.7-5.7,15.5,0,21.2c5.7,5.7,15.5,5.7,21.2,0     c10.9-10.9,21.8-21.8,32.7-32.7c5.7-5.7,5.7-15.5,0-21.2C401.4,115.4,391.6,115.4,385.9,121.2L385.9,121.2z"/></g></g></g></svg>';

export const createIcon = (mapIconColor: string) =>
  L.divIcon({
    className: 'leaflet-data-marker',
    html: L.Util.template(ziekenhuisSvg, { mapIconColor }),
    iconAnchor: [12, 12],
    iconSize: [25, 25],
    popupAnchor: [0, -30],
  });

export const ziekenhuisIconV = L.divIcon({
  className: 'leaflet-data-marker',
  html: L.Util.template(ziekenhuisSvg, { mapIconColor: '#fff' }),
  iconAnchor: [12, 12],
  iconSize: [25, 25],
  popupAnchor: [0, -30],
});

export const ziekenhuisIconX = L.divIcon({
  className: 'leaflet-data-marker',
  html: L.Util.template(ziekenhuisSvg, { mapIconColor: '#ff0000' }),
  iconAnchor: [12, 12],
  iconSize: [25, 25],
  popupAnchor: [0, -30],
});

export const ambulancePostIcon = L.divIcon({
  className: 'leaflet-data-marker',
  html: L.Util.template(ambulancePostSvg, { mapIconColor: 'lightgrey' }),
  iconAnchor: [12, 12],
  iconSize: [25, 25],
  popupAnchor: [0, -30],
});

// export const ziekenhuisIcon = new (LeafletIcon as any)({
//   iconUrl: ziekenhuisImg,
// });
// export const ziekenhuisIconV = new (LeafletIcon as any)({
//   iconUrl: ziekenhuisSvgV,
// });
// export const ziekenhuisIconI = new (LeafletIcon as any)({
//   iconUrl: ziekenhuisSvgI,
// });
// export const ziekenhuisIconX = new (LeafletIcon as any)({
//   iconUrl: ziekenhuisSvgX,
// });
