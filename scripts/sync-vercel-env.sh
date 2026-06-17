#!/usr/bin/env bash
# Sync business-site/.env.local secrets to Vercel (production, preview, development).
# Usage: from business-site/ run: bash scripts/sync-vercel-env.sh
# Requires: vercel CLI logged in, project linked (vercel link).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

if ! vercel whoami >/dev/null 2>&1; then
  echo "Run: vercel login"
  exit 1
fi

add_var() {
  local key="$1"
  local value="$2"
  local env="$3"
  if [[ -z "$value" ]]; then
    echo "skip $key ($env) — empty"
    return
  fi
  printf '%s' "$value" | vercel env add "$key" "$env" --force >/dev/null 2>&1 \
    && echo "ok   $key ($env)" \
    || echo "fail $key ($env)"
}

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  [[ "$line" != *"="* ]] && continue

  key="${line%%=*}"
  value="${line#*=}"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  for env in production preview development; do
    add_var "$key" "$value" "$env"
  done
done < "$ENV_FILE"

echo ""
echo "Done. Redeploy for env changes to apply: vercel --prod"
