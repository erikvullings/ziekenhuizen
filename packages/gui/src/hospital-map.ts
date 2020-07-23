import m, { FactoryComponent } from 'mithril';
import L, { LeafletEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-hash';
import ziekenhuizen from './assets/ziekenhuizen.json';
import { RDnew, ziekenhuisIconX, ziekenhuisIconV } from './utils';
import { IZiekenhuis } from './models/ziekenhuis';

export const HospitalMap: FactoryComponent = () => {
  let selectedHospital: GeoJSON.Feature<GeoJSON.Geometry, IZiekenhuis>;
  let selectedHospitalLayer: L.Marker;

  return {
    view: () => {
      const aantalGeboorten = selectedHospital
        ? Math.round(
            selectedHospital.properties.t25 +
              selectedHospital.properties.t30 +
              selectedHospital.properties.tOv
          )
        : 0;
      // const aantalThuisgeboren = aantalGeboorten * 0.129;
      const aantalGeboortecentrum = Math.round(aantalGeboorten * 0.15);
      const aantalTweedelijn = Math.round(aantalGeboorten * 0.71);

      return [
        m('#map', {
          style:
            'height: 100vh; width: 70vw; margin: 0; padding: 0; overflow: hidden; box-shadow: (0px 0px 20px rgba(0,0,0,.3))',
          oncreate: () => {
            const map = L.map('map', {
              crs: RDnew,
            }).setView([51.9741, 5.6688], 9);
            // map.on('load', (e: LeafletEvent) => {
            //   // In order to fix an issue when loading leaflet in a modal or tab: https://stackoverflow.com/a/53511529/319711
            //   setTimeout(() => {
            //     map.invalidateSize();
            //   }, 0);
            // });
            L.control.scale({ imperial: false, metric: true }).addTo(map);
            // Add the PDOK map
            var pdokachtergrondkaart = new L.TileLayer(
              'https://geodata.nationaalgeoregister.nl/tms/1.0.0/brtachtergrondkaart/{z}/{x}/{y}.png',
              {
                minZoom: 3,
                maxZoom: 14,
                tms: true,
                attribution:
                  'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
              }
            );
            pdokachtergrondkaart.addTo(map);
            // Hash in URL
            new (L as any).Hash(map);
            var myStyle = {
              color: '#ff7800',
              weight: 5,
              opacity: 0.65,
            };

            const ziekenhuisLayer = L.geoJSON<IZiekenhuis>(ziekenhuizen, {
              pointToLayer: (feature, latlng) =>
                L.marker(
                  latlng,
                  feature.properties.active === false
                    ? { icon: ziekenhuisIconX }
                    : { icon: ziekenhuisIconV }
                ),
              // {
              //   if (feature.properties.active === false)
              //     return L.marker(latlng, { icon: ziekenhuisIconX });

              //   // return L.circleMarker(latlng, geojsonMarkerOptions);
              // },
              onEachFeature: (feature, layer) => {
                layer.on('click', () => {
                  // console.log(feature);
                  if (!feature.properties.hasOwnProperty('active')) {
                    feature.properties.active = true;
                  }
                  selectedHospitalLayer = layer as L.Marker;
                  selectedHospital = feature;
                  m.redraw();
                });
              },
            }).addTo(map);

            L.control
              .layers(
                { pdok: pdokachtergrondkaart },
                { ziekenhuizen: ziekenhuisLayer }
              )
              .addTo(map);
          },
        }),
        m(
          '.panel',
          {
            style: 'position: absolute; top: 0; left: 70vw; padding: 5px;',
          },
          selectedHospital && [
            m('h1', selectedHospital.properties.locatie),
            m('h2', selectedHospital.properties.organisatie),
            m(
              'p',
              { style: 'font-weight: bold' },
              `Kenmerken: ${[
                selectedHospital.properties.NICU ? 'NICU' : '',
                selectedHospital.properties.fullTimeSEH ? '24/7' : '',
                selectedHospital.properties.gevoeligeZH ? 'gevoelig' : '',
                selectedHospital.properties.criteria ? 'criteria' : '',
              ]
                .filter(Boolean)
                .join(', ')}`
            ),
            m(
              'p',
              { style: 'font-weight: bold' },
              `Aantal geboorten ${aantalGeboorten}, waarvan ${[
                selectedHospital.properties.t25
                  ? `binnen 25 min: ${Math.round(
                      selectedHospital.properties.t25
                    )}`
                  : '',
                selectedHospital.properties.t30
                  ? `binnen 30 min: ${Math.round(
                      selectedHospital.properties.t30
                    )}`
                  : '',
                selectedHospital.properties.tOv
                  ? `overig: ${Math.round(selectedHospital.properties.tOv)}`
                  : '',
              ]
                .filter(Boolean)
                .join(', ')}`
            ),
            m(
              'p',
              { style: 'font-weight: bold' },
              `Geboortecentrum: ${aantalGeboortecentrum}`
            ),
            m(
              'p',
              { style: 'font-weight: bold' },
              `Ziekenhuis 2de-lijn: ${aantalTweedelijn}`
            ),
            m(
              'label',
              m('input[type=checkbox]', {
                checked: selectedHospital.properties.active,
                onchange: () => {
                  selectedHospital.properties.active = !selectedHospital
                    .properties.active;
                  selectedHospitalLayer.setIcon(
                    selectedHospital.properties.active
                      ? ziekenhuisIconV
                      : ziekenhuisIconX
                  );
                  selectedHospitalLayer.setOpacity(
                    selectedHospital.properties.active ? 1 : 0.3
                  );
                },
              }),
              'Actief'
            ),
          ]
        ),
      ];
    },
  };
};
