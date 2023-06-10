#!/bin/sh

# Add a step to execute this file on pipeline for simple CD

service=nestify

docker rmi -f $(docker images -f "dangling=true" -q)
docker volume rm $(docker volume ls -qf dangling=true)

git pull --no-edit

if command -v docker-compose >/dev/null 2>&1; then
    docker-compose -f ./docker-compose.yml up $service -d
else
    docker-compose -f ./docker-compose.yml up $service -d
fi

