#!/usr/bin/env bash
#
# Drive the local stack in docker-compose.dev.yml, the same stack docs/getting-started.md sets up
# by hand.
#
#   ./scripts/deploy.sh            # start the app and the services it needs
#   ./scripts/deploy.sh build      # rebuild the image first, then start it
#   ./scripts/deploy.sh services   # start only the backing services, to run the app on the host
#   ./scripts/deploy.sh logs       # follow the app logs: build, migrate and seed output
#   ./scripts/deploy.sh logs database # follow one service, e.g. when a dependency is unhealthy
#   ./scripts/deploy.sh down       # stop the stack, keeping the volumes
#
# The source is baked into the image rather than mounted, so a code change needs `build`.
# DEPLOY_ENV picks the env file (env/.env.${DEPLOY_ENV}, default dev), and SEED_ON_START and
# USER_PASSWORD reach the compose file unchanged, so the seeding options in the guide apply:
#
#   SEED_ON_START=never ./scripts/deploy.sh build
#
# Migrations and seeders run inside the container via docker/entrypoint.sh, so there is nothing
# left to run on the host once the stack is up. This script never touches Docker state outside
# this compose project; prune images yourself with `docker image prune` if a rebuild leaves a lot.

set -euo pipefail

COMPOSE_FILE="docker-compose.dev.yml"
BACKING_SERVICES=(database redis rabbitmq mailpit)

usage() {
  cat <<EOF
usage: $0 [up|build|services|logs [service]|down]

  up          start the app and the services it needs (default)
  build       rebuild the image first, then start it
  services    start only the backing services, to run the app on the host
  logs        follow the app logs, or one service: logs database
  down        stop the stack, keeping the volumes
EOF
}

help() {
  usage
  echo
  echo "DEPLOY_ENV picks the env file (env/.env.\${DEPLOY_ENV}, default dev)."
}

: "${DEPLOY_ENV:=${ENV:-dev}}"
export DEPLOY_ENV

case "${1:-up}" in
  -h | --help)
    help
    exit 0
    ;;
esac

command="${1:-up}"
case "$command" in
  up | build | services | logs | down) ;;
  *)
    usage >&2
    exit 1
    ;;
esac

# Only `logs` takes a second argument, naming the service to follow.
if [ "$#" -gt 2 ] || { [ "$#" -eq 2 ] && [ "$command" != logs ]; }; then
  usage >&2
  exit 1
fi
service="${2:-app}"

command -v docker >/dev/null || { echo "docker is not installed" >&2; exit 1; }
docker compose version >/dev/null 2>&1 ||
  { echo "the docker compose plugin is not installed" >&2; exit 1; }

# Only the app reads the env file, and compose resolves a service-level env_file lazily, so
# `services`, `logs` and `down` still work without one — which is when you want them most.
if [ ! -f "env/.env.${DEPLOY_ENV}" ]; then
  case "$command" in
    up | build)
      echo "env/.env.${DEPLOY_ENV} is missing; run: cp env/.env.sample env/.env.${DEPLOY_ENV}" >&2
      exit 1
      ;;
    *)
      echo "warning: env/.env.${DEPLOY_ENV} is missing, so '${command}' runs without it" >&2
      ;;
  esac
fi

# The compose file pins NODE_ENV to dev for the app, so a different env file only swaps secrets.
if [ "$DEPLOY_ENV" != "dev" ]; then
  echo "warning: DEPLOY_ENV=${DEPLOY_ENV} swaps the env file, but the app still runs with NODE_ENV=dev" >&2
fi

compose=(docker compose -f "$COMPOSE_FILE")

case "$command" in
  up) "${compose[@]}" up -d ;;
  build) "${compose[@]}" up -d --build ;;
  services) "${compose[@]}" up -d --wait "${BACKING_SERVICES[@]}" ;;
  logs) "${compose[@]}" logs -f "$service" ;;
  down) "${compose[@]}" down ;;
esac