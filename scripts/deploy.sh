#!/bin/sh
# Deploys prebuilt images ON THE SERVER. Installed by hand as
# /opt/igraphical/deploy.sh (root, 750) and started only through
# deploy.sh-wrapper, the one command the `igraphical-deploy` SSH key may run
# (.github/workflows/deploy.yml). Pulls the images with the server's own ghcr
# login and recreates only the apps asked for.
# Never touches the database or the shared proxy.
# Usage: deploy.sh <full commit sha> [app] [admin]
set -eu

IMAGE_TAG="${1:?usage: deploy.sh <sha> [app] [admin]}"
shift
SERVICES="$*"
DEPLOY_DIR=/root/deploy/igraphical
BACKUP_DIR=/root/backups/igraphical
REGISTRY=ghcr.io/ezlegin
export IMAGE_TAG

# -p igraphical keeps the existing compose project (and its `database` volume).
dc() { docker compose -p igraphical -f "$DEPLOY_DIR/docker-compose.yml" "$@"; }

# Safety net: logical dump of the live DB (read-only), keep the newest 7.
mkdir -p "$BACKUP_DIR"
docker exec database mysqldump -uroot --single-transaction --routines igraphical \
  | gzip > "$BACKUP_DIR/igraphical_$(date +%F_%H%M%S).sql.gz"
ls -1t "$BACKUP_DIR"/*.sql.gz | tail -n +8 | xargs -r rm -f

for svc in $SERVICES; do docker pull -q "$REGISTRY/igraphical-$svc:$IMAGE_TAG"; done

healthy() { # container returns an HTTP status < 500 on its own hostname:3000
  code=$(docker exec "$1" sh -c 'curl -s -o /dev/null -w "%{http_code}" http://$(hostname):3000/' 2>/dev/null || echo 000)
  [ "$code" != 000 ] && [ "$code" -lt 500 ]
}

for svc in admin app; do
  case " $SERVICES " in *" $svc "*) ;; *) continue ;; esac
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

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $IMAGE_TAG ${SERVICES:-none}" >> "$DEPLOY_DIR/deploys.log"
docker image prune -f >/dev/null
echo "deploy ok: $IMAGE_TAG"
