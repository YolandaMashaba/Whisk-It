const express = require('express');
const router = express.Router();
const { db } = require('../server-configuration');

// POST /api/pos/sale — record a sale
router.post('/sale', async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;

    if (!items || !totalAmount || !paymentMethod) {
      return res.status(400).json({ error: 'items, totalAmount and paymentMethod are required' });
    }

    const saleRef = await db.collection('sales').add({
      items,
      totalAmount,
      paymentMethod,
      storeLocation: req.user.storeLocation,
      processedBy: req.user.uid,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ id: saleRef.id, message: 'Sale recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pos/sales — get all sales
router.get('/sales', async (req, res) => {
  try {
    const { store } = req.query;
    let query = db.collection('sales').orderBy('createdAt', 'desc');

    if (store) query = query.where('storeLocation', '==', store);

    const snapshot = await query.get();
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ count: sales.length, sales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pos/summary — revenue summary per store
router.get('/summary', async (req, res) => {
  try {
    const snapshot = await db.collection('sales').get();
    const sales = snapshot.docs.map(doc => doc.data());

    const summary = sales.reduce((acc, sale) => {
      const store = sale.storeLocation;
      if (!acc[store]) acc[store] = { totalSales: 0, totalRevenue: 0 };
      acc[store].totalSales += 1;
      acc[store].totalRevenue += sale.totalAmount;
      return acc;
    }, {});

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;