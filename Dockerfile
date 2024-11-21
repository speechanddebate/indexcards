FROM node:20.16.0 AS base
WORKDIR /indexcards
COPY ./ ./

RUN npm i

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV TZ="UTC"

ENV PORT=3000
ENV NODE_OPTIONS="--max_old_space_size=512 --experimental-vm-modules --experimental-specifier-resolution=node"
CMD NODE_OPTIONS=${NODE_OPTIONS} node --use_strict app.js
