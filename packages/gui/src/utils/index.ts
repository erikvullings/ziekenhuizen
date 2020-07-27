import 'proj4';
import 'proj4leaflet';
import L from 'leaflet';
// import ziekenhuisImg from '../assets/icons/ziekenhuis.png';
// import ziekenhuisSvgV from '../assets/icons/ziekenhuis_v.svg';
// import ziekenhuisSvgX from '../assets/icons/ziekenhuis_x.svg';
// import ziekenhuisSvgI from '../assets/icons/ziekenhuis_!.svg';

export const formatNumber = (x: number) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const showDiff = (cur: number, orig: number) => {
  const c = Math.round(cur);
  const o = Math.round(orig);
  return c === o
    ? formatNumber(c)
    : `${formatNumber(c)} (${c > o ? '+' : ''}${formatNumber(c - o)})`;
};

export const RDnew = new L.Proj.CRS(
  'EPSG:28992',
  '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs',
  {
    resolutions: [
      3440.64,
      1720.32,
      860.16,
      430.08,
      215.04,
      107.52,
      53.76,
      26.88,
      13.44,
      6.72,
      3.36,
      1.68,
      0.84,
      0.42,
      0.21,
    ],
    bounds: L.bounds(
      [-285401.92, 22598.08],
      [595401.9199999999, 903401.9199999999]
    ),
    origin: [-285401.92, 22598.08],
  }
);

/** Convert a number to a color (e.g. for the #births) */
export const getColor = (d: number) =>
  d > 1000
    ? '#800026'
    : d > 500
    ? '#BD0026'
    : d > 200
    ? '#E31A1C'
    : d > 100
    ? '#FC4E2A'
    : d > 50
    ? '#FD8D3C'
    : d > 20
    ? '#FEB24C'
    : d > 10
    ? '#FED976'
    : '#FFEDA0';

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
  '<svg xmlns="http://www.w3.org/2000/svg" fill="{mapIconColor}" viewBox="0 0 36 44" width="20" height="20"><path d="M18.664.253a1 1 0 0 0-1.328 0L.328 15.702a1 1 0 0 0-.328.74V44h36V16.443a1 1 0 0 0-.328-.74zM25 29h-4v4a3 3 0 0 1-6 0v-4h-4a3 3 0 0 1 0-6h4v-4a3 3 0 0 1 6 0v4h4a3 3 0 0 1 0 6z" data-name="Layer 2"/></svg>';

export const ziekenhuisIconV = L.divIcon({
  className: 'leaflet-data-marker',
  html: L.Util.template(ziekenhuisSvg, { mapIconColor: '#000' }),
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
