FROM node:18

WORKDIR /app

# System dependencies for code execution (Python + C)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  python3 \
  python3-pip \
  gcc \
  g++ \
  make \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy TiDB CA certificate (if exists)
COPY tidb-ca.pem* ./

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]

