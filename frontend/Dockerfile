# Stage 1: Build the Vite production bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files to cache dependencies
COPY package*.json ./

# Install packages
RUN npm ci

# Copy all source assets
COPY . .

# Compile Vite static assets into dist/
RUN npm run build

# Stage 2: Serve the compiled assets using high-performance Nginx
FROM nginx:stable-alpine

# Remove default configuration and copy custom SPA configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 into Nginx HTML server directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Web Client port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
