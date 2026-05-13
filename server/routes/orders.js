router.post('/', async (req, res) => {
  try {
    const { customerName, items, deliveryType } = req.body;
    const orderRef = await db.collection('orders').add({
      customerName,
      items,
      deliveryType,
      storeLocation: req.user.storeLocation, // auto-set from logged-in user
      createdBy: req.user.uid,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: orderRef.id, message: 'Order created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});