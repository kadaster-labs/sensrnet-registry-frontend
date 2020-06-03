# Author: Maarten Hoekstra (KKN), edited by Jeroen Grift for SensRNet
FROM ubuntu:18.04

ARG http_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG https_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG HTTP_PROXY=$http_proxy
ARG HTTPS_PROXY=$http_proxy
ARG no_proxy="localhost,127.0.0.1,kadaster.nl"
ARG NO_PROXY=$no_proxy

RUN apt-get update \
    && apt-get install -y curl vim less gettext-base \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get install -y curl gettext-base \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs \
    && mkdir /viewer \
    && mkdir -p /var/appdata/run \
    && mkdir -p /var/appdata/files

WORKDIR /viewer

# Copy of package.json and installation of NPM happens before the rest of the commands since it is a quite static and time consuming process. 
COPY ./package.json /viewer/ 

# N.B. this is a workaround to a scenario that has some risks! This project depends on generieke-geo-componenten,
# generieke-geo-componenten depend on the deprecated openlayers library and the openlayers library depends on 
# closure utils.
# The situation is that the Kadaster internal network uses certinjection to monitor their employees. However the 
# installation of closure-utils is not capable of handeling this properly. So to circumvent we need to disable 
# TLS validation, which is pretty bad, and opens us up for a man in the middle attack. 
RUN export NODE_TLS_REJECT_UNAUTHORIZED=0 \
    && npm install -g @angular/cli \
    && npm install closure-util \
    && npm install rxjs


RUN npm config set registry https://dev-brm.cs.kadaster.nl/artifactory/api/npm/npm-registry/
RUN npm install

COPY ./e2e/ /viewer/e2e
COPY ./src/ /viewer/src
COPY ./angular.json /viewer/
COPY ./tsconfig.json /viewer/ 
COPY ./tsconfig.app.json /viewer/ 
COPY ./tslint.json /viewer/
COPY ./startup/*sh /var/appdata/run/
COPY ./src/assets/layers.json /var/appdata/files/

RUN chmod a+x /var/appdata/run/start-application.sh

# Clean apt-get log
RUN apt-get clean && \
    rm -rf \
    /tmp/* \
    /var/lib/apt/lists/* \
    /var/tmp

EXPOSE 4200

CMD [ "/var/appdata/run/start-application.sh" ]