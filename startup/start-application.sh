#!/bin/bash

# In order to be able to zoom in further into the map then by default, the .js script has to be adjusted.
# This file is pretty solid and shouldn't be adjusted anymore after this. In case it should, please refer to the ./startup/ folder, as the Dockerfile initially 
#  moves that file to the correct location inside the image (/var/appdata/files)
# - For more information about the code and zoomlevels, please ask Jeroen Grift (Kadaster employee, 5 nov 2019)

# GENERIEK_MAP_FILE=/var/appdata/files/generieke-geo-componenten-map.js
# cp -f ${GENERIEK_MAP_FILE} /frontend/node_modules/generieke-geo-componenten-map/fesm5/generieke-geo-componenten-map.js

# # replace var for INGRESS_HOST
# envsubst < /var/appdata/files/layers.json > /frontend/src/assets/layers.json

# start viewer site
exec ng serve --disable-host-check --host 0.0.0.0