const express = require('express');
const router = express.Router();
const { db } = require('../server-configuration');

const LOW_STOCK_THRESHOLD = 10;

// Update stock level for an ingredient
router.put('/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    await db.collection('inventory').doc(req.params.itemId).update({ quantity });

    const alert = quantity < LOW_STOCK_THRESHOLD
      ? { alert: 'LOW_STOCK', item: req.params.itemId }
      : null;

    res.json({ updated: true, ...(alert && { alert }) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('inventory').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;