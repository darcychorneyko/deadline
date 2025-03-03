# Stage 1: Build the Angular application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using nginx
FROM nginx:alpine

# Create directory for certificates
RUN mkdir -p /etc/nginx/ssl

# Copy the built application
COPY --from=build /app/dist/deadline/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (these need to be present in the build context)
COPY ./ssl/cert.pem /etc/nginx/ssl/
COPY ./ssl/key.pem /etc/nginx/ssl/

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 