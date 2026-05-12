const express = require('express');
const router = express.Router();
const { db } = require('../server-configuration');

router.post('/sale', async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, storeLocation } = req.body;
    const saleRef = await db.collection('sales').add({
      items,
      totalAmount,
      paymentMethod,
      storeLocation,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: saleRef.id, message: 'Sale recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;