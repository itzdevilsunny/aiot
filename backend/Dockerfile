FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Build TypeScript
RUN npm run build 2>/dev/null || true

EXPOSE 4000

CMD ["npx", "tsx", "src/index.ts"]
