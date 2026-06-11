#!/usr/bin/env bash
# Start PostgreSQL for this project
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PGDATA="${PGDATA:-$ROOT_DIR/pgdata}"

PG_BINDIR=""
for d in /usr/lib/postgresql/*/bin; do
  [ -d "$d" ] && PG_BINDIR="$d" && break
done

if [ -z "$PG_BINDIR" ]; then
  echo "ERROR: PostgreSQL binaries not found."
  exit 1
fi

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "ERROR: No PostgreSQL data directory at $PGDATA."
  echo "Run 'bash scripts/setup.sh' first to initialize."
  exit 1
fi

if pg_isready -h 127.0.0.1 -p 5433 &>/dev/null; then
  echo "PostgreSQL is already running on port 5433."
else
  "$PG_BINDIR/pg_ctl" -D "$PGDATA" -l "$PGDATA/logfile" start
  sleep 2
  echo "PostgreSQL started on port 5433."
fi
