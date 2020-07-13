FROM node:12

ARG http_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG https_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG HTTP_PROXY=$http_proxy
ARG HTTPS_PROXY=$http_proxy
ARG no_proxy="localhost,127.0.0.1,kadaster.nl"
ARG NO_PROXY=$no_proxy

WORKDIR /viewer

ADD VERSION .

COPY package*.json ./
COPY .npmrc ./
RUN npm install

COPY src/ src/
COPY angular.json ./
COPY tsconfig*.json ./
COPY scripts/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 4200

ENTRYPOINT ["/viewer/entrypoint.sh"]

CMD ["run"]
