# Dockerfile para API Node.js
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm install --only=production

# Copiar código fuente
COPY . .

EXPOSE 8080

CMD ["node", "chatwoot.js"]
