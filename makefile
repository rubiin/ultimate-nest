
init: clean-files make-initial-migrations
clean-db: unmigrate migrate seed

clean-files:
	@rm -rf temp @rm -rf src/migrations/ @rm -rf logs @rm -rf dist @rm -rf uploads
	
make-initial-migrations:
	@NODE_ENV=$(env) npm run orm migration:create --initial

makemigration:
	@NODE_ENV=$(env) npm run orm migration:create

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



