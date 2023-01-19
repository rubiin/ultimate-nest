#!/bin/sh

# Add a step to execute this file on pipeline for simple CD

service=nestify

docker rmi -f $(docker images -f "dangling=true" -q)
docker volume rm $(docker volume ls -qf dangling=true)

git pull --no-edit
docker-compose -f ./docker-compose.dev.yml up $service -d
