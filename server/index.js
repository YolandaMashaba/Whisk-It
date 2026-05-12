require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5001;

function envBool(value, defaultValue) {
  if (value === undefined || value === "") return defaultValue;
  return !/^(0|false|no|off)$/i.test(String(value).trim());
}

function buildDbConfig() {
  const logicalServer = process.env.DB_SERVER?.trim();
  const serverIp = process.env.DB_SERVER_IP?.trim();
  /** TCP target: IP wins so Mac/Linux can reach SQL without resolving Windows hostnames */
  const server = serverIp || logicalServer;
  if (!server) {
    return null;
  }

  const database = process.env.DB_DATABASE?.trim() || "WhiskitDB";
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD;
  const instanceName = process.env.DB_INSTANCE?.trim();

  const options = {
    enableArithAbort: envBool(process.env.DB_ENABLE_ARITH_ABORT, true),
    trustServerCertificate: envBool(
      process.env.DB_TRUST_SERVER_CERTIFICATE,
      true,
    ),
  };

  if (instanceName) {
    options.instanceName = instanceName;
  }

  const portRaw = process.env.DB_PORT?.trim();
  if (portRaw) {
    if (instanceName) {
      console.warn("DB_PORT is ignored when DB_INSTANCE is set.");
    } else {
      const port = parseInt(portRaw, 10);
      if (!Number.isNaN(port)) {
        options.port = port;
      }
    }
  }

  if (user && password) {
    options.trustedConnection = false;
  } else {
    options.trustedConnection = envBool(
      process.env.DB_TRUSTED_CONNECTION,
      true,
    );
  }

  const config = {
    server,
    database,
    options,
  };

  if (user && password) {
    config.user = user;
    config.password = password;
  }

  if (process.env.DB_ENCRYPT !== undefined && process.env.DB_ENCRYPT !== "") {
    config.encrypt = envBool(process.env.DB_ENCRYPT, true);
  }

  return config;
}

/**
 * Prefer DB_CONNECTION_STRING for remote hosts or copy-paste from SSMS / Azure.
 * Otherwise use DB_SERVER, DB_DATABASE, DB_USER, etc. (see .env.example).
 */
function resolveDatabaseConnection() {
  const raw = process.env.DB_CONNECTION_STRING;
  const connStr =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
  if (connStr) {
    return { kind: "connectionString", value: connStr };
  }
  const config = buildDbConfig();
  if (!config) {
    console.warn(
      "Database not configured: set DB_CONNECTION_STRING, or set DB_SERVER and/or DB_SERVER_IP, in server/.env (see server/.env.example and README).",
    );
    return null;
  }
  return { kind: "config", value: config };
}

const dbConnection = resolveDatabaseConnection();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

let pool;
async function connectDB() {
  if (!dbConnection) return;
  try {
    pool = await sql.connect(dbConnection.value);
    console.log(
      `Connected to SQL Server (${dbConnection.kind === "connectionString" ? "DB_CONNECTION_STRING" : "DB_* env"})`,
    );
    if (
      dbConnection.kind === "config" &&
      process.env.DB_SERVER_IP?.trim() &&
      process.env.DB_SERVER?.trim()
    ) {
      console.log(
        `  TCP host ${dbConnection.value.server} (DB_SERVER_IP; logical name ${process.env.DB_SERVER.trim()})`,
      );
    }
  } catch (err) {
    console.error("Database connection failed:", err);
    const code = err.code || err.originalError?.code;
    const msg = String(err.message || err.originalError?.message || "");
    if (code === "EINSTLOOKUP" || /ENOTFOUND/i.test(msg)) {
      console.error(`
Hint: DNS could not resolve the SQL host (ENOTFOUND).
  • Set DB_SERVER_IP to that Windows PC's IPv4 (from ipconfig) — it overrides DB_SERVER for TCP only, so you can keep DB_SERVER=DESKTOP-… for your notes.
  • Or set DB_SERVER to the IP directly, or add an /etc/hosts line.
  • Or use DB_CONNECTION_STRING with Server=tcp:IP,PORT;…
  • From Mac, remote SQL usually needs: DB_TRUSTED_CONNECTION=false plus DB_USER and DB_PASSWORD.
`);
    }
  }
}
connectDB();

function normalizeIsAdmin(row) {
  if (row == null) return false;
  const v = row.is_admin;
  if (v === true || v === 1) return true;
  if (Buffer.isBuffer(v)) return v[0] === 1;
  if (v === false || v === 0) return false;
  return row.role === "admin";
}

function tokenPayloadFromUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    is_admin: normalizeIsAdmin(user),
  };
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    is_admin: normalizeIsAdmin(user),
  };
}

function requirePool(req, res, next) {
  if (!pool) {
    return res.status(503).json({ error: "Database unavailable" });
  }
  next();
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    },
  );
};

const requireAdmin = (req, res, next) => {
  const admin =
    req.user.is_admin === true ||
    req.user.is_admin === 1 ||
    req.user.role === "admin";
  if (!admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

app.get("/api/status", (req, res) => {
  res.json({
    status: "Online",
    message: "Whisk-It API is kneading dough!",
    timestamp: new Date(),
    database: pool ? "connected" : "disconnected",
  });
});

app.post("/api/auth/login", requirePool, async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE username = @username");

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      tokenPayloadFromUser(user),
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/register", requirePool, async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = req.body.password;
    if (username.length < 2 || username.length > 50) {
      return res
        .status(400)
        .json({ error: "Username must be 2–50 characters" });
    }
    if (!password || String(password).length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password_hash", sql.NVarChar, password_hash).query(`
                INSERT INTO Users (username, password_hash, role, is_admin)
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.role, INSERTED.is_admin
                VALUES (@username, @password_hash, N'staff', 0)
            `);

    const row = result.recordset[0];
    const user = { ...row, is_admin: normalizeIsAdmin(row) };
    const token = jwt.sign(
      tokenPayloadFromUser(user),
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "8h" },
    );

    res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    const num = error.number ?? error.originalError?.number;
    if (num === 2627) {
      return res.status(409).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get(
  "/api/admin/users",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool
        .request()
        .query(
          "SELECT id, username, role, is_admin FROM Users ORDER BY username",
        );
      res.json(
        result.recordset.map((row) => ({
          id: row.id,
          username: row.username,
          role: row.role,
          is_admin: normalizeIsAdmin(row),
        })),
      );
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ error: "Failed to list users" });
    }
  },
);

app.patch(
  "/api/admin/users/:id",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid user id" });
      }
      const { is_admin: nextAdmin } = req.body;
      if (typeof nextAdmin !== "boolean") {
        return res
          .status(400)
          .json({ error: "Body must include is_admin (boolean)" });
      }

      const current = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT id, username, role, is_admin FROM Users WHERE id = @id");

      if (current.recordset.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const before = current.recordset[0];
      if (nextAdmin === false && normalizeIsAdmin(before)) {
        const others = await pool
          .request()
          .input("id", sql.Int, id)
          .query(
            "SELECT COUNT(*) AS n FROM Users WHERE is_admin = 1 AND id <> @id",
          );
        if ((others.recordset[0]?.n ?? 0) < 1) {
          return res
            .status(400)
            .json({ error: "Cannot remove the last admin" });
        }
      }

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("is_admin", sql.Bit, nextAdmin ? 1 : 0)
        .query("UPDATE Users SET is_admin = @is_admin WHERE id = @id");

      const after = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT id, username, role, is_admin FROM Users WHERE id = @id");

      const u = after.recordset[0];
      const user = publicUser(u);
      const out = { user };
      if (Number(req.user.id) === id) {
        out.token = jwt.sign(
          tokenPayloadFromUser(u),
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "8h" },
        );
      }
      res.json(out);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  },
);

app.get("/api/items", requirePool, async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM Items WHERE active = 1");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.get(
  "/api/admin/items",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool
        .request()
        .query("SELECT * FROM Items ORDER BY category, name");
      res.json(result.recordset);
    } catch (error) {
      console.error("Error fetching admin items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  },
);

app.post(
  "/api/items",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { name, price, category, stock_quantity } = req.body;
      const result = await pool
        .request()
        .input("name", sql.NVarChar, name)
        .input("price", sql.Decimal(10, 2), price)
        .input("category", sql.NVarChar, category)
        .input("stock_quantity", sql.Int, stock_quantity || 0).query(`
                INSERT INTO Items (name, price, category, stock_quantity, active)
                OUTPUT INSERTED.*
                VALUES (@name, @price, @category, @stock_quantity, 1)
            `);
      res.status(201).json(result.recordset[0]);
    } catch (error) {
      console.error("Error adding item:", error);
      res.status(500).json({ error: "Failed to add item" });
    }
  },
);

app.put(
  "/api/items/:id",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, category, stock_quantity, active } = req.body;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("name", sql.NVarChar, name)
        .input("price", sql.Decimal(10, 2), price)
        .input("category", sql.NVarChar, category)
        .input("stock_quantity", sql.Int, stock_quantity)
        .input("active", sql.Bit, active ? 1 : 0).query(`
                UPDATE Items
                SET name = @name, price = @price, category = @category,
                    stock_quantity = @stock_quantity, active = @active
                OUTPUT INSERTED.*
                WHERE id = @id
            `);
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(result.recordset[0]);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  },
);

app.delete(
  "/api/items/:id",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("UPDATE Items SET active = 0 WHERE id = @id");
      res.json({ message: "Item deactivated" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  },
);

app.post("/api/orders", requirePool, async (req, res) => {
  try {
    const { items, total_amount } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must include items" });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const orderResult = await transaction
        .request()
        .input("total_amount", sql.Decimal(10, 2), total_amount)
        .input("status", sql.NVarChar, "pending").query(`
                    INSERT INTO Orders (total_amount, status, created_at)
                    OUTPUT INSERTED.id
                    VALUES (@total_amount, @status, SYSUTCDATETIME())
                `);

      const orderId = orderResult.recordset[0].id;

      for (const item of items) {
        await transaction
          .request()
          .input("order_id", sql.Int, orderId)
          .input("item_id", sql.Int, item.id)
          .input("quantity", sql.Int, item.quantity)
          .input("price", sql.Decimal(10, 2), item.price).query(`
                        INSERT INTO OrderItems (order_id, item_id, quantity, price)
                        VALUES (@order_id, @item_id, @quantity, @price)
                    `);

        await transaction
          .request()
          .input("item_id", sql.Int, item.id)
          .input("quantity", sql.Int, item.quantity).query(`
                        UPDATE Items
                        SET stock_quantity = stock_quantity - @quantity
                        WHERE id = @item_id
                    `);
      }

      await transaction.commit();
      res.status(201).json({ orderId, message: "Order created successfully" });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.get(
  "/api/orders/pending",
  requirePool,
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.request().query(`
            SELECT o.id, o.total_amount, o.status, o.created_at,
                   oi.quantity, oi.price, i.name AS item_name
            FROM Orders o
            JOIN OrderItems oi ON o.id = oi.order_id
            JOIN Items i ON oi.item_id = i.id
            WHERE o.status = N'pending'
            ORDER BY o.created_at ASC
        `);

      const map = new Map();
      for (const row of result.recordset) {
        if (!map.has(row.id)) {
          map.set(row.id, {
            id: row.id,
            total_amount: row.total_amount,
            status: row.status,
            created_at: row.created_at,
            items: [],
          });
        }
        map.get(row.id).items.push({
          name: row.item_name,
          quantity: row.quantity,
          price: row.price,
        });
      }
      res.json([...map.values()]);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  },
);

app.put(
  "/api/orders/:id/complete",
  requirePool,
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("UPDATE Orders SET status = N'completed' WHERE id = @id");
      res.json({ message: "Order completed" });
    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({ error: "Failed to complete order" });
    }
  },
);

app.get(
  "/api/admin/orders",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const request = pool.request();
      let query = `
            SELECT id, total_amount, status, created_at
            FROM Orders
            WHERE 1 = 1
        `;

      if (start_date && end_date) {
        request.input(
          "start",
          sql.DateTime2,
          new Date(`${start_date}T00:00:00`),
        );
        request.input(
          "end",
          sql.DateTime2,
          new Date(`${end_date}T23:59:59.999`),
        );
        query += " AND created_at BETWEEN @start AND @end ";
      }

      query += " ORDER BY created_at DESC";

      const result = await request.query(query);
      res.json(result.recordset);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  },
);

app.get(
  "/api/reports/sales",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const request = pool.request();
      let query = `
            SELECT
                CONVERT(date, created_at) AS date,
                COUNT(*) AS order_count,
                SUM(total_amount) AS total_revenue
            FROM Orders
            WHERE status = N'completed'
        `;

      if (start_date && end_date) {
        request.input(
          "start",
          sql.DateTime2,
          new Date(`${start_date}T00:00:00`),
        );
        request.input(
          "end",
          sql.DateTime2,
          new Date(`${end_date}T23:59:59.999`),
        );
        query += " AND created_at BETWEEN @start AND @end ";
      }

      query += " GROUP BY CONVERT(date, created_at) ORDER BY date DESC";

      const result = await request.query(query);
      res.json(result.recordset);
    } catch (error) {
      console.error("Error fetching sales report:", error);
      res.status(500).json({ error: "Failed to fetch sales report" });
    }
  },
);

app.get(
  "/api/reports/top-products",
  requirePool,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const request = pool.request();
      let dateFilter = "";
      if (start_date && end_date) {
        request.input(
          "start",
          sql.DateTime2,
          new Date(`${start_date}T00:00:00`),
        );
        request.input(
          "end",
          sql.DateTime2,
          new Date(`${end_date}T23:59:59.999`),
        );
        dateFilter = " AND o.created_at BETWEEN @start AND @end ";
      }

      const result = await request.query(`
            SELECT TOP 5
                i.name,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.quantity * oi.price) AS total_revenue
            FROM OrderItems oi
            JOIN Items i ON oi.item_id = i.id
            JOIN Orders o ON oi.order_id = o.id
            WHERE o.status = N'completed'
            ${dateFilter}
            GROUP BY i.name
            ORDER BY total_quantity DESC
        `);
      res.json(result.recordset);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ error: "Failed to fetch top products" });
    }
  },
);

function startupDbSummary() {
  if (!dbConnection) {
    return { database: "(not configured)", target: "(not configured)" };
  }
  if (dbConnection.kind === "connectionString") {
    return {
      database: "(set in connection string)",
      target: "DB_CONNECTION_STRING",
    };
  }
  const c = dbConnection.value;
  const inst = c.options?.instanceName;
  return {
    database: c.database || "(unknown)",
    target: inst ? `${c.server}\\${inst}` : String(c.server),
  };
}

app.listen(PORT, () => {
  const { database, target } = startupDbSummary();
  console.log(`
    Whisk-It Server Running
    -------------------------------
    URL: http://localhost:${PORT}
    Database: ${database}
    Server / connection: ${target}
    Mode: ${process.env.NODE_ENV || "development"}
    `);
});
