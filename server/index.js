const { app } = require('./server-configuration');
const authenticate = require('./middleware/auth');
const checkRole = require('./middleware/check-role');

const ordersRouter = require('./routes/orders');
const inventoryRouter = require('./routes/inventory');
const posRouter = require('./routes/pos');

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/orders',
  authenticate,
  checkRole('admin', 'staff'),
  ordersRouter
);

app.use('/api/inventory',
  authenticate,
  checkRole('admin', 'staff'),
  inventoryRouter
);

app.use('/api/pos',
  authenticate,
  checkRole('admin', 'staff', 'cashier'),
  posRouter
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Six Coach server running on port ${PORT}`));