#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────
# Postgres E-Com — Full Setup Script
# Run this ONCE after cloning the repo to set up everything from scratch.
# ─────────────────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PGDATA="${PGDATA:-$ROOT_DIR/pgdata}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-raghu}"
PGDB="${PGDB:-postgres_ecom}"
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-nomic-embed-text}"

# Locate PostgreSQL binaries
PG_BINDIR=""
for d in /usr/lib/postgresql/*/bin; do
  [ -d "$d" ] && PG_BINDIR="$d" && break
done
if [ -z "$PG_BINDIR" ]; then
  echo "ERROR: PostgreSQL binaries not found. Is PostgreSQL installed?"
  exit 1
fi

echo "=== Prerequisites ==="

# Check Node
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found. Install Node.js 18+."
  exit 1
fi
echo "  Node: $(node --version)"

# Check npm
if ! command -v npm &>/dev/null; then
  echo "ERROR: npm not found."
  exit 1
fi
echo "  npm: $(npm --version)"

# Check PostgreSQL
if ! command -v psql &>/dev/null; then
  echo "ERROR: psql not found."
  exit 1
fi
echo "  PostgreSQL: $(psql --version | head -1)"

# Check Ollama
if command -v ollama &>/dev/null; then
  echo "  Ollama: $(ollama --version 2>/dev/null || echo 'found')"
else
  echo "  WARNING: ollama CLI not found. Ensure Ollama is running at $OLLAMA_HOST."
fi

echo ""
echo "=== Step 1: Initialize PostgreSQL data directory ==="

if [ -f "$PGDATA/PG_VERSION" ]; then
  echo "  Data directory exists at $PGDATA"
  # Try to start if not running
  if ! pg_isready -h 127.0.0.1 -p "$PGPORT" &>/dev/null; then
    echo "  Starting PostgreSQL..."
    "$PG_BINDIR/pg_ctl" -D "$PGDATA" -l "$PGDATA/logfile" start
    sleep 2
  fi
else
  echo "  Creating new PostgreSQL cluster at $PGDATA..."
  "$PG_BINDIR/initdb" -D "$PGDATA" --auth=trust --username="$PGUSER"
  echo "port = $PGPORT" >> "$PGDATA/postgresql.conf"
  echo "unix_socket_directories = '/tmp'" >> "$PGDATA/postgresql.conf"
  echo "  Starting PostgreSQL..."
  "$PG_BINDIR/pg_ctl" -D "$PGDATA" -l "$PGDATA/logfile" start
  sleep 2
fi

if ! pg_isready -h 127.0.0.1 -p "$PGPORT" &>/dev/null; then
  echo "ERROR: PostgreSQL failed to start."
  tail -5 "$PGDATA/logfile"
  exit 1
fi
echo "  PostgreSQL is ready on port $PGPORT."

echo ""
echo "=== Step 2: Create database and enable pgvector ==="

psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$PGDB'" | grep -q 1 \
  || psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d postgres -c "CREATE DATABASE $PGDB;"

psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo ""
echo "=== Step 3: Create auth schema (prerequisite for migrations) ==="

psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d "$PGDB" <<'EOF'
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
EOF

echo ""
echo "=== Step 4: Run all database migrations ==="

for f in "$ROOT_DIR/supabase/migrations/"*.sql; do
  echo "  Running $(basename "$f")..."
  psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -f "$f"
done

echo ""
echo "=== Step 5: Fix handle_new_user trigger ==="

psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d "$PGDB" <<'EOF'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'User'),
    NULL,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
EOF

echo ""
echo "=== Step 6: Seed the catalog ==="

echo "  Running 001_seed_catalog.sql..."
psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -f "$ROOT_DIR/supabase/seed/001_seed_catalog.sql"

echo "  Running 002_seed_extended_catalog.sh..."
bash "$ROOT_DIR/supabase/seed/002_seed_extended_catalog.sh"

echo ""
echo "=== Step 7: Seed search keywords ==="

psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d "$PGDB" <<'EOF'
UPDATE products SET search_keywords = NULL, search_phrases = NULL;

-- Pet Supplies
UPDATE products SET search_phrases = 'pet food' WHERE id = 38;
UPDATE products SET search_keywords = 'cat tree scratching post hammock feline climbing' WHERE id = 36;
UPDATE products SET search_keywords = 'dog bed sleeping orthopedic memory foam canine' WHERE id = 37;
UPDATE products SET search_keywords = 'toy treat puzzle feeder interactive mental stimulation' WHERE id = 38;

-- Gourmet Food
UPDATE products SET search_keywords = 'coffee beans artisan gourmet drink beverage' WHERE id = 39;
UPDATE products SET search_keywords = 'chocolate gift dessert sweet gourmet candy truffle' WHERE id = 40;
UPDATE products SET search_keywords = 'honey organic natural sweetener gourmet' WHERE id = 41;

-- Kitchen
UPDATE products SET search_keywords = 'kitchen cooking chef knife cutlery prep' WHERE id = 63;
UPDATE products SET search_keywords = 'kitchen cooking pan cookware nonstick frying' WHERE id = 64;
UPDATE products SET search_keywords = 'kitchen chopping slicing mixing appliance processor' WHERE id = 65;
EOF

echo ""
echo "=== Step 8: Create admin user ==="

psql -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" -d "$PGDB" <<'EOF'
INSERT INTO auth.users (email, password_hash)
VALUES ('admin@example.com', '$2b$10$vwmPAf.1ySoMqrazLUlQHu.F/uplvaL1hY7qg1vI51k0LPzX56.yi')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (id, display_name)
SELECT id, 'Admin' FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.user_role_enum FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;
EOF
echo "  Admin user: admin@example.com / admin123"

echo ""
echo "=== Step 9: Install npm dependencies ==="

cd "$ROOT_DIR"
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "  node_modules exists, skipping."
fi

echo ""
echo "============================================"
echo " Setup complete!"
echo "============================================"
echo ""
echo "To start the dev server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
echo ""
echo "Admin login:"
echo "  Email:    admin@example.com"
echo "  Password: admin123"
echo ""
echo "PG data directory (keep this): $PGDATA"
echo "To stop PostgreSQL:  $PG_BINDIR/pg_ctl -D $PGDATA stop"
echo "To start PostgreSQL: $PG_BINDIR/pg_ctl -D $PGDATA -l $PGDATA/logfile start"
