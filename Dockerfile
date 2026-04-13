FROM node:22-alpine AS build
WORKDIR /app
RUN apk upgrade --no-cache
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2.9.1-alpine
RUN apk upgrade --no-cache
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
USER caddy
EXPOSE 80
