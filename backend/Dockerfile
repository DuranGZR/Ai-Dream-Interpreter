# Base image
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "sleep 5 && npm install && npm run dev"]

# Production build stage
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# Production running stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# Copy other essential backend resources if needed
COPY --from=build /app/serviceAccount.json ./serviceAccount.json
EXPOSE 3000
CMD ["npm", "run", "start"]
