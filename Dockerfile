FROM node:20-alpine

WORKDIR /app

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

# Expose server port
EXPOSE 10000

ENV NODE_ENV=production
ENV PORT=10000

CMD ["npm", "start"]
