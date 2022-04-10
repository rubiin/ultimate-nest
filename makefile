
init: clean make-initial-migrations

clean:
	@rm -rf temp @rm -rf src/migrations/ @rm -rf logs @rm -rf dist
	
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



