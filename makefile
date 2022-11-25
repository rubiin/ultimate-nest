
init: clean-files makemigration-init
clean-db: unmigrate migrate seed

clean-files:
	@rm -rf temp @rm -rf src/migrations/ @rm -rf logs @rm -rf dist @rm -rf uploads

makemigration-init:
	@NODE_ENV=$(env) npm run orm migration:create --initial

makemigration:
	@NODE_ENV=$(env) npm run orm migration:create

fresh:
	@NODE_ENV=$(env) npm run orm migration:fresh --seed

migrate:
	@NODE_ENV=$(env) npm run orm migration:up

unmigrate:
	@NODE_ENV=$(env) npm run orm migration:down

seed:
	@NODE_ENV=$(env) npm run orm seeder:run

build:
	nest build

encryption:
	@sh scripts/encryption.sh

ssl:
	@mkcert $(site)

shell:
	REPL=true npm run start:dev

deploy:
  pnpm install --shamefull-hoist=true
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 PASSWORD=test@1234 ENV=dev docker-compose up --build

stop:
	ENV=dev PASSWORD=test@1234  docker-compose -f docker-compose.$(env).yml stop

remove:
	ENV=dev PASSWORD=test@1234 docker-compose -f docker-compose.$(env).yml down

test-e2e:
	USER_PASSWORD=Test@1234 NODE_ENV=$(env) yarn test:e2e
