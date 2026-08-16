FROM node:20-slim

WORKDIR /app

# Create a non-root user to run the app (least privilege)
RUN groupadd --system app && useradd --system --gid app --home-dir /app app

# Copy root package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install root & frontend dependencies
RUN npm install
RUN cd frontend && npm install

# Copy application source
COPY . .

# Build frontend production bundle
RUN npm run build

# Create writable runtime dirs owned by the non-root user
RUN mkdir -p data uploads && chown -R app:app data uploads

# Drop privileges
USER app

# Expose server port
EXPOSE 10000

ENV NODE_ENV=production
ENV PORT=10000

CMD ["npm", "start"]