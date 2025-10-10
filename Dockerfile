# Dockerfile para Dashboard React
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
