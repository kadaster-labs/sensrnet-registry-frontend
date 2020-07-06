# Author: Maarten Hoekstra (KKN), edited by Jeroen Grift for SensRNet
FROM node:12

ARG http_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG https_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG HTTP_PROXY=$http_proxy
ARG HTTPS_PROXY=$http_proxy
ARG no_proxy="localhost,127.0.0.1,kadaster.nl"
ARG NO_PROXY=$no_proxy

WORKDIR /viewer

ADD VERSION .

COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

COPY package*.json ./

RUN npm config set registry https://dev-brm.cs.kadaster.nl/artifactory/api/npm/npm-registry/
RUN npm install

COPY . .

EXPOSE 4200

ENTRYPOINT ["/viewer/entrypoint.sh"]

CMD ["run"]
