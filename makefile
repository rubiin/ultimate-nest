
init: clean-files makemigration-init
clean-db: unmigrate migrate seed

clean-files:
	@rm -rf temp @rm -rf src/migrations/ @rm -rf logs @rm -rf dist @rm -rf uploads

makemigration-init:
	NODE_ENV=$(env) npm run orm migration:create --initial

makemigration:
	NODE_ENV=$(env) npm run orm migration:create

migrate:
	NODE_ENV=$(env) npm run orm migration:up

unmigrate:
	NODE_ENV=$(env) npm run orm migration:down

seed:
	USER_PASSWORD=Test@1234 NODE_ENV=$(env) npm run orm seeder:run
test-e2e:
	USER_PASSWORD=Test@1234 NODE_ENV=$(env) yarn test:e2e

build:
	nest build

encryption:
	@sh scripts/encryption.sh

ssl:
	@mkcert $(site)

shell:
	REPL=true npm run start:dev

deploy:
	@sh scripts/deploy.sh

stop:
	ENV=dev PASSWORD=Test@1234  docker compose -f docker-compose.$(env).yml stop

remove:
	ENV=dev PASSWORD=Test@1234 docker compose -f docker-compose.$(env).yml down



