import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button, Input, Card, Table } from '../../components/Index';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    inStock: true
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData = [
        { id: 1, name: 'Croissant', price: 25.00, category: 'Pastries', stock: 50, description: 'Buttery French croissant', inStock: true },
        { id: 2, name: 'Pumpkin Spice Muffin', price: 35.00, category: 'Seasonal', stock: 20, description: 'Fall seasonal favorite', inStock: true },
        { id: 3, name: 'Sourdough Bread', price: 45.00, category: 'Breads', stock: 0, description: 'Artisan sourdough', inStock: false },
        { id: 4, name: 'Chocolate Chip Cookie', price: 15.00, category: 'Cookies', stock: 100, description: 'Classic chocolate chip', inStock: true },
      ];
      setItems(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      description: '',
      inStock: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      stock: item.stock.toString(),
      description: item.description,
      inStock: item.inStock
    });
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing item
        setItems(prev => prev.map(item => 
          item.id === editingItem 
            ? { ...item, ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) }
            : item
        ));
        setEditingItem(null);
      } else if (isAdding) {
        // Add new item
        const newItem = {
          id: Math.max(...items.map(i => i.id)) + 1,
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        };
        setItems(prev => [...prev, newItem]);
        setIsAdding(false);
      }
      setFormData({
        name: '',
        price: '',
        category: '',
        stock: '',
        description: '',
        inStock: true
      });
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAdding(false);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      description: '',
      inStock: true
    });
  };

  const columns = [
    {
      header: 'Item Name',
      accessor: 'name',
    },
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value) => `R${value.toFixed(2)}`
    },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (value) => (
        <span style={{ 
          color: value === 0 ? '#DC143C' : value < 20 ? '#FF8C00' : '#228B22',
          fontWeight: '600'
        }}>
          {value}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'inStock',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: value ? '#E8F5E8' : '#FFE8E8',
          color: value ? '#228B22' : '#DC143C'
        }}>
          {value ? 'In Stock' : 'Out of Stock'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleEdit(row)}
            disabled={editingItem !== null}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(row.id)}
            disabled={editingItem !== null}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '20px 0 20px 0' }}>
      <Card title="Inventory Control" subtitle="Manage your bakery items">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#8B4513' }}>Menu Items</h2>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={isAdding || editingItem !== null}
          >
            <Plus size={16} />
            Add New Item
          </Button>
        </div>

        {(isAdding || editingItem) && (
          <Card variant="outlined" style={{ marginBottom: '20px', backgroundColor: '#FEFEFE' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#8B4513' }}>
              {isAdding ? 'Add New Item' : 'Edit Item'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <Input
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Price (R)"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Stock Quantity"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              <label style={{ color: '#8B4513', fontWeight: '600' }}>Item is in stock</label>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <Button variant="success" onClick={handleSave}>
                <Save size={16} />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X size={16} />
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <Table
          data={items}
          columns={columns}
          loading={loading}
          emptyMessage="No items in inventory"
        />
      </Card>
    </div>
  );
};

export default Inventory;
