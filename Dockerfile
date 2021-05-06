
# First Stage : to install and build dependences
FROM node:12.18.4 as builder

WORKDIR /app

COPY ./package*.json ./
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
