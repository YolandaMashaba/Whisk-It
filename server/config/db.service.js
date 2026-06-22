/**
 * Six Coach Confectionery
 * Database Service Layer
 *
 * All direct Firestore interactions live here.
 * Route files call these functions instead of touching db directly.
 * This makes testing and future database migrations much easier.
 */

const { db } = require('../server-configuration');
const {
  COLLECTIONS,
  LOW_STOCK_THRESHOLD,
  ORDER_STATUSES,
} = require('../config/firestore.config');

// ─── USERS ───────────────────────────────────────────────────────────────────

const UserService = {
  async findById(uid) {
    const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },

  async create(uid, userData) {
    await db.collection(COLLECTIONS.USERS).doc(uid).set({
      ...userData,
      createdAt: new Date().toISOString(),
    });
    return { id: uid, ...userData };
  },

  async findAll() {
    const snap = await db.collection(COLLECTIONS.USERS).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

const ProductService = {
  async findAll({ category, available } = {}) {
    let query = db.collection(COLLECTIONS.PRODUCTS);
    if (category)             query = query.where('category',  '==', category);
    if (available !== undefined) query = query.where('available', '==', available);
    const snap = await query.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async findById(id) {
    const snap = await db.collection(COLLECTIONS.PRODUCTS).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },

  async create(data) {
    const ref = await db.collection(COLLECTIONS.PRODUCTS).add(data);
    return { id: ref.id, ...data };
  },

  async update(id, data) {
    await db.collection(COLLECTIONS.PRODUCTS).doc(id).update(data);
    return { id, ...data };
  },
};

// ORDERS

const OrderService = {
  async findAll({ store, status } = {}) {
    let query = db.collection(COLLECTIONS.ORDERS).orderBy('createdAt', 'desc');
    if (store)  query = query.where('storeLocation', '==', store);
    if (status) query = query.where('status',        '==', status);
    const snap = await query.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async findById(id) {
    const snap = await db.collection(COLLECTIONS.ORDERS).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },

  async create(orderData) {
    const ref = await db.collection(COLLECTIONS.ORDERS).add({
      ...orderData,
      status:    ORDER_STATUSES.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id: ref.id, ...orderData };
  },

  async updateStatus(id, status, updatedBy) {
    await db.collection(COLLECTIONS.ORDERS).doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
      updatedBy,
    });
  },

  async cancel(id, cancelledBy) {
    await db.collection(COLLECTIONS.ORDERS).doc(id).update({
      status:      ORDER_STATUSES.CANCELLED,
      updatedAt:   new Date().toISOString(),
      cancelledBy,
    });
  },
};

// ─── INVENTORY ───────────────────────────────────────────────────────────────

const InventoryService = {
  async findAll({ store } = {}) {
    let query = db.collection(COLLECTIONS.INVENTORY);
    if (store) query = query.where('storeLocation', '==', store);
    const snap = await query.get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Automatically flag low stock
    const lowStockItems = items.filter(
      item => item.quantity <= (item.lowStockThreshold || LOW_STOCK_THRESHOLD)
    );

    return { items, lowStockCount: lowStockItems.length, lowStockItems };
  },

  async findById(id) {
    const snap = await db.collection(COLLECTIONS.INVENTORY).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },

  async create(data, createdBy) {
    const ref = await db.collection(COLLECTIONS.INVENTORY).add({
      ...data,
      lowStockThreshold: data.lowStockThreshold || LOW_STOCK_THRESHOLD,
      lastUpdated:       new Date().toISOString(),
      createdBy,
    });
    return { id: ref.id, ...data };
  },

  async updateQuantity(id, quantity, updatedBy) {
    const itemRef = db.collection(COLLECTIONS.INVENTORY).doc(id);
    const snap    = await itemRef.get();
    if (!snap.exists) return null;

    await itemRef.update({
      quantity,
      lastUpdated: new Date().toISOString(),
      updatedBy,
    });

    const item       = snap.data();
    const isLowStock = quantity <= (item.lowStockThreshold || LOW_STOCK_THRESHOLD);

    return {
      id,
      item:        item.ingredientName,
      quantity,
      unit:        item.unit,
      isLowStock,
      ...(isLowStock && {
        alert:   'LOW_STOCK',
        message: `${item.ingredientName} is running low — only ${quantity} ${item.unit} remaining`,
      }),
    };
  },

  async delete(id) {
    await db.collection(COLLECTIONS.INVENTORY).doc(id).delete();
  },
};

// ─── SALES ───────────────────────────────────────────────────────────────────

const SalesService = {
  async findAll({ store } = {}) {
    let query = db.collection(COLLECTIONS.SALES).orderBy('createdAt', 'desc');
    if (store) query = query.where('storeLocation', '==', store);
    const snap = await query.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async create(saleData) {
    const ref = await db.collection(COLLECTIONS.SALES).add({
      ...saleData,
      createdAt: new Date().toISOString(),
    });
    return { id: ref.id, ...saleData };
  },

  async getRevenueSummary() {
    const snap  = await db.collection(COLLECTIONS.SALES).get();
    const sales = snap.docs.map(d => d.data());

    // Aggregate per store
    const summary = sales.reduce((acc, sale) => {
      const store = sale.storeLocation;
      if (!acc[store]) {
        acc[store] = { totalSales: 0, totalRevenue: 0, byPaymentMethod: {} };
      }
      acc[store].totalSales   += 1;
      acc[store].totalRevenue += sale.totalAmount;

      // Break down by payment method
      const method = sale.paymentMethod;
      if (!acc[store].byPaymentMethod[method]) {
        acc[store].byPaymentMethod[method] = 0;
      }
      acc[store].byPaymentMethod[method] += sale.totalAmount;

      return acc;
    }, {});

    const grandTotal = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    return { summary, grandTotal, totalTransactions: sales.length };
  },
};

module.exports = {
  UserService,
  ProductService,
  OrderService,
  InventoryService,
  SalesService,
};