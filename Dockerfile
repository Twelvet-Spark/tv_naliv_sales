FROM node:22.22.2-alpine3.23 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_TV_API_URL
ARG VITE_TV_BUSINESS_TOKEN
ARG VITE_TV_LOG_LEVEL
ARG VITE_TV_RICH_UI
ARG VITE_TV_DEBUG_CLOCK
ARG VITE_TV_ALLOW_TOKEN_EDIT
RUN set -eux; \
	if [ -n "${VITE_TV_API_URL:-}" ]; then export VITE_TV_API_URL="$VITE_TV_API_URL"; fi; \
	if [ -n "${VITE_TV_BUSINESS_TOKEN:-}" ]; then export VITE_TV_BUSINESS_TOKEN="$VITE_TV_BUSINESS_TOKEN"; fi; \
	if [ -n "${VITE_TV_LOG_LEVEL:-}" ]; then export VITE_TV_LOG_LEVEL="$VITE_TV_LOG_LEVEL"; fi; \
	if [ -n "${VITE_TV_RICH_UI:-}" ]; then export VITE_TV_RICH_UI="$VITE_TV_RICH_UI"; fi; \
	if [ -n "${VITE_TV_DEBUG_CLOCK:-}" ]; then export VITE_TV_DEBUG_CLOCK="$VITE_TV_DEBUG_CLOCK"; fi; \
	if [ -n "${VITE_TV_ALLOW_TOKEN_EDIT:-}" ]; then export VITE_TV_ALLOW_TOKEN_EDIT="$VITE_TV_ALLOW_TOKEN_EDIT"; fi; \
	npm run build

FROM caddy:2.11.2-alpine
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
USER caddy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1
EXPOSE 80
