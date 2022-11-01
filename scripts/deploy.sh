#!/bin/sh

# Add a step to execute this file on pipeline for simple CD

service=nestify

docker rmi -f $(docker images -f "dangling=true" -q)
docker volume rm $(docker volume ls -qf dangling=true)

git pull --no-edit
pnpm i  --shamefully-hoist=true
npm run build
docker-compose -f ./docker-compose.dev.yml up --no-start $service &&
docker-compose -f ./docker-compose.dev.yml restart $service
