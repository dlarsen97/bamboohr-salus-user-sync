# BambooHR ↔ Salus Sync

Syncs Users and Trainings between BambooHR and Salus Safety.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install API clients

The BambooHR and Salus SDK clients are generated from their OpenAPI specs using [`api`](https://npm.im/api). To regenerate them:

```bash
npm run install-api
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# BambooHR
API_KEY=your_bamboohr_api_key

# Salus
CLIENT_ID=your_salus_client_id
CLIENT_SECRET=your_salus_client_secret
```

## Using the clients in scripts

### BambooHR

The BambooHR client is pre-authenticated at import time using `API_KEY` from `.env`.

```typescript
import { bamboohr } from "./src/bamboohr/init";

const { data } = await bamboohr.getEmployeesList({ 'page[limit]': '50' });
```

### Salus

The Salus client uses OAuth2 client credentials. Call `getSalus()` to get an authenticated client — it automatically fetches a new token if the current one is expired.

```typescript
import { getSalus } from "./src/salus/init";

const salus = await getSalus();
const { data } = await salus.search_v1_user__get({ limit: 50 });
```

> `getSalus()` must be awaited before each use in long-running scripts, as it handles token refresh transparently.

## Running individual modules

```bash
# Test BambooHR connection
npx ts-node src/bamboohr/init.ts

# Test Salus connection
npx ts-node src/salus/init.ts
```
