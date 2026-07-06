FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY product-service/package*.json ./product-service/
COPY shared ./shared
RUN npm install --omit=dev && npm install --omit=dev --prefix ./product-service
COPY product-service ./product-service
COPY shared ./shared
EXPOSE 3002
CMD ["node","product-service/server.js"]
