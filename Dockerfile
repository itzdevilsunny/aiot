# Stage 1: Build the Vite React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# In production, API calls go through the nginx reverse proxy on the same origin
ARG VITE_BACKEND_URL=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ARG VITE_WS_URL=
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# Stage 2: Serve with nginx using our custom reverse proxy config
FROM nginx:alpine

# Copy the built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (handles API + WebSocket proxying)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
