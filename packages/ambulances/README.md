# Processing the Ambulance Posts

From the location of ambulance posts, create two GeoJSON files, one that contains their locations, the other contains the area they can reach within 15 minutes. To determine this, we are creating a small script that will use [OSRM](https://project-osrm.org) for routing information. See [Agent-Smith](https://github.com/erikvullings/agent-smith) for an example how to run it locally (folder: `docker/osrm-services`).

## Prerequisites

First, install the [howfar](https://www.npmjs.com/package/howfar) package and, preferably, run the local OSRM version, e.g. using the Docker-compose script in the above mentioned project.

```bash
npm i -g howfar
howfar -p 3000 -n http://localhost:5000
```

Now you have a running REST service which you can query on port 3000, and it expects to find the OSRM router on port 5000, to determine the maximum drive time. In case you don't need to run many queries, you can omit the last part, defaulting to the public service. Beware, though, that it is not always up-and-running.

## Usage

In the `src` folder, there are two scripts, which can be run using the launch configuration of `vscode`. You first run `Ambulances: Find locations` to convert the Excel (CSV) file with the locations of ambulance posts to addresses using PDOK. 

Next, run `Ambulances: Generate GeoJSON` to calculate the maximum distance an ambulance can drive from the ambulance post in 15 minutes (actually, it is based on driving time, but since it ignores the reaction time of an ambulance crew, it should be a good approximation). Note that this requires you that the `howfar` and `OSRM services` are running.

The generated file, `data/ambulancesbereik.geojson`, must be copied manually to `packages/gui/src/assets/ambulancesbereik.json` (notice the extension). Optionally, you can run it first through `minify-geojson -c 6 ambulancesbereik.geojson` in order to reduce the number of decimals to 6 in the coordinates, thereby reducing the file size substantially. Install it locally using `npm i -g minify-geojson`.

## Manual intervention

For whatever reason, the ambulance post in Zevenbergen (Moerdijk) cannot be retrieved from PDOK, so it is added manually.

```json
{
  "Standplaats": "Zevenbergen",
  "Straatnaam": "Zuidelijke Randweg",
  "Huisnummer": "1",
  "Postcode": "4761RN",
  "Plaats": "Zevenbergen",
  "Beschikbaarheid": "24 uur",
  "lat": 51.656809,
  "lon": 4.557367
}
```
