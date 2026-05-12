const { app } = require('./server-configuration');
const ordersRouter = require('./routes/orders');
const inventoryRouter = require('./routes/inventory');
const posRouter = require('./routes/pos');

app.use('/api/orders', ordersRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/pos', posRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Six Coach server running on port ${PORT}`));