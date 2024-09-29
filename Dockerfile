FROM node:20-alpine AS base

FROM base AS build
WORKDIR /app
COPY ./frontend /app/frontend
COPY ./constants /app/constants
ENV VITE_environment 'production'
ENV VITE_PAYEMENT_GATEWAY_URL 'https://psa.atomtech.in/staticdata/ots/js/atomcheckout.js'
WORKDIR /app/frontend
RUN npm i
RUN npm run build

FROM base AS prod
WORKDIR /app
COPY ./constants /app/constants
COPY ./backend /app/backend
WORKDIR /app/backend
RUN npm i
COPY --from=build /app/frontend/dist /app/frontend/dist

EXPOSE 8000
CMD ["npm","run", "start"]
