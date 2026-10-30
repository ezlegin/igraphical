#!/bin/sh
# Runs ON THE SERVER (piped over ssh by .github/workflows/deploy.yml).
# Pulls prebuilt images from ghcr and recreates app/admin/tutor only.
# Never touches the database, nginx-proxy or letsencrypt containers.
# Usage: IMAGE_TAG=<sha> GHCR_USER=.. GHCR_TOKEN=.. sh deploy.sh
set -eu

: "${IMAGE_TAG:?}" "${GHCR_USER:?}" "${GHCR_TOKEN:?}"
DEPLOY_DIR=/root/deploy/igraphical
BACKUP_DIR=/root/backups/igraphical
REGISTRY=ghcr.io/ezlegin
export IMAGE_TAG

# -p igraphical keeps the existing compose project (and its `database` volume).
dc() { docker compose -p igraphical -f "$DEPLOY_DIR/docker-compose.yml" "$@"; }

# Use a throwaway docker config so the server's own ghcr logins stay untouched.
DOCKER_CONFIG=$(mktemp -d)
export DOCKER_CONFIG
trap 'rm -rf "$DOCKER_CONFIG"' EXIT
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

# Safety net: logical dump of the live DB (read-only), keep the newest 7.
mkdir -p "$BACKUP_DIR"
docker exec database mysqldump -uroot --single-transaction --routines igraphical \
  | gzip > "$BACKUP_DIR/igraphical_$(date +%F_%H%M%S).sql.gz"
ls -1t "$BACKUP_DIR"/*.sql.gz | tail -n +8 | xargs -r rm -f

for svc in app admin tutor; do docker pull "$REGISTRY/igraphical-$svc:$IMAGE_TAG"; done

healthy() { # container returns an HTTP status < 500 on its own hostname:3000
  code=$(docker exec "$1" sh -c 'curl -s -o /dev/null -w "%{http_code}" http://$(hostname):3000/' 2>/dev/null || echo 000)
  [ "$code" != 000 ] && [ "$code" -lt 500 ]
}

for svc in admin tutor app; do
  prev=$(docker inspect --format '{{.Image}}' "$svc" 2>/dev/null || true)
  echo "==> deploying $svc ($IMAGE_TAG)"
  ok=0
  if dc up -d --no-deps --no-build "$svc"; then
    for _ in $(seq 1 60); do # up to ~3 min (entrypoint runs prisma via npx)
      sleep 3
      if healthy "$svc"; then ok=1; break; fi
    done
  fi
  if [ "$ok" = 1 ]; then echo "    $svc healthy"; continue; fi

  echo "!! $svc failed to start or pass health check"
  docker logs --tail 40 "$svc" || true
  if [ -n "$prev" ]; then
    echo "==> rolling $svc back to previous image"
    docker tag "$prev" "$REGISTRY/igraphical-$svc:rollback"
    IMAGE_TAG=rollback dc up -d --no-deps --no-build "$svc"
  fi
  exit 1
done

# @obhco/pay reconcile loop (stock curl image, nothing to pull from ghcr)
dc up -d --no-deps pay-reconcile

docker image prune -f >/dev/null
echo "deploy ok: $IMAGE_TAG"
