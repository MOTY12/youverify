FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY payment-service/package*.json ./payment-service/
COPY shared ./shared
RUN npm install --omit=dev && npm install --omit=dev --prefix ./payment-service
COPY payment-service ./payment-service
COPY shared ./shared
EXPOSE 3004
CMD ["node","payment-service/server.js"]
