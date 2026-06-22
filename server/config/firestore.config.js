const COLLECTIONS = {
  USERS:      'users',
  ORDERS:     'orders',
  ORDER_ITEMS:'orderItems',
  PRODUCTS:   'products',
  INVENTORY:  'inventory',
  SALES:      'sales',
  SALE_ITEMS: 'saleItems',
};

const STORE_LOCATIONS = {
  ROODEPOORT: 'roodepoort',
  FLORA:      'flora',
};

const USER_ROLES = {
  ADMIN:    'admin',
  STAFF:    'staff',
  CASHIER:  'cashier',
};

const ORDER_STATUSES = {
  PENDING:     'pending',
  CONFIRMED:   'confirmed',
  IN_PROGRESS: 'in-progress',
  READY:       'ready',
  DELIVERED:   'delivered',
  CANCELLED:   'cancelled',
};

const DELIVERY_TYPES = {
  DELIVERY: 'delivery',
  PICKUP:   'pickup',
};

const PAYMENT_METHODS = {
  CASH:   'cash',
  CARD:   'card',
  EFT:    'eft',
};

const PRODUCT_CATEGORIES = {
  CAKE:      'cake',
  CUPCAKE:   'cupcake',
  MUFFIN:    'muffin',
  PASTRY:    'pastry',
  BREAD:     'bread',
  OTHER:     'other',
};

const LOW_STOCK_THRESHOLD = 10;

module.exports = {
  COLLECTIONS,
  STORE_LOCATIONS,
  USER_ROLES,
  ORDER_STATUSES,
  DELIVERY_TYPES,
  PAYMENT_METHODS,
  PRODUCT_CATEGORIES,
  LOW_STOCK_THRESHOLD,
};