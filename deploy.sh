#!/bin/bash

# Portofolio Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# 1. Bring up containers with latest build
# This ensures any Dockerfile changes (php extensions, system packages) are applied
echo "📦 Building and starting Docker containers..."
docker compose up -d --build

# 2. Install/Update Composer Dependencies (Backend)
# Necessary because the local volume mount overrides the image's vendor folder
echo "🎼 Installing PHP dependencies..."
docker compose exec -T app composer install --no-dev --optimize-autoloader

# 3. Install/Update NPM Dependencies & Build Assets (Frontend)
# Necessary because the local volume mount overrides the image's public/build folder
echo "🎨 Building frontend assets..."
docker compose exec -T app npm ci
docker compose exec -T app npm run build

# 4. Run Database Migrations
echo "🗄️  Running database migrations..."
docker compose exec -T app php artisan migrate --force

# 5. Clear and Cache Configuration/Routes/Views
echo "🧹 Optimizing application cache..."
docker compose exec -T app php artisan optimize
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache

# 6. Ensure Storage Link Exists
echo "🔗 Linking storage..."
docker compose exec -T app php artisan storage:link

# 7. Restart Queue Workers (if applicable)
# echo "🔄 Restarting queue workers..."
# docker compose exec -T app php artisan queue:restart

echo "✅ Deployment completed successfully!"
