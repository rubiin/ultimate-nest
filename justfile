
# prints all availabe commands
default:
	just --list

# clean all auto generated files and generate initial migration file
init: clean-files
	makemigration-init

# clean all auto generated files and run migration
clean-db: unmigrate
	migrate
	seed

# clean all auto generated files
clean-files:
	rm -rf temp
	rm -rf ./migrations
	rm -rf logs
	rm -rf dist
	rm -rf uploads

# make initial migration file for the first time
makemigration-init:
	NODE_ENV=$(env) npm run orm migration:create --initial

# make migration file for the current changes
makemigration:
	NODE_ENV=$(env) npm run orm migration:create

# run migration
migrate:
	NODE_ENV=$(env) npm run orm migration:up

# revert migration
unmigrate:
	NODE_ENV=$(env) npm run orm migration:down

# run seeders to populate database
seed:
	USER_PASSWORD=Test1234 NODE_ENV=$(env) npm run orm seeder:run

# test e2e with jest
test-e2e:
	USER_PASSWORD=Test1234 NODE_ENV=$(env) yarn test:e2e

# build code
build:
	nest build

# generate encryption key and iv
encryption:
	sh scripts/encryption.sh

# run in shell mode
shell:
	REPL=true npm run start:dev

# run deploy script
deploy:
	sh scripts/deploy.sh

# stop deployed containers
stop:
	ENV=dev PASSWORD=Test1234  docker compose -f docker-compose.$(env).yml stop

# remove deployed containers
remove:
	ENV=dev PASSWORD=Test1234 docker compose -f docker-compose.$(env).yml down
