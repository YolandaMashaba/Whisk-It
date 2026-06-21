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

const express = require('express');
const router = express.Router();
const { db } = require('../server-configuration');

const LOW_STOCK_THRESHOLD = 10;

// GET /api/inventory — get all inventory items
router.get('/', async (req, res) => {
  try {
    const { store } = req.query;
    let query = db.collection('inventory');

    if (store) query = query.where('storeLocation', '==', store);

    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Flag low stock items
    const lowStock = items.filter(i => i.quantity <= i.lowStockThreshold);

    res.json({ count: items.length, items, lowStockAlerts: lowStock.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory — add a new ingredient
router.post('/', async (req, res) => {
  try {
    const { ingredientName, quantity, unit, storeLocation, lowStockThreshold } = req.body;

    if (!ingredientName || quantity === undefined || !unit || !storeLocation) {
      return res.status(400).json({ error: 'ingredientName, quantity, unit and storeLocation are required' });
    }

    const itemRef = await db.collection('inventory').add({
      ingredientName,
      quantity,
      unit,
      storeLocation,
      lowStockThreshold: lowStockThreshold || LOW_STOCK_THRESHOLD,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user.uid,
    });

    res.status(201).json({ id: itemRef.id, message: 'Inventory item added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/inventory/:id — update stock level
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'A valid quantity is required' });
    }

    const itemRef = db.collection('inventory').doc(req.params.id);
    const itemSnap = await itemRef.get();

    if (!itemSnap.exists) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await itemRef.update({
      quantity,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user.uid,
    });

    const item = itemSnap.data();
    const isLowStock = quantity <= (item.lowStockThreshold || LOW_STOCK_THRESHOLD);

    res.json({
      updated: true,
      item: item.ingredientName,
      quantity,
      ...(isLowStock && {
        alert: 'LOW_STOCK',
        message: `${item.ingredientName} is running low at ${quantity} ${item.unit}`
      }),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id — remove an ingredient
router.delete('/:id', async (req, res) => {
  try {
    const itemSnap = await db.collection('inventory').doc(req.params.id).get();

    if (!itemSnap.exists) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await db.collection('inventory').doc(req.params.id).delete();
    res.json({ message: 'Inventory item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;