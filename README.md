# youverify microservices demo

This repository contains a Node.js/Express microservices demo for an e-commerce workflow with MongoDB, RabbitMQ, Docker Compose, and REST-based service-to-service communication.

## Architecture

- Customer service accepts customer requests and creates orders
- Product service stores seeded product catalog data
- Order service creates orders and coordinates payment requests
- Payment service accepts payment requests and publishes transaction events to RabbitMQ
- Transaction worker consumes RabbitMQ messages and stores transaction history in MongoDB

## Services

- Customer service: http://localhost:3001
- Product service: http://localhost:3002
- Order service: http://localhost:3003
- Payment service: http://localhost:3004
- RabbitMQ UI: http://localhost:15672 (guest/guest)
- MongoDB: mongodb://localhost:27017

## Run locally with Docker Compose

```bash
docker compose up --build
```

## Seeded data

- One customer is seeded in the customer database
- Several products are seeded in the product database

## Example flow

1. Retrieve a seeded product from the product service
2. Create an order from the customer service
3. Review the order from the order service
4. Review the transaction history from the payment service

## Useful endpoints

### Customer service
- GET /health
- GET /customers/:id
- POST /customers/:customerId/orders

### Product service
- GET /health
- GET /products
- GET /products/:id

### Order service
- GET /health
- POST /orders
- GET /orders/:orderId

### Payment service
- GET /health
- POST /payments
- GET /transactions
- GET /transactions/:orderId

## Testing

Run tests inside each service folder:

```bash
cd customer-service && npm test
cd ../order-service && npm test
cd ../payment-service && npm test
cd ../product-service && npm test
```
