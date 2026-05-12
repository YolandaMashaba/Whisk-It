require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Database Configuration ---
const dbConfig = {
    server: 'DESKTOP-0P2GD71\\ssadmin',
    database: 'WhickitDB',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    }
};

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
let pool;
async function connectDB() {
    try {
        pool = await sql.connect(dbConfig);
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}
connectDB();

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// --- Routes ---

// Health Check
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Online',
        message: 'Whisk-It API is kneading dough!',
        timestamp: new Date()
    });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '8h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get all bakery items
app.get('/api/items', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Items WHERE active = 1');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Add new item (Admin only)
app.post('/api/items', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, price, category, stock_quantity } = req.body;
        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('price', sql.Decimal(10,2), price)
            .input('category', sql.VarChar, category)
            .input('stock_quantity', sql.Int, stock_quantity || 0)
            .query(`
                INSERT INTO Items (name, price, category, stock_quantity, active)
                OUTPUT INSERTED.*
                VALUES (@name, @price, @category, @stock_quantity, 1)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Update item (Admin only)
app.put('/api/items/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, stock_quantity, active } = req.body;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.VarChar, name)
            .input('price', sql.Decimal(10,2), price)
            .input('category', sql.VarChar, category)
            .input('stock_quantity', sql.Int, stock_quantity)
            .input('active', sql.Bit, active)
            .query(`
                UPDATE Items
                SET name = @name, price = @price, category = @category,
                    stock_quantity = @stock_quantity, active = @active
                OUTPUT INSERTED.*
                VALUES (@name, @price, @category, @stock_quantity, 1)
            `);
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item (Admin only)
app.delete('/api/items/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE Items SET active = 0 WHERE id = @id');
        res.json({ message: 'Item deactivated' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Create order
app.post('/api/orders', async (req, res) => {
    try {
        const { items, total_amount } = req.body;

        // Start transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Insert order
            const orderResult = await transaction.request()
                .input('total_amount', sql.Decimal(10,2), total_amount)
                .input('status', sql.VarChar, 'pending')
                .query(`
                    INSERT INTO Orders (total_amount, status, created_at)
                    OUTPUT INSERTED.id
                    VALUES (@total_amount, @status, GETDATE())
                `);

            const orderId = orderResult.recordset[0].id;

            // Insert order items
            for (const item of items) {
                await transaction.request()
                    .input('order_id', sql.Int, orderId)
                    .input('item_id', sql.Int, item.id)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Decimal(10,2), item.price)
                    .query(`
                        INSERT INTO OrderItems (order_id, item_id, quantity, price)
                        VALUES (@order_id, @item_id, @quantity, @price)
                    `);

                // Update stock
                await transaction.request()
                    .input('item_id', sql.Int, item.id)
                    .input('quantity', sql.Int, item.quantity)
                    .query(`
                        UPDATE Items
                        SET stock_quantity = stock_quantity - @quantity
                        WHERE id = @item_id
                    `);
            }

            await transaction.commit();
            res.status(201).json({ orderId, message: 'Order created successfully' });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get pending orders (for KDS)
app.get('/api/orders/pending', authenticateToken, async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT o.*, oi.quantity, oi.price, i.name as item_name
            FROM Orders o
            JOIN OrderItems oi ON o.id = oi.order_id
            JOIN Items i ON oi.item_id = i.id
            WHERE o.status = 'pending'
            ORDER BY o.created_at ASC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Complete order (for KDS)
app.put('/api/orders/:id/complete', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.request()
            .input('id', sql.Int, id)
            .query("UPDATE Orders SET status = 'completed' WHERE id = @id");
        res.json({ message: 'Order completed' });
    } catch (error) {
        console.error('Error completing order:', error);
        res.status(500).json({ error: 'Failed to complete order' });
    }
});

// Get sales history (Admin only)
app.get('/api/reports/sales', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = `
            SELECT
                CONVERT(date, created_at) as date,
                COUNT(*) as order_count,
                SUM(total_amount) as total_revenue
            FROM Orders
            WHERE status = 'completed'
        `;

        if (start_date && end_date) {
            query += ` AND created_at BETWEEN '${start_date}' AND '${end_date}'`;
        }

        query += ' GROUP BY CONVERT(date, created_at) ORDER BY date DESC';

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ error: 'Failed to fetch sales report' });
    }
});

// Get top products (Admin only)
app.get('/api/reports/top-products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT TOP 5
                i.name,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.quantity * oi.price) as total_revenue
            FROM OrderItems oi
            JOIN Items i ON oi.item_id = i.id
            JOIN Orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY i.name
            ORDER BY total_quantity DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ error: 'Failed to fetch top products' });
    }
});

// --- Server Startup ---
app.listen(PORT, () => {
    console.log(`
    🚀 Whisk-It Server Running
    -------------------------------
    URL: http://localhost:${PORT}
    Database: ${dbConfig.database}
    Mode: ${process.env.NODE_ENV || 'development'}
    `);
});