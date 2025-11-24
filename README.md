User Balance Service

NestJS web server for managing user balances with transaction history.

## Tech Stack

- NestJS, TypeScript, PostgreSQL, TypeORM

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start database:
```bash
docker-compose up -d postgres
```

3. Run migrations:
```bash
npm run migration:run
```

4. Start application:
```bash
docker-compose up -d
```

## API

### POST /transactions/debit

Debit funds from user balance.

**Request:**
```json
{
  "userId": 1,
  "amount": 100.00
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": 1,
  "newBalance": 900.00
}
```

## Features

- Automatic balance recalculation from transaction history
- Pessimistic locking to prevent race conditions
- Auto-seeding: user with ID 1 created on startup
- Request validation

## Scripts

- `npm run start:dev` - Development mode
- `npm run build` - Build
- `npm run migration:run` - Run migrations
