FROM node:18.17.1 AS base
WORKDIR /indexcards
COPY ./ ./

RUN apt-get update && apt-get install -y cron

RUN npm i
RUN npm rebuild

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENV PORT=3456
ENV NODE_OPTIONS="--max_old_space_size=200 --experimental-vm-modules --experimental-specifier-resolution=node"
CMD NODE_OPTIONS=${NODE_OPTIONS} node --use_strict app.js

RUN chmod -R 0755 /indexcards/api/auto

RUN cp /indexcards/api/auto/crontab /etc/cron.d/indexcards.crontab
RUN crontab /etc/cron.d/indexcards.crontab
# RUN crontab /etc/cron.d/test.crontab

CMD cron -f
