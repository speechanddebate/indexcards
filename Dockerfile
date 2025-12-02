FROM node:22.21.0  AS base
WORKDIR /indexcards

COPY package*.json .


FROM base AS dev
ARG NODE_ENV=development
RUN npm ci --include=dev
COPY . .
ENV TZ="UTC"
ENV PORT=3000
CMD ["npm" , "run" , "dev"]


FROM node:22.21.0-slim AS prod
WORKDIR /indexcards

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY . .

ENV TZ="UTC"

ENV PORT=3000
ENV NODE_OPTIONS="--max_old_space_size=512 --experimental-vm-modules --experimental-specifier-resolution=node"
CMD NODE_OPTIONS=${NODE_OPTIONS} node --use_strict app.js
