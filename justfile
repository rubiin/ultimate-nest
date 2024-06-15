
# prints all available commands
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

# one stop command to make migration and migrate it
quick-migrate: makemigration migrate

# run seeders to populate database
seed env="dev":
	USER_PASSWORD=Test@1234 NODE_ENV={{env}} npm run orm seeder:run

# test e2e with jest
test-e2e env="dev":
	USER_PASSWORD=Test@1234 NODE_ENV={{env}} npm run test:e2e

# will drop the database, run all migrations
seed-fresh env="dev":
NODE_ENV={{env}} npm run orm migration:fresh --seed


# clean all auto generated files and generate initial migration file
init: clean-files build makemigration

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

# run in repl mode
repl env="dev":
	REPL=true npm run start:repl

# run deploy script
deploy:
	sh scripts/deploy.sh
