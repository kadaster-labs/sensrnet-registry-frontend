
# First Stage : to install and build dependences
FROM node:12 as builder

ARG http_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG https_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG HTTP_PROXY=$http_proxy
ARG HTTPS_PROXY=$http_proxy
ARG no_proxy="localhost,127.0.0.1,kadaster.nl"
ARG NO_PROXY=$no_proxy

WORKDIR /app

COPY ./package*.json ./
COPY .npmrc ./
RUN npm install --only=production

COPY src src
COPY tsconfig*.json ./
COPY angular.json ./


# Second Stage : Setup command to run your app using lightweight node image
FROM node:12-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node VERSION .
COPY --chown=node:node scripts/entrypoint.sh entrypoint.sh
COPY --chown=node:node --from=builder /app/. ./

USER node

RUN npm i @angular/cli

EXPOSE 4200

ENTRYPOINT ["/home/node/app/entrypoint.sh"]
CMD ["run"]
