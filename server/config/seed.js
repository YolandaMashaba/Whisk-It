require('dotenv').config({ path: '../.env' });
const admin = require('firebase-admin');

// Initialise Firebase

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

// Seed data

const users = [
  {
    id: 'user_sifiso',
    data: {
      displayName:   'Sifiso Zwane',
      email:         'sifiso@sixcoach.co.za',
      role:          'admin',
      storeLocation: 'roodepoort',
      createdAt:     new Date().toISOString(),
    },
  },
  {
    id: 'user_nkoka',
    data: {
      displayName:   'Nkoka Mashaba',
      email:         'nkoka@sixcoach.co.za',
      role:          'staff',
      storeLocation: 'roodepoort',
      createdAt:     new Date().toISOString(),
    },
  },
  {
    id: 'user_mhlengi',
    data: {
      displayName:   'Mhlengi Ndovela',
      email:         'mhlengi@sixcoach.co.za',
      role:          'staff',
      storeLocation: 'flora',
      createdAt:     new Date().toISOString(),
    },
  },
  {
    id: 'user_cashier_flora',
    data: {
      displayName:   'Flora Cashier',
      email:         'cashier.flora@sixcoach.co.za',
      role:          'cashier',
      storeLocation: 'flora',
      createdAt:     new Date().toISOString(),
    },
  },
];

const products = [
  {
    id: 'prod_choc_cake',
    data: {
      name:      'Chocolate Layer Cake',
      category:  'cake',
      price:     350.00,
      imageUrl:  '',
      available: true,
    },
  },
  {
    id: 'prod_vanilla_cake',
    data: {
      name:      'Vanilla Sponge Cake',
      category:  'cake',
      price:     280.00,
      imageUrl:  '',
      available: true,
    },
  },
  {
    id: 'prod_red_velvet',
    data: {
      name:      'Red Velvet Cake',
      category:  'cake',
      price:     380.00,
      imageUrl:  '',
      available: true,
    },
  },
  {
    id: 'prod_cupcake_dozen',
    data: {
      name:      'Cupcakes (Dozen)',
      category:  'cupcake',
      price:     180.00,
      imageUrl:  '',
      available: true,
    },
  },
  {
    id: 'prod_carrot_cake',
    data: {
      name:      'Carrot Cake',
      category:  'cake',
      price:     300.00,
      imageUrl:  '',
      available: false,
    },
  },
];

const inventory = [
  // Roodepoort main bakery ingredients
  {
    id: 'inv_flour_rdp',
    data: {
      ingredientName:    'Cake Flour',
      quantity:          50,
      unit:              'kg',
      storeLocation:     'roodepoort',
      lowStockThreshold: 10,
      lastUpdated:       new Date().toISOString(),
    },
  },
  {
    id: 'inv_sugar_rdp',
    data: {
      ingredientName:    'White Sugar',
      quantity:          30,
      unit:              'kg',
      storeLocation:     'roodepoort',
      lowStockThreshold: 8,
      lastUpdated:       new Date().toISOString(),
    },
  },
  {
    id: 'inv_butter_rdp',
    data: {
      ingredientName:    'Butter',
      quantity:          20,
      unit:              'kg',
      storeLocation:     'roodepoort',
      lowStockThreshold: 5,
      lastUpdated:       new Date().toISOString(),
    },
  },
  {
    id: 'inv_eggs_rdp',
    data: {
      ingredientName:    'Eggs',
      quantity:          8,
      unit:              'trays',
      storeLocation:     'roodepoort',
      lowStockThreshold: 3,
      lastUpdated:       new Date().toISOString(),
    },
  },

  {
    id: 'inv_cocoa_rdp',
    data: {
      ingredientName:    'Cocoa Powder',
      quantity:          4,
      unit:              'kg',
      storeLocation:     'roodepoort',
      lowStockThreshold: 5,  // below threshold — triggers LOW_STOCK alert
      lastUpdated:       new Date().toISOString(),
    },

  },
  // Flora Centre finished cake stock
  {
    id: 'inv_choc_flora',
    data: {
      ingredientName:    'Chocolate Layer Cake (stock)',
      quantity:          6,
      unit:              'units',
      storeLocation:     'flora',
      lowStockThreshold: 3,
      lastUpdated:       new Date().toISOString(),
    },
  },
  {
    id: 'inv_vanilla_flora',
    data: {
      ingredientName:    'Vanilla Sponge Cake (stock)',
      quantity:          2,
      unit:              'units',
      storeLocation:     'flora',
      lowStockThreshold: 3,  // below threshold
      lastUpdated:       new Date().toISOString(),
    },
  },
];

const orders = [
  {
    id: 'order_001',
    data: {
      customerName:  'Thabo Mokoena',
      items:         [{ productId: 'prod_choc_cake', quantity: 1, unitPrice: 350 }],
      deliveryType:  'delivery',
      storeLocation: 'flora',
      createdBy:     'user_mhlengi',
      status:        'pending',
      totalAmount:   350.00,
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    },
  },
  {
    id: 'order_002',
    data: {
      customerName:  'Zanele Dlamini',
      items:         [{ productId: 'prod_red_velvet', quantity: 1, unitPrice: 380 }],
      deliveryType:  'pickup',
      storeLocation: 'roodepoort',
      createdBy:     'user_nkoka',
      status:        'confirmed',
      totalAmount:   380.00,
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    },
  },
  {
    id: 'order_003',
    data: {
      customerName:  'Sipho Nkosi',
      items:         [
        { productId: 'prod_cupcake_dozen', quantity: 2, unitPrice: 180 },
        { productId: 'prod_vanilla_cake',  quantity: 1, unitPrice: 280 },
      ],
      deliveryType:  'delivery',
      storeLocation: 'flora',
      createdBy:     'user_mhlengi',
      status:        'in-progress',
      totalAmount:   640.00,
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    },
  },
];

const sales = [
  {
    id: 'sale_001',
    data: {
      items:         [{ productId: 'prod_choc_cake', quantity: 1, unitPrice: 350 }],
      totalAmount:   350.00,
      paymentMethod: 'cash',
      storeLocation: 'roodepoort',
      processedBy:   'user_nkoka',
      createdAt:     new Date().toISOString(),
    },
  },
  {
    id: 'sale_002',
    data: {
      items:         [{ productId: 'prod_cupcake_dozen', quantity: 1, unitPrice: 180 }],
      totalAmount:   180.00,
      paymentMethod: 'card',
      storeLocation: 'flora',
      processedBy:   'user_cashier_flora',
      createdAt:     new Date().toISOString(),
    },
  },
];

// Seeding functions

async function seedCollection(collectionName, items) {
  console.log(`\n⏳  Seeding ${collectionName}...`);
  const batch = db.batch();

  items.forEach(({ id, data }) => {
    const ref = db.collection(collectionName).doc(id);
    batch.set(ref, data, { merge: true });
  });

  await batch.commit();
  console.log(`✅  ${collectionName} — ${items.length} document(s) written`);
}

async function seedAll() {
  console.log('🌱  Starting Six Coach Confectionery database seed...\n');

  try {
    await seedCollection('users',     users);
    await seedCollection('products',  products);
    await seedCollection('inventory', inventory);
    await seedCollection('orders',    orders);
    await seedCollection('sales',     sales);

    console.log('\n🎉  Database seeded successfully!');
    console.log('    Collections created: users, products, inventory, orders, sales');
    console.log('    You can now test your API endpoints with real data.\n');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
  } finally {
    process.exit(0);
  }
}

seedAll();