#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

# Load DATABASE_URL from .env
if [ -f "$PROJECT_DIR/.env" ]; then
  DATABASE_URL=$(grep '^DATABASE_URL=' "$PROJECT_DIR/.env" | cut -d '=' -f2-)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set. Add it to .env or export it." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTFILE="$BACKUP_DIR/mossbrain_${TIMESTAMP}.sql.gz"

# Find a pg_dump that's >= server version (17).
# Try versioned installs first, then fall back to whatever's on PATH.
PG_DUMP=""
for candidate in \
  /opt/homebrew/opt/postgresql@17/bin/pg_dump \
  /opt/homebrew/opt/postgresql@16/bin/pg_dump \
  /usr/local/opt/postgresql@17/bin/pg_dump \
  /usr/local/opt/postgresql@16/bin/pg_dump; do
  if [ -x "$candidate" ]; then
    PG_DUMP="$candidate"
    break
  fi
done

if [ -z "$PG_DUMP" ]; then
  PG_DUMP="$(command -v pg_dump 2>/dev/null || true)"
fi

if [ -z "$PG_DUMP" ]; then
  echo "ERROR: pg_dump not found. Install with: brew install postgresql@17" >&2
  exit 1
fi

echo "Using $PG_DUMP"
echo "Backing up to $OUTFILE ..."
"$PG_DUMP" --no-owner --no-acl "$DATABASE_URL" | gzip > "$OUTFILE"

SIZE=$(du -h "$OUTFILE" | cut -f1)
echo "Done — $SIZE compressed"

# Keep only the 10 most recent backups
cd "$BACKUP_DIR"
ls -t mossbrain_*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

COUNT=$(ls mossbrain_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
echo "$COUNT backup(s) retained in $BACKUP_DIR"
