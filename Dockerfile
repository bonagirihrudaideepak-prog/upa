# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: PHP Apache Production Web Server
FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache rewrite module
RUN a2enmod rewrite

# Set Working Directory
WORKDIR /var/www/html

# Copy application backend & asset files
COPY backend/ ./backend/
COPY uploads/ ./uploads/
COPY .htaccess ./.htaccess
COPY .htrouter.php ./.htrouter.php
COPY index.php ./index.php
COPY dashboard_setup.php ./dashboard_setup.php
COPY import_db.php ./import_db.php

# Copy compiled React frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/dist/

# Set ownership and permissions for uploads directory
RUN chown -R www-data:www-data /var/www/html/uploads \
    && chmod -R 775 /var/www/html/uploads

# Configure Apache port dynamically for Render
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

ENV PORT=10000
EXPOSE 10000

CMD ["apache2-foreground"]
