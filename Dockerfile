# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create data directory for database
RUN mkdir -p /app/data

# Initialize database
RUN node scripts/init-db.js

# Note: Port is configured via environment variables in compose.yml or .env
# Default port 6923 can be changed by setting PORT in your .env file

# Start the application
CMD ["node", "server.js"]
