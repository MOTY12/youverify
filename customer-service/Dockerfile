FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY customer-service/package*.json ./customer-service/
COPY shared ./shared
RUN npm install --omit=dev && npm install --omit=dev --prefix ./customer-service
COPY customer-service ./customer-service
COPY shared ./shared
EXPOSE 3001
CMD ["node","customer-service/server.js"]
