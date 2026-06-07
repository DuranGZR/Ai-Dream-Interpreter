# Base image
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
COPY . .
# Expo Metro Bundler / Web Server port
EXPOSE 8081
# Run npm install and then expo start
CMD ["sh", "-c", "sleep 5 && npm install && npx expo start --web"]

# Production build stage
FROM base AS build
RUN npm install
COPY . .
# Export the React Native Web build (outputs to /app/dist by default in Expo SDK 50+)
RUN npx expo export --platform web

# Production serving stage (using Nginx)
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration if needed, or use default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
