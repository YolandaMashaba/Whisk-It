# Whisk-It

Full-stack bakery **POS** with a sales floor, **kitchen display (KDS)**, and **admin** panel for inventory and reporting. Built with **React + Vite** on the frontend and **Express** on the backend, using local **JSON file storage** (no database setup required).

## Apps (routes)

| Route | Who | Purpose |
|-------|-----|---------|
| `/` | Public | **Sales terminal** — category tabs, product tiles, cart, numpad for quantity, **Pay** → creates an order |
| `/login` | Public | Staff JWT login |
| `/register` | Public | Create account (first user becomes admin; subsequent users are staff) |
| `/kitchen` | Signed-in | **KDS** — pending orders with colour-coded urgency, **30s auto-refresh**, **Complete** button |
| `/admin` | Admin only | Inventory CRUD, sales analytics, top products, recent orders, user management |

Navigation uses **React Router**; the Vite dev server **proxies** `/api` requests to the Express backend (see `client/vite.config.js`).

## Project structure

| Directory | Role |
|-----------|------|
| `client/` | React UI (Vite, Tailwind CSS) |
| `server/` | Express API |
| `server/db/store.js` | JSON file-based data store |
| `server/db/storage.json` | Data file (auto-created on first run) |

## Prerequisites

- [Node.js](https://nodejs.org/) **v22.12+** (or v20.19+) and npm

No database installation is needed — data is stored in `server/db/storage.json`.

## Setup

From the repository root, install dependencies for all three package.json files:

```bash
# 1. Root (installs concurrently for the dev:all script)
npm install

# 2. Client
npm install --prefix client --legacy-peer-deps

# 3. Server
npm install --prefix server
```

> The client uses `--legacy-peer-deps` because of a peer dependency mismatch between `eslint-plugin-react` and `eslint@10`.

### Windows — Rolldown native binding

On Windows, the Rolldown native binding (required by Vite 8) may not install automatically due to a [known npm bug with optional dependencies](https://github.com/npm/cli/issues/4828). If the client fails to start with `Cannot find module '@rolldown/binding-win32-x64-msvc'`, install it explicitly:

```bash
npm install @rolldown/binding-win32-x64-msvc --legacy-peer-deps --prefix client
```

### Server environment

```bash
cp server/.env.example server/.env
```

The defaults work out of the box for local development. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | `change-me-in-production` | Secret for signing JWT tokens |

## Running the project

### Start both client and server (recommended)

```bash
npm run dev:all
```

This uses `concurrently` to run both apps with labelled output (`client` / `server`).

- **Client:** [http://localhost:5173](http://localhost:5173)
- **Server:** [http://localhost:5001](http://localhost:5001)

### Run apps separately

```bash
# Client (Vite dev server with HMR)
npm run dev --prefix client

# Server (nodemon with auto-restart)
npm run dev --prefix server
```

Production-style server start (no auto-restart):

```bash
npm start --prefix server
```

### Client build

```bash
npm run build --prefix client
```

## First-time usage

1. Open [http://localhost:5173/register](http://localhost:5173/register) and create an account. The **first user** is automatically an admin.
2. Log in and navigate to **Admin → Inventory** to add bakery items (name, price, category, stock).
3. The **Sales terminal** (`/`) displays items from the API. Tap products, adjust quantities, and hit **Pay** to create orders.
4. The **Kitchen** (`/kitchen`) shows pending orders and lets staff mark them as complete.
5. **Admin → Sales Analytics** shows revenue, top products, and recent orders — all computed from real data.

## API endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/status` | — | Health check |
| `POST` | `/api/auth/login` | — | Login (returns JWT) |
| `POST` | `/api/auth/register` | — | Register new user |
| `GET` | `/api/items` | — | List active menu items |
| `POST` | `/api/items` | Admin | Create item |
| `PUT` | `/api/items/:id` | Admin | Update item |
| `DELETE` | `/api/items/:id` | Admin | Deactivate item |
| `POST` | `/api/orders` | — | Place an order |
| `GET` | `/api/orders/pending` | Auth | Pending orders (kitchen) |
| `PUT` | `/api/orders/:id/complete` | Auth | Mark order complete |
| `GET` | `/api/admin/items` | Admin | All items (including inactive) |
| `GET` | `/api/admin/users` | Admin | List users |
| `PATCH` | `/api/admin/users/:id` | Admin | Update user admin status |
| `GET` | `/api/admin/orders` | Admin | All orders (with date filters) |
| `GET` | `/api/reports/sales` | Admin | Sales report by day |
| `GET` | `/api/reports/top-products` | Admin | Top selling products |
