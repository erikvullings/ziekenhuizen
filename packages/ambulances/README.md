# Processing the Ambulance Posts

From the location of ambulance posts, create two GeoJSON files, one that contains their locations, the other contains
the area they can reach within 15 minutes. To determine this, we are creating a small script that will use
[OSRM](https://project-osrm.org) for routing information. See [Agent-Smith](https://github.com/erikvullings/agent-smith)
for an example how to run it locally.

## Code

The source code is a copy of [node-isochrone](https://github.com/stepankuzmin/node-isochrone), but instead of using the
OSRM node-bindings, which are difficult to compile on Windows, it uses an OSRM web service. Preferably, you should use a
local OSRM web service, e.g. using docker, but alternatively, if you don't specify its IP address, it will default to
the hosted OSRM web service.
