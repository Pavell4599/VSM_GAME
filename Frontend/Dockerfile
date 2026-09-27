FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Build the app for development with Vite
EXPOSE 8080

CMD ["npm", "run", "dev"]
