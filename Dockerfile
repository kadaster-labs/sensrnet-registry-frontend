
# First Stage : to install and build dependences
FROM node:12.18.4 as builder

ARG http_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG https_proxy="http://ssl-proxy.cs.kadaster.nl:8080"
ARG HTTP_PROXY=$http_proxy
ARG HTTPS_PROXY=$http_proxy
ARG no_proxy="localhost,127.0.0.1,kadaster.nl"
ARG NO_PROXY=$no_proxy

WORKDIR /app

COPY ./package*.json ./
COPY .npmrc ./
RUN npm ci

COPY src src
COPY tsconfig*.json ./
COPY angular.json ./

RUN npm run build


# Second Stage : Setup command to serve the app using NGinx
FROM nginxinc/nginx-unprivileged:1.18.0-alpine

COPY VERSION .
COPY ./entrypoint.sh ./entrypoint.sh
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx --from=builder /app/dist/app /usr/share/nginx/html

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh", "run"]
CMD ["run"]
