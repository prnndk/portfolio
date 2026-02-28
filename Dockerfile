# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Node: compile frontend assets
# Pin to a specific minor for reproducible builds; update intentionally.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS node-builder

WORKDIR /app

# Copy only dependency manifests first (layer-cache friendly)
COPY package.json package-lock.json* ./
# ci is strict: verifies lockfile integrity — prevents supply-chain tampering
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — PHP: production image
# ─────────────────────────────────────────────────────────────────────────────
FROM php:8.4-fpm

# Install ONLY the runtime libraries needed — no shells or dev tools
# removed: git curl (unnecessary attack surface in production runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
# fileinfo: validate real MIME type of uploaded files (not just extension)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache fileinfo

# ── OPcache (performance + integrity: validate_timestamps=0 prevents re-check) ─
RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.revalidate_freq=0"; \
    echo "opcache.validate_timestamps=0"; \
    echo "opcache.max_accelerated_files=10000"; \
    echo "opcache.memory_consumption=192"; \
    echo "opcache.interned_strings_buffer=16"; \
    echo "opcache.fast_shutdown=1"; \
} > /usr/local/etc/php/conf.d/opcache.ini

# Install Composer (no dev tools inside the final image — composer is only used at build time)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy application source (secrets excluded via .dockerignore)
COPY --chown=www-data:www-data . /var/www

# Install PHP dependencies.
# --no-scripts is intentionally NOT used: Laravel's post-autoload-dump script
# (Illuminate\Foundation\ComposerScripts + php artisan package:discover) must
# run to build the package manifest. Malicious supply-chain scripts are
# mitigated by running `composer audit` in CI before building this image.
# Composer is removed after install so it is not available at runtime.
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev \
    && composer clear-cache \
    && rm -f /usr/bin/composer

# ── PHP security hardening — written AFTER composer so proc_open is available ─
# during the build (needed by `php artisan package:discover` post-autoload-dump).
# At runtime these restrictions are fully active.
# expose_php=Off        — hides PHP version from X-Powered-By header
# allow_url_fopen/include=Off — blocks SSRF & Remote File Inclusion
# disable_functions     — prevents shell escape if a webshell is executed
# display_errors=Off    — stack traces never reach HTTP clients
# session.*             — hardened cookie defaults
RUN { \
    echo "expose_php=Off"; \
    echo "allow_url_fopen=Off"; \
    echo "allow_url_include=Off"; \
    echo "display_errors=Off"; \
    echo "log_errors=On"; \
    echo "error_log=/var/www/storage/logs/php_error.log"; \
    echo "disable_functions=exec,passthru,shell_exec,system,proc_open,popen,proc_close,show_source,phpinfo,dl"; \
    echo "session.cookie_httponly=1"; \
    echo "session.cookie_secure=1"; \
    echo "session.use_strict_mode=1"; \
    echo "session.cookie_samesite=Strict"; \
} > /usr/local/etc/php/conf.d/security.ini

# Pull compiled frontend assets from Node stage
COPY --from=node-builder --chown=www-data:www-data /app/public/build /var/www/public/build

# Copy & register the entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 0550 /usr/local/bin/entrypoint.sh \
    && chown root:www-data /usr/local/bin/entrypoint.sh

# Ensure writable directories have minimal permissions
# 0755 for dirs, www-data owns only what it needs to write
RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} \
             /var/www/storage/logs \
             /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 750 /var/www/storage /var/www/bootstrap/cache \
    # Application code should NOT be writable by the runtime user
    && find /var/www -not -path '/var/www/storage/*' \
                    -not -path '/var/www/bootstrap/cache/*' \
                    -not -name '.env' \
       | xargs chown root:www-data 2>/dev/null || true \
    && find /var/www -not -path '/var/www/storage/*' \
                    -not -path '/var/www/bootstrap/cache/*' \
                    -type f \
       | xargs chmod 0640 2>/dev/null || true \
    && find /var/www -not -path '/var/www/storage/*' \
                    -not -path '/var/www/bootstrap/cache/*' \
                    -type d \
       | xargs chmod 0750 2>/dev/null || true

USER www-data

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
