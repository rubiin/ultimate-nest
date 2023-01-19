
init: clean-files makemigration-init
clean-db: unmigrate migrate seed

.PHONY: clean-files
clean-files:
	@rm -rf temp @rm -rf src/migrations/ @rm -rf logs @rm -rf dist @rm -rf uploads

.PHONY: makemigration-init
makemigration-init:
	NODE_ENV=$(env) npm run orm migration:create --initial

.PHONY: makemigration
makemigration:
	NODE_ENV=$(env) npm run orm migration:create

.PHONY: migrate
migrate:
	NODE_ENV=$(env) npm run orm migration:up

.PHONY: unmigrate
unmigrate:
	NODE_ENV=$(env) npm run orm migration:down

.PHONY: seed
seed:
	USER_PASSWORD=Test@1234 NODE_ENV=$(env) npm run orm seeder:run

.PHONY: test-e2e
test-e2e:
	USER_PASSWORD=Test@1234 NODE_ENV=$(env) yarn test:e2e

.PHONY: build
build:
	nest build

.PHONY: encryption
encryption:
	@sh scripts/encryption.sh

.PHONY: shell
shell:
	REPL=true npm run start:dev

.PHONY: deploy
deploy:
	@sh scripts/deploy.sh

.PHONY: stop
stop:
	ENV=dev PASSWORD=Test@1234  docker compose -f docker-compose.$(env).yml stop

.PHONY: remove
remove:
	ENV=dev PASSWORD=Test@1234 docker compose -f docker-compose.$(env).yml down


