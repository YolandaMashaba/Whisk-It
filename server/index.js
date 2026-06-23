require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { FileStore } = require("./db/store");

const app = express();
const PORT = process.env.PORT || 5001;
const storageFile = process.env.DB_STORAGE_FILE || path.join(__dirname, "db", "storage.json");
const store = new FileStore(storageFile);

function normalizeIsAdmin(user) {
  if (!user) return false;
  const v = user.is_admin;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  return user.role === "admin";
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

function requireStore(req, res, next) {
  if (!store.initialized) {
    return res.status(503).json({ error: "Storage unavailable" });
  }
  next();
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

async function startStore() {
  try {
    await store.init();
    console.log(`Connected to JSON storage (${storageFile})`);
  } catch (error) {
    console.error("Storage initialization failed:", error);
  }
}

startStore();

app.get("/api/status", (req, res) => {
  res.json({
    status: "Online",
    message: "Whisk-It API is kneading dough!",
    timestamp: new Date(),
    database: store.initialized ? "connected" : "disconnected",
  });
});

app.post("/api/auth/login", requireStore, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = store.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(tokenPayloadFromUser(user), process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "8h",
    });

    res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/register", requireStore, async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = req.body.password;
    if (username.length < 2 || username.length > 50) {
      return res.status(400).json({ error: "Username must be 2–50 characters" });
    }
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (store.getUserByUsername(username)) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const users = store.getUsers();
    const isFirstUser = users.length === 0;
    const role = isFirstUser ? "admin" : "staff";
    const is_admin = isFirstUser;

    const row = await store.addUser({
      username,
      password_hash,
      role,
      is_admin,
    });

    const token = jwt.sign(tokenPayloadFromUser(row), process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "8h",
    });

    res.status(201).json({ token, user: publicUser(row) });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get("/api/admin/users", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = store.getUsers();
    res.json(
      users.map((row) => ({
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
});

app.patch("/api/admin/users/:id", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const { is_admin: nextAdmin } = req.body;
    if (typeof nextAdmin !== "boolean") {
      return res.status(400).json({ error: "Body must include is_admin (boolean)" });
    }

    const current = store.getUserById(id);
    if (!current) {
      return res.status(404).json({ error: "User not found" });
    }

    if (nextAdmin === false && normalizeIsAdmin(current)) {
      const others = store.getUsers().filter((user) => user.id !== id && normalizeIsAdmin(user));
      if (others.length < 1) {
        return res.status(400).json({ error: "Cannot remove the last admin" });
      }
    }

    const updated = await store.updateUser(id, { is_admin: nextAdmin });
    const out = { user: publicUser(updated) };
    if (Number(req.user.id) === id) {
      out.token = jwt.sign(tokenPayloadFromUser(updated), process.env.JWT_SECRET || "your-secret-key", {
        expiresIn: "8h",
      });
    }
    res.json(out);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.get("/api/items", requireStore, async (req, res) => {
  try {
    res.json(store.getItems(true));
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.get("/api/admin/items", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json(store.getItems(false));
  } catch (error) {
    console.error("Error fetching admin items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.post("/api/items", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, stock_quantity } = req.body;
    const item = await store.addItem({ name, price, category, stock_quantity });
    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

app.put("/api/items/:id", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid item id" });
    }

    const { name, price, category, stock_quantity, active } = req.body;
    const item = await store.updateItem(id, {
      name,
      price,
      category,
      stock_quantity,
      active,
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

app.delete("/api/items/:id", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid item id" });
    }

    const item = await store.deactivateItem(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deactivated" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.post("/api/orders", requireStore, async (req, res) => {
  try {
    const { items, total_amount } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must include items" });
    }

    const orderId = await store.createOrder(items, total_amount);
    res.status(201).json({ orderId, message: "Order created successfully" });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.get("/api/orders/pending", requireStore, authenticateToken, async (req, res) => {
  try {
    res.json(store.getPendingOrders());
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.put("/api/orders/:id/complete", requireStore, authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const order = await store.completeOrder(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order completed" });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ error: "Failed to complete order" });
  }
});

app.get("/api/admin/orders", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = store.getOrders({
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/api/reports/sales", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = store.getSalesReport({
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    });
    res.json(report);
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
});

app.get("/api/reports/top-products", requireStore, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = store.getTopProducts({
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    });
    res.json(report);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

function startupDbSummary() {
  return {
    database: "Local JSON storage",
    target: storageFile,
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
