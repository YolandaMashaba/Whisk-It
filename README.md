# Whisk-It

Full-stack bakery **POS**: sales floor, **kitchen display (KDS)**, and **admin** inventory and reporting. **React + Vite** client, **Express** API, **SQL Server** (`mssql`).

## Apps (routes)

| Route | Who | Purpose |
|-------|-----|---------|
| `/` | Public | **Sales terminal** — category tabs, product tiles, cart, numpad for quantity, **Pay** → `POST /api/orders` |
| `/login` | Public | Staff JWT login |
| `/register` | Public | Create account (`is_admin` = false; admins are assigned in Admin → Users) |
| `/kitchen` | Signed-in | **KDS** — pending orders (grouped), **30s auto-refresh**, color by wait time, **Complete** |
| `/admin` | Admin only | Inventory CRUD, sales table, charts (daily revenue, top products), date range |

Navigation uses **React Router**; the Vite dev server **proxies** `/api` to the backend (see `client/vite.config.js`).

## Structure

| Directory | Role |
|-----------|------|
| `client/` | React UI (Vite) |
| `server/` | Express API |
| `server/db/schema.sql` | **SSMS** bootstrap: tables + seed users + sample menu |
| `server/db/migration-add-is-admin.sql` | **Existing DBs:** add `Users.is_admin` without dropping tables |

## Database (SQL Server Management Studio)

1. Create database **`WhiskitDB`** (if it does not exist).
2. Connect to your instance (example in `.env.example`: **`DESKTOP-0P2GD71`** + **`MSSQLSERVER01`** → `DESKTOP-0P2GD71\MSSQLSERVER01` in SSMS).
3. Open `server/db/schema.sql` in SSMS with **WhiskitDB** as the current database and execute.

The script **drops and recreates** `Users`, `Items`, `Orders`, and `OrderItems` — use only on a fresh or disposable database.

If you already have a database from an older version without `is_admin`, run **`server/db/migration-add-is-admin.sql`** once (with **WhiskitDB** selected) instead of re-running the full schema.

**Seed logins**

- `admin` / `admin123` — admin role (inventory + reports)
- `kitchen` / `kitchen123` — staff role (kitchen queue only)

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended) and npm
- SQL Server reachable from your machine (see database configuration below)

## Setup

From the repository root:

```bash
npm install
npm install --prefix server
npm install --prefix client --legacy-peer-deps
```

The client uses `--legacy-peer-deps` because of a known ESLint peer dependency mismatch on a clean install.

### Server environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` for your machine. The example file uses **`DESKTOP-0P2GD71`** + **`MSSQLSERVER01`** + **`WhiskitDB`**.

### Connection string (remote or copy-paste)

If SQL Server runs on **another machine** (or you prefer one line from SSMS / Azure), set **`DB_CONNECTION_STRING`** in `server/.env`. When it is set, it **overrides** `DB_SERVER`, `DB_INSTANCE`, `DB_PORT`, `DB_DATABASE`, and the split auth variables.

Put the whole string in **double quotes** so semicolons are preserved. Example for a remote host with SQL authentication and TCP **1433**:

```env
DB_CONNECTION_STRING="Server=tcp:192.168.1.50,1433;Database=WhiskitDB;User Id=app_user;Password=your_password;Encrypt=true;TrustServerCertificate=true"
```

Examples (adjust names, ports, and passwords):

- **Default instance, port 1433:** `Server=tcp:OTHER-PC,1433;Database=WhiskitDB;...`
- **Named instance:** often `Server=tcp:OTHER-PC\\SQLEXPRESS;Database=WhiskitDB;...` or use the **SQL Server Configuration Manager** port for that instance and connect with `Server=tcp:OTHER-PC,49152;...`

On the **SQL Server** side, the other machine must allow remote connections: enable **TCP/IP** in SQL Server Configuration Manager, open the Windows firewall port (or your cloud NSG), and ensure SQL authentication (mixed mode) or a valid login matches `User Id` / `Password`. The Node app can run on your laptop while the database stays on the server.

### Split variables (local / no connection string)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5001`) |
| `NODE_ENV` | e.g. `development` |
| **`DB_CONNECTION_STRING`** | **Optional.** If set, used as the full [`node-mssql`](https://github.com/tediousjs/node-mssql) connection string and split `DB_*` settings are ignored |
| **`DB_SERVER`** | Required **unless** `DB_CONNECTION_STRING` is set — hostname, IP, or logical name |
| **`DB_SERVER_IP`** | Optional. When set, used as the TCP host **instead of** `DB_SERVER` (fixes Mac **ENOTFOUND** while keeping `DB_SERVER=DESKTOP-…` for your notes) |
| `DB_INSTANCE` | Optional named instance (for example `MSSQLSERVER01` or `SQLEXPRESS`). Mutually exclusive with `DB_PORT` in tedious |
| `DB_PORT` | Optional TCP port (for example `1433`). Ignored when `DB_INSTANCE` is set |
| `DB_DATABASE` | Database name (defaults to `WhiskitDB`) |
| `DB_TRUSTED_CONNECTION` | `true` for Windows integrated security (default). Set `false` when using SQL login |
| `DB_USER` / `DB_PASSWORD` | SQL authentication; if both are set, trusted connection is turned off |
| `DB_ENCRYPT` | Optional; when set, toggles encryption for the driver |
| `DB_TRUST_SERVER_CERTIFICATE` | Default `true` (typical for local/dev) |
| `DB_ENABLE_ARITH_ABORT` | Default `true` |
| `JWT_SECRET` | Sign and verify tokens; set in production |

JWT verification falls back to a dev default only when `JWT_SECRET` is unset (see `server/index.js`).

## Run everything (recommended)

```bash
npm run dev:all
```

This starts the Vite dev server and the API with nodemon, with labeled logs (`client` / `server`).

- **Client:** [http://localhost:5173](http://localhost:5173) (Vite default)
- **API:** [http://localhost:5001](http://localhost:5001) (default; override with `PORT` in `.env`)

## Run apps separately

```bash
npm run dev --prefix client
npm run dev --prefix server
```

Production-style server start:

```bash
npm start --prefix server
```

## Client build

```bash
npm run build --prefix client
```
