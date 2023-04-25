
# prints all availabe commands
default:
	just --list

# make migration file for the current changes
makemigration env="dev":
	NODE_ENV={{env}} npm run orm migration:create

# run migration
migrate env="dev":
	NODE_ENV={{env}} npm run orm migration:up

# revert migration
unmigrate env="dev":
	NODE_ENV={{env}} npm run orm migration:down

# run seeders to populate database
seed env="dev":
	USER_PASSWORD=Test@1234 NODE_ENV={{env}} npm run orm seeder:run

# test e2e with jest
test-e2e env="dev":
	USER_PASSWORD=Test@1234 NODE_ENV={{env}} yarn test:e2e


# clean all auto generated files and generate initial migration file
init: clean-files makemigration

# clean all auto generated files and run migration
clean-db: unmigrate migrate seed

# clean all auto generated files
clean-files:
	rm -rf temp
	rm -rf ./migrations
	rm -rf *.log
	rm -rf *.db
	rm -rf logs
	rm -rf dist
	rm -rf uploads


# build code
build:
	nest build

# generate encryption key and iv
encryption:
	sh scripts/encryption.sh

# run in shell mode
shell env="dev":
	REPL=true npm run start:dev

# run deploy script
deploy:
	sh scripts/deploy.sh

# stop deployed containers
stop env="dev":
	ENV=dev docker compose -f docker-compose.{{env}}.yml stop

# remove deployed containers
remove env="dev":
	ENV=dev docker compose -f docker-compose.{{env}}.yml down
