import m from 'mithril';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-hash';
import { ziekenhuisIconX, ziekenhuisIconV, showDiff } from './utils';
import { IZiekenhuis } from './models/ziekenhuis';
import { MeiosisComponent } from './services/meiosis';
import { InfoPanel } from './info-panel';

export const HospitalMap: MeiosisComponent = () => {
  let map: L.Map;
  let a25: L.GeoJSON;
  let postcodeLayer: L.GeoJSON;
  let ziekenhuisLayer: L.GeoJSON;
  // let selectedHospitalLayer: L.Marker;

  return {
    view: ({ attrs: { state, actions } }) => {
      console.log(state);
      const { hospitals, selectedHospitalId, aanrijd25 } = state.app;
      const selectedHospital = hospitals?.features
        .filter((f) => f.properties.id === selectedHospitalId)
        .shift();
      const h = selectedHospital?.properties;
      const aantalGeboorten = h ? Math.round(h.t25 + h.t30 + h.tOv) : 0;
      const aantalGeboortecentrum = Math.round(aantalGeboorten * 0.15);
      const aantalTweedelijn = Math.round(aantalGeboorten * 0.71);
      const aantalGeboorten2 = h
        ? Math.round(h.curline.reduce((acc, cur) => acc + cur))
        : 0;
      const aantalGeboortecentrum2 = Math.round(aantalGeboorten2 * 0.15);
      const aantalTweedelijn2 = Math.round(aantalGeboorten2 * 0.71);

      if (map && a25) {
        const t = aanrijd25?.features.filter(
          (f) =>
            hospitals &&
            f.properties &&
            hospitals.features[f.properties.id].properties.active
        );
        if (t && t.length !== a25.getLayers().length) {
          a25.clearLayers();
          t.forEach((f) => a25.addData(f));
        }
      }

      if (h) {
        console.log(
          `id: ${h.id}: ` +
            h.coverage
              .map((c) => c.pc)
              .sort()
              .join(', ')
        );
        postcodeLayer.clearLayers();
        h.coverage
          .map(
            ({ pc, coord, births, cat }) =>
              ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: coord,
                },
                properties: {
                  pc,
                  births,
                  cat,
                },
              } as GeoJSON.Feature)
          )
          .forEach((p) => postcodeLayer.addData(p));
      }

      return [
        m('#map', {
          style:
            'height: 100vh; width: 70vw; margin: 0; padding: 0; overflow: hidden; box-shadow: (0px 0px 20px rgba(0,0,0,.3))',
          oncreate: () => {
            map = L.map('map', {}).setView([51.9741, 5.6688], 9);
            // map.on('load', (e: LeafletEvent) => {
            //   // In order to fix an issue when loading leaflet in a modal or tab: https://stackoverflow.com/a/53511529/319711
            //   setTimeout(() => {
            //     map.invalidateSize();
            //   }, 0);
            // });
            L.control.scale({ imperial: false, metric: true }).addTo(map);
            // Add the PDOK map
            const pdokachtergrondkaartGrijs = new L.TileLayer(
              'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaartgrijs/EPSG:3857/{z}/{x}/{y}.png',
              {
                minZoom: 3,
                maxZoom: 14,
                attribution:
                  'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
              }
            );
            pdokachtergrondkaartGrijs.addTo(map);
            const pdokachtergrondkaart = new L.TileLayer(
              'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaart/EPSG:3857/{z}/{x}/{y}.png',
              {
                minZoom: 3,
                maxZoom: 14,
                // tms: true,
                attribution:
                  'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
              }
            );
            // Hash in URL
            new (L as any).Hash(map);

            ziekenhuisLayer = L.geoJSON<IZiekenhuis>(hospitals, {
              pointToLayer: (feature, latlng) => {
                return new L.Marker(
                  latlng,
                  feature.properties.active === false
                    ? {
                        icon: ziekenhuisIconX,
                        title: feature.properties.organisatie,
                      }
                    : {
                        icon: ziekenhuisIconV,
                        title: feature.properties.organisatie,
                      }
                );
              },
              onEachFeature: (feature, layer) => {
                layer.on('click', () => {
                  if (!feature.properties.hasOwnProperty('active')) {
                    feature.properties.active = true;
                  }
                  // selectedHospitalLayer = layer as L.Marker;
                  actions.selectHospital(feature.properties.id);
                });
              },
            }).addTo(map);

            a25 = L.geoJSON(aanrijd25, {
              style: {
                stroke: false,
                color: 'green',
                fillOpacity: 0.3,
              },
            });

            postcodeLayer = L.geoJSON(undefined, {
              pointToLayer: (f, latlng) =>
                L.circleMarker(latlng, {
                  // color: 'black',
                  stroke: false,
                  fillColor:
                    f.properties.cat === 0
                      ? 'green'
                      : f.properties.cat === 1
                      ? 'orange'
                      : 'red',
                  fillOpacity: 1,
                  radius: Math.min(10, f.properties.births / 10),
                }),
              onEachFeature: (feature, layer) => {
                layer.bindPopup(
                  `In PC ${
                    feature.properties.pc
                  }, expected births is ${Math.round(
                    feature.properties.births
                  )}.`
                );
              },
            }).addTo(map);

            L.control
              .layers(
                {
                  grijs: pdokachtergrondkaartGrijs,
                  normaal: pdokachtergrondkaart,
                },
                {
                  ziekenhuizen: ziekenhuisLayer,
                  'aanrijdtijd < 25 min': a25,
                  postcodes: postcodeLayer,
                }
              )
              .addTo(map);

            actions.inactivateHospitalsFromHash(ziekenhuisLayer);
          },
        }),
        m(
          '.panel',
          {
            style: 'position: absolute; top: 0; left: 70vw; padding: 5px;',
          },
          [
            m(InfoPanel, { state, actions }),
            selectedHospital &&
              h && [
                m('h2', `${h.locatie} (${h.organisatie})`),
                m(
                  'p',
                  { style: 'font-weight: bold' },
                  `Kenmerken: ${[
                    h.NICU ? 'NICU' : '',
                    h.fullTimeSEH ? '24/7' : '',
                    h.gevoeligeZH ? 'gevoelig' : '',
                    h.criteria ? 'criteria' : '',
                  ]
                    .filter(Boolean)
                    .join(', ')}`
                ),
                m(
                  'p',
                  { style: 'font-weight: bold' },
                  m.trust(
                    `Aantal geboorten ${showDiff(
                      aantalGeboorten2,
                      aantalGeboorten
                    )}:<br>${[
                      h.curline[0]
                        ? `- binnen 25 min: ${showDiff(h.curline[0], h.t25)}`
                        : '',
                      h.curline[1]
                        ? `- binnen 30 min: ${showDiff(h.curline[1], h.t30)}`
                        : '',
                      h.curline[2]
                        ? `- overig: ${showDiff(h.curline[2], h.tOv)}`
                        : '',
                    ]
                      .filter(Boolean)
                      .join('<br>')}`
                  )
                ),
                m(
                  'p',
                  { style: 'font-weight: bold' },
                  `Geboortecentrum: ${showDiff(
                    aantalGeboortecentrum2,
                    aantalGeboortecentrum
                  )}`
                ),
                m(
                  'p',
                  { style: 'font-weight: bold' },
                  `Ziekenhuis 2de-lijn: ${showDiff(
                    aantalTweedelijn2,
                    aantalTweedelijn
                  )}`
                ),
                m(
                  'label',
                  m('input[type=checkbox]', {
                    checked: h.active,
                    onchange: () =>
                      actions.toggleHospitalActivity(h.id, ziekenhuisLayer),
                  }),
                  'Actief'
                ),
              ],
          ]
        ),
      ];
    },
  };
};
