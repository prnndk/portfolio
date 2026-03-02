#!/bin/bash
# Entrypoint for the Laravel production container.
# Runs as www-data (non-root). Handles bootstrap, then exec's php-fpm.
set -euo pipefail

echo "🔧 Running Laravel entrypoint setup..."

# ─── Validate .env ────────────────────────────────────────────────────────────
if [ ! -f /var/www/.env ]; then
    echo "❌  .env file not found at /var/www/.env"
    echo "    Mount your .env: -v \$(pwd)/.env:/var/www/.env:ro"
    exit 1
fi

# Guard: ensure APP_ENV is not accidentally set to 'local' in production
APP_ENV_VALUE=$(grep -E '^APP_ENV=' /var/www/.env | cut -d= -f2- | tr -d '"\047 ')
if [ "${APP_ENV_VALUE}" = "local" ]; then
    echo "⚠️   WARNING: APP_ENV=local detected in production container."
fi

# Guard: ensure APP_DEBUG is Off in production
APP_DEBUG_VALUE=$(grep -E '^APP_DEBUG=' /var/www/.env | cut -d= -f2- | tr -d '"\047 ' | tr '[:upper:]' '[:lower:]')
if [ "${APP_DEBUG_VALUE}" = "true" ] || [ "${APP_DEBUG_VALUE}" = "1" ]; then
    echo "⚠️   WARNING: APP_DEBUG=true is enabled. This leaks stack traces to users."
fi

# ─── APP_KEY auto-generation ──────────────────────────────────────────────────
APP_KEY_VALUE=$(grep -E '^APP_KEY=' /var/www/.env | cut -d= -f2-)
if [ -z "$APP_KEY_VALUE" ]; then
    echo "🔑  APP_KEY is empty — generating..."
    php artisan key:generate --force --no-interaction
fi

# ─── Storage directory permissions ────────────────────────────────────────────
# Enforce correct ownership and restrictive permissions on each startup.
# Prevents a volume mount from accidentally granting world-write access.
echo "🔒  Enforcing storage permissions..."
mkdir -p /var/www/storage/framework/{sessions,views,cache} \
         /var/www/storage/logs \
         /var/www/bootstrap/cache
chmod 750 /var/www/storage \
          /var/www/storage/framework \
          /var/www/storage/framework/sessions \
          /var/www/storage/framework/views \
          /var/www/storage/framework/cache \
          /var/www/storage/logs \
          /var/www/storage/app \
          /var/www/bootstrap/cache 2>/dev/null || true

# ─── Migrations ───────────────────────────────────────────────────────────────
echo "🗄️   Running migrations..."
php artisan migrate --force --no-interaction

# ─── Storage link & cache ─────────────────────────────────────────────────────
echo "🔗  Linking storage..."
php artisan storage:link --force > /dev/null 2>&1 || true

echo "⚡  Optimising application..."
php artisan optimize

# ─── Publish public assets to shared volume (for nginx) ───────────────────────
#
# Problem: the named volume persists across deployments, so a plain `cp -rf`
# only adds/overwrites files — it never removes assets that were deleted or
# renamed between releases.  The fix is to wipe the volume content first so
# nginx always serves exactly what is inside this image, nothing more.
if [ -d /var/www-public ]; then
    echo "📁  Cleaning stale assets from shared volume..."
    # Delete every entry inside the volume without removing the mount-point dir.
    find /var/www-public -mindepth 1 -delete 2>/dev/null || true

    echo "📁  Copying public/ -> shared volume..."
    cp -rf /var/www/public/. /var/www-public/

    # Ensure nginx can read but not write these files
    chmod -R 750 /var/www-public 2>/dev/null || true
fi

echo "🚀  Setup complete — starting php-fpm..."

# Replace this shell process with php-fpm (clean process tree, correct signal handling)
exec "$@"
