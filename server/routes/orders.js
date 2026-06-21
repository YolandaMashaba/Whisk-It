const express = require('express');
const router = express.Router();
const { db } = require('../server-configuration');

const VALID_STATUSES = ['pending', 'confirmed', 'in-progress', 'ready', 'delivered', 'cancelled'];

// POST /api/orders — create a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, items, deliveryType } = req.body;

    if (!customerName || !items || !deliveryType) {
      return res.status(400).json({ error: 'customerName, items and deliveryType are required' });
    }

    const orderRef = await db.collection('orders').add({
      customerName,
      items,
      deliveryType,
      storeLocation: req.user.storeLocation,
      createdBy: req.user.uid,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ id: orderRef.id, message: 'Order created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — get all orders, optionally filter by store
router.get('/', async (req, res) => {
  try {
    const { store, status } = req.query;
    let query = db.collection('orders').orderBy('createdAt', 'desc');

    if (store) query = query.where('storeLocation', '==', store);
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — get a single order
router.get('/:id', async (req, res) => {
  try {
    const orderSnap = await db.collection('orders').doc(req.params.id).get();

    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ id: orderSnap.id, ...orderSnap.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status — update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const orderRef = db.collection('orders').doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = orderSnap.data();

    if (['cancelled', 'delivered'].includes(currentOrder.status)) {
      return res.status(400).json({
        error: `Cannot update an order that is already ${currentOrder.status}`
      });
    }

    await orderRef.update({
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid,
    });

    res.json({
      id,
      previousStatus: currentOrder.status,
      newStatus: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id — cancel an order
router.delete('/:id', async (req, res) => {
  try {
    const orderRef = db.collection('orders').doc(req.params.id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await orderRef.update({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      cancelledBy: req.user.uid,
    });

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;