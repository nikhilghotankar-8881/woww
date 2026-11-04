# Production Dockerfile for Shetkari SuchnaSetu Background Monitoring Worker
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy worker application code
COPY . .

# Run continuous watch & fanout monitoring daemon
CMD ["node", "run.mjs", "--watch"]

