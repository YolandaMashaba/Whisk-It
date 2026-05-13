const fs = require("fs").promises;

class FileStore {
  constructor(filepath) {
    this.filepath = filepath;
    this.data = {
      users: [],
      items: [],
      orders: [],
      orderItems: [],
    };
    this.initialized = false;
    this.queue = Promise.resolve();
  }

  async init() {
    try {
      const fileText = await fs.readFile(this.filepath, "utf8");
      this.data = JSON.parse(fileText);
    } catch (error) {
      if (error.code === "ENOENT") {
        await this.save();
      } else {
        throw error;
      }
    }

    this.ensureDefaults();
    this.initialized = true;
  }

  ensureDefaults() {
    if (!Array.isArray(this.data.users)) this.data.users = [];
    if (!Array.isArray(this.data.items)) this.data.items = [];
    if (!Array.isArray(this.data.orders)) this.data.orders = [];
    if (!Array.isArray(this.data.orderItems)) this.data.orderItems = [];
  }

  async save() {
    await fs.writeFile(
      this.filepath,
      JSON.stringify(this.data, null, 2) + "\n",
      "utf8",
    );
  }

  async withWrite(fn) {
    const next = this.queue.then(() => fn());
    this.queue = next.catch(() => {});
    return next;
  }

  nextId(collectionName) {
    const collection = this.data[collectionName] || [];
    return collection.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  getUserByUsername(username) {
    return this.data.users.find(
      (user) => String(user.username || "").toLowerCase() === String(username || "").toLowerCase(),
    );
  }

  getUserById(id) {
    return this.data.users.find((user) => Number(user.id) === Number(id));
  }

  getUsers() {
    return [...this.data.users];
  }

  async addUser(user) {
    return this.withWrite(async () => {
      const newUser = {
        id: this.nextId("users"),
        username: user.username,
        password_hash: user.password_hash,
        role: user.role,
        is_admin: user.is_admin ? 1 : 0,
      };
      this.data.users.push(newUser);
      await this.save();
      return newUser;
    });
  }

  async updateUser(id, updates) {
    return this.withWrite(async () => {
      const user = this.getUserById(id);
      if (!user) return null;
      if (updates.username !== undefined) user.username = updates.username;
      if (updates.password_hash !== undefined) user.password_hash = updates.password_hash;
      if (updates.role !== undefined) user.role = updates.role;
      if (updates.is_admin !== undefined) user.is_admin = updates.is_admin ? 1 : 0;
      await this.save();
      return user;
    });
  }

  getItems(activeOnly = true) {
    return this.data.items.filter((item) =>
      activeOnly ? item.active === 1 || item.active === true : true,
    );
  }

  getItemById(id) {
    return this.data.items.find((item) => Number(item.id) === Number(id));
  }

  async addItem(item) {
    return this.withWrite(async () => {
      const newItem = {
        id: this.nextId("items"),
        name: item.name,
        price: Number(item.price) || 0,
        category: item.category,
        stock_quantity: Number(item.stock_quantity) || 0,
        active: 1,
      };
      this.data.items.push(newItem);
      await this.save();
      return newItem;
    });
  }

  async updateItem(id, changes) {
    return this.withWrite(async () => {
      const item = this.getItemById(id);
      if (!item) return null;
      if (changes.name !== undefined) item.name = changes.name;
      if (changes.price !== undefined) item.price = Number(changes.price) || 0;
      if (changes.category !== undefined) item.category = changes.category;
      if (changes.stock_quantity !== undefined)
        item.stock_quantity = Number(changes.stock_quantity) || 0;
      if (changes.active !== undefined)
        item.active = changes.active ? 1 : 0;
      await this.save();
      return item;
    });
  }

  async deactivateItem(id) {
    return this.updateItem(id, { active: 0 });
  }

  getOrderById(id) {
    return this.data.orders.find((order) => Number(order.id) === Number(id));
  }

  async createOrder(items, totalAmount) {
    return this.withWrite(async () => {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Order must include items");
      }

      const orderId = this.nextId("orders");
      const order = {
        id: orderId,
        total_amount: Number(totalAmount) || 0,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      this.data.orders.push(order);

      for (const item of items) {
        const existingItem = this.getItemById(item.id);
        if (!existingItem) {
          throw new Error(`Item not found: ${item.id}`);
        }

        const quantity = Number(item.quantity) || 0;
        if (quantity <= 0) {
          throw new Error(`Invalid quantity for item ${item.id}`);
        }

        existingItem.stock_quantity = Number(existingItem.stock_quantity) - quantity;

        this.data.orderItems.push({
          id: this.nextId("orderItems"),
          order_id: orderId,
          item_id: existingItem.id,
          quantity,
          price: Number(item.price) || 0,
        });
      }

      await this.save();
      return orderId;
    });
  }

  getPendingOrders() {
    const pendingOrders = this.data.orders.filter(
      (order) => order.status === "pending",
    );

    return pendingOrders.map((order) => ({
      id: order.id,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      items: this.data.orderItems
        .filter((orderItem) => orderItem.order_id === order.id)
        .map((orderItem) => {
          const item = this.getItemById(orderItem.item_id);
          return {
            name: item?.name || "Unknown",
            quantity: orderItem.quantity,
            price: orderItem.price,
          };
        }),
    }));
  }

  async completeOrder(id) {
    return this.withWrite(async () => {
      const order = this.getOrderById(id);
      if (!order) return null;
      order.status = "completed";
      await this.save();
      return order;
    });
  }

  filterOrdersByDate(orders, startDate, endDate) {
    if (!startDate && !endDate) return orders;

    return orders.filter((order) => {
      const createdAt = new Date(order.created_at);
      if (startDate && createdAt < startDate) return false;
      if (endDate && createdAt > endDate) return false;
      return true;
    });
  }

  parseDate(value, endOfDay = false) {
    if (!value) return null;
    if (value.includes("T")) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
    const date = new Date(`${value}${suffix}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  getOrders({ start_date, end_date } = {}) {
    const startDate = this.parseDate(start_date, false);
    const endDate = this.parseDate(end_date, true);
    const orders = this.filterOrdersByDate(this.data.orders, startDate, endDate);
    return [...orders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }

  getSalesReport({ start_date, end_date } = {}) {
    const startDate = this.parseDate(start_date, false);
    const endDate = this.parseDate(end_date, true);
    const completedOrders = this.data.orders.filter(
      (order) => order.status === "completed",
    );
    const filteredOrders = this.filterOrdersByDate(
      completedOrders,
      startDate,
      endDate,
    );

    const report = new Map();
    for (const order of filteredOrders) {
      const date = order.created_at.slice(0, 10);
      const entry = report.get(date) || {
        date,
        order_count: 0,
        total_revenue: 0,
      };
      entry.order_count += 1;
      entry.total_revenue += Number(order.total_amount) || 0;
      report.set(date, entry);
    }

    return [...report.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  getTopProducts({ start_date, end_date } = {}) {
    const startDate = this.parseDate(start_date, false);
    const endDate = this.parseDate(end_date, true);
    const completedOrders = this.data.orders.filter(
      (order) => order.status === "completed",
    );
    const filteredOrders = this.filterOrdersByDate(
      completedOrders,
      startDate,
      endDate,
    );
    const completedIds = new Set(filteredOrders.map((order) => order.id));

    const totals = new Map();
    for (const orderItem of this.data.orderItems) {
      if (!completedIds.has(orderItem.order_id)) continue;
      const key = Number(orderItem.item_id);
      const current = totals.get(key) || {
        item_id: key,
        total_quantity: 0,
        total_revenue: 0,
      };
      current.total_quantity += Number(orderItem.quantity) || 0;
      current.total_revenue += Number(orderItem.price) * Number(orderItem.quantity) || 0;
      totals.set(key, current);
    }

    const topProducts = [...totals.values()].map((entry) => {
      const item = this.getItemById(entry.item_id);
      return {
        name: item?.name || "Unknown",
        total_quantity: entry.total_quantity,
        total_revenue: entry.total_revenue,
      };
    });

    return topProducts
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5);
  }
}

module.exports = { FileStore };