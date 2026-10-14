#!/bin/sh
#
# Container entrypoint: wait for Postgres, build, migrate, seed on first boot, then serve.
#
# Compose's `depends_on: service_healthy` already gates on the database healthcheck, but that only
# proves Postgres accepts connections. The first migration against an empty volume can still race
# the postmaster finishing its own startup, so retry here too.
#
# The seeders are NOT idempotent: AdminSeeder and FixtureSeeder write fixed emails, so a second
# run violates `user_email_unique`, and UserSeeder deliberately adds 50 fresh users every time.
# Seeding therefore happens once, on the boot that first migrates the database. Set
# SEED_ON_START=always to force it anyway, or never to skip it.

set -e

NODE_ENV="${NODE_ENV:-dev}"
export NODE_ENV

log() {
  echo "[entrypoint] $*"
}

# --- 1. wait for Postgres -------------------------------------------------------------

pg_query() {
  # Reads SQL on stdin and prints the single value it selects. Empty output means "no rows".
  node -e '
    const { Client } = require("pg");
    const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;
    const client = new Client({
      database: DB_DATABASE,
      host: DB_HOST,
      password: DB_PASSWORD,
      port: Number(DB_PORT),
      user: DB_USERNAME,
    });
    let sql = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (sql += chunk));
    process.stdin.on("end", () =>
      client
        .connect()
        .then(() => client.query(sql))
        .then((result) => {
          const value = result.rows[0] ? Object.values(result.rows[0])[0] : null;
          if (value !== null && value !== false) process.stdout.write(String(value));
        })
        .then(() => client.end())
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error.message);
          process.exit(1);
        }),
    );
  '
}

attempt=1
max_attempts=30
until printf 'SELECT 1;' | pg_query >/dev/null 2>&1; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    log "Postgres did not become reachable after ${max_attempts} attempts"
    exit 1
  fi
  log "waiting for Postgres (attempt ${attempt}/${max_attempts})..."
  attempt=$((attempt + 1))
  sleep 2
done

log "Postgres is reachable"

# A database nobody has migrated yet has no `migrations` table, or an empty one.
is_fresh_database() {
  migrated=$(printf \
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'migrations') AND EXISTS (SELECT 1 FROM migrations);" \
    | pg_query)

  [ -z "$migrated" ]
}

# --- 2. build --------------------------------------------------------------------------
#
# The ORM CLI resolves entities from `dist/`, so the build has to precede the migration or the
# CLI sees no entities at all.

log "building"
pnpm build

# --- 3. migrate ------------------------------------------------------------------------

fresh_database=false
if is_fresh_database; then
  fresh_database=true
  log "no migrations have run yet, seeding after the migration"
else
  log "database already migrated, seeding skipped unless forced"
fi

log "running migrations"
pnpm orm migration:up

# --- 4. seed ---------------------------------------------------------------------------

case "${SEED_ON_START:-auto}" in
  always | true)
    log "running seeders"
    pnpm orm seeder:run
    ;;
  never | false)
    log "skipping seeders (SEED_ON_START=${SEED_ON_START:-false})"
    ;;
  *)
    if [ "$fresh_database" = true ]; then
      log "running seeders"
      pnpm orm seeder:run
    else
      log "skipping seeders (SEED_ON_START=auto and the database was already migrated)"
    fi
    ;;
esac

# --- 5. start the app ------------------------------------------------------------------

log "starting the app"
exec node dist/main.js