#!/bin/bash

set -euo pipefail

REGISTRY_IMAGE="prnndk/portfolio-app"
COMPOSE_DEV="docker compose -f docker-compose.yml"
COMPOSE_PROD="docker compose -f docker-compose.deploy.yml"

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}ℹ  $*${NC}"; }
success() { echo -e "${GREEN}✅  $*${NC}"; }
warn()    { echo -e "${YELLOW}⚠️  $*${NC}"; }
error()   { echo -e "${RED}❌  $*${NC}"; exit 1; }

# ── Argument parsing ──────────────────────────────────────────────────────────
MODE="local"
[[ "${1:-}" == "--prod"       ]] && MODE="prod"
[[ "${1:-}" == "--build-push" ]] && MODE="build-push"

# ─────────────────────────────────────────────────────────────────────────────
# LOCAL mode  – build image from source, start dev stack
# ─────────────────────────────────────────────────────────────────────────────
deploy_local() {
    info "Mode: LOCAL (docker-compose.yml)"

    # Ensure .env exists
    if [ ! -f .env ]; then
        warn ".env not found — copying from .env.example"
        cp .env.example .env
    fi

    info "Building and starting containers..."
    $COMPOSE_DEV up -d --build

    success "Local stack is up!  →  http://localhost:8878"
}

# ─────────────────────────────────────────────────────────────────────────────
# PROD mode  – pull latest image, start production stack
# ─────────────────────────────────────────────────────────────────────────────
deploy_prod() {
    info "Mode: PRODUCTION (docker-compose.deploy.yml)"

    [ ! -f .env ] && error ".env file not found. Create it before deploying."

    info "Pulling latest images..."
    $COMPOSE_PROD pull

    info "Stopping old containers (zero-downtime: DB stays up)..."
    $COMPOSE_PROD stop app nginx 2>/dev/null || true

    info "Starting services..."
    $COMPOSE_PROD up -d --remove-orphans

    info "Waiting for app container to become healthy..."
    TIMEOUT=120
    ELAPSED=0
    until [ "$($COMPOSE_PROD ps -q app | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null)" = "healthy" ]; do
        if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
            warn "Health check timeout — showing logs:"
            $COMPOSE_PROD logs --tail=50 app
            error "App container is not healthy after ${TIMEOUT}s"
        fi
        sleep 5
        ELAPSED=$((ELAPSED + 5))
        echo -n "."
    done
    echo ""

    info "Reloading nginx config..."
    $COMPOSE_PROD exec -T nginx nginx -s reload 2>/dev/null || true

    success "Production deployment complete!  →  http://localhost:8878"
    $COMPOSE_PROD ps
}

# ─────────────────────────────────────────────────────────────────────────────
# BUILD-PUSH mode  – build, tag, push image, then deploy prod
# Used in CI/CD pipelines (GitHub Actions, etc.)
# ─────────────────────────────────────────────────────────────────────────────
deploy_build_push() {
    info "Mode: BUILD & PUSH  →  ${REGISTRY_IMAGE}:latest"

    GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

    # Audit dependencies for known vulnerabilities before baking into the image.
    # This compensates for not using --no-scripts in the Dockerfile.
    info "Auditing Composer dependencies..."
    if command -v composer &>/dev/null; then
        composer audit --no-dev || error "composer audit found security vulnerabilities. Fix them before pushing."
    else
        warn "composer not found locally — skipping audit (run it in CI)"
    fi

    info "Building multi-stage Docker image..."
    docker build \
      --tag "${REGISTRY_IMAGE}:latest" \
      --tag "${REGISTRY_IMAGE}:${GIT_SHA}" \
      --label "git.sha=${GIT_SHA}" \
      --label "built.at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      .

    info "Pushing image to registry..."
    docker push "${REGISTRY_IMAGE}:latest"
    docker push "${REGISTRY_IMAGE}:${GIT_SHA}"
    success "Image pushed: ${REGISTRY_IMAGE}:${GIT_SHA}"

    # Run production deploy after push
    deploy_prod
}

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀  Portofolio Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

case "$MODE" in
    local)       deploy_local      ;;
    prod)        deploy_prod       ;;
    build-push)  deploy_build_push ;;
esac

