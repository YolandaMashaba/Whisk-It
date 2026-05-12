const express = require('express');
const router = express.Router();
const { db } = require('../server-configuration');

// Create a new order (from Flora or Roodepoort)
router.post('/', async (req, res) => {
  try {
    const { customerName, items, storeLocation, deliveryType } = req.body;
    const orderRef = await db.collection('orders').add({
      customerName,
      items,
      storeLocation,       // 'roodepoort' or 'flora'
      deliveryType,        // 'delivery' or 'pickup'
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: orderRef.id, message: 'Order created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (optionally filter by store)
router.get('/', async (req, res) => {
  try {
    const { store } = req.query;
    let query = db.collection('orders').orderBy('createdAt', 'desc');
    if (store) query = query.where('storeLocation', '==', store);
    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;