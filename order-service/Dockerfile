FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY order-service/package*.json ./order-service/
COPY shared ./shared
RUN npm install --omit=dev && npm install --omit=dev --prefix ./order-service
COPY order-service ./order-service
COPY shared ./shared
EXPOSE 3003
CMD ["node","order-service/server.js"]
