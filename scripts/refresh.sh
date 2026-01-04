#!/bin/bash

cd /www/legacy-indexcards
git pull
/usr/bin/docker compose -f docker-compose.staging.yml up --build --detach

