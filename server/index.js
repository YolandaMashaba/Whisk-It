require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests

// --- Mock Data (Temporary) ---
const bakeryItems = [
    { id: 1, name: "Butter Croissant", price: 25.00, category: "Pastry" },
    { id: 2, name: "Sourdough Loaf", price: 45.00, category: "Bread" },
    { id: 3, name: "Chocolate Brownie", price: 30.00, category: "Sweet" }
];

// --- Routes ---

// Health Check
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'Online', 
        message: 'Whisk-It API is kneading dough!',
        timestamp: new Date()
    });
});

// Get all bakery items
app.get('/api/items', (req, res) => {
    res.json(bakeryItems);
});

// --- Server Startup ---
app.listen(PORT, () => {
    console.log(`
    🚀 Whisk-It Server Running
    -------------------------
    URL: http://localhost:${PORT}
    Mode: ${process.env.NODE_ENV}
    `);
});