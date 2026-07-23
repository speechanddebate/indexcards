FROM node:24.13.1-trixie AS base
WORKDIR /indexcards

COPY package.json ./
COPY package-lock.json ./

FROM base AS dev
ENV NODE_ENV=development
RUN npm ci --include=dev

COPY . .
ENV TZ="UTC"
ENV PORT=3000
CMD ["npm" , "run" , "dev"]

FROM node:24.13.1-trixie-slim AS prod
WORKDIR /indexcards

ENV NODE_ENV=production

WORKDIR /indexcards

COPY package*.json ./

# do not install dev and ignore scripts to prevent husky errors
# run cache clean to avoid adding npm cache to prod image
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# copy build contents directly to /indexcards (so import paths work correctly)
COPY --from=build /indexcards/build .

ENV TZ="UTC"

ENV PORT=3000
ENV NODE_OPTIONS="--max_old_space_size=512 --experimental-vm-modules --experimental-specifier-resolution=node"
CMD ["node","--use_strict","app.js"]
