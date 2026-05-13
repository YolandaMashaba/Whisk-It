import React, { useState, useEffect } from 'react';
import { Settings, Users, Store, Percent, Save, Edit2 } from 'lucide-react';
import { Button, Input, Card, Table } from '@/components/Index';

const SystemConfig = () => {
  const [config, setConfig] = useState({
    bakeryName: 'Whisk-It',
    taxRate: 15,
    currency: 'ZAR',
    businessHours: {
      monday: { open: '06:00', close: '18:00', closed: false },
      tuesday: { open: '06:00', close: '18:00', closed: false },
      wednesday: { open: '06:00', close: '18:00', closed: false },
      thursday: { open: '06:00', close: '18:00', closed: false },
      friday: { open: '06:00', close: '20:00', closed: false },
      saturday: { open: '07:00', close: '20:00', closed: false },
      sunday: { open: '08:00', close: '16:00', closed: true }
    }
  });

  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@whiskit.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Baker John', email: 'john@whiskit.com', role: 'staff', status: 'active' },
    { id: 3, name: 'Cashier Sarah', email: 'sarah@whiskit.com', role: 'staff', status: 'active' },
    { id: 4, name: 'Manager Mike', email: 'mike@whiskit.com', role: 'manager', status: 'inactive' },
  ]);

  const [editingConfig, setEditingConfig] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false); // Added missing loading state

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(false);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setConfig(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: field === 'closed' ? !prev.businessHours[day].closed : value
        }
      }
    }));
  };

  const handleSaveConfig = () => {
    setEditingConfig(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setFormData(user);
  };

  const handleSaveUser = () => {
    setUsers(prev => prev.map(user => 
      user.id === editingUser ? formData : user
    ));
    setEditingUser(null);
    setFormData({});
  };

  const handleCancelUser = () => {
    setEditingUser(null);
    setFormData({});
  };

  const userColumns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (value, row) => editingUser === row.id ? (
        <Input
          name="name"
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          style={{ margin: 0 }}
        />
      ) : value
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (value, row) => editingUser === row.id ? (
        <Input
          name="email"
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          style={{ margin: 0 }}
        />
      ) : value
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value, row) => editingUser === row.id ? (
        <select
          value={formData.role || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          style={{
            padding: '8px 12px',
            border: '2px solid #D2691E',
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
            color: '#8B4513',
            fontSize: '14px'
          }}
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
      ) : (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: value === 'admin' ? '#E8F5E8' : value === 'manager' ? '#FFF8DC' : '#F0F8FF',
          color: value === 'admin' ? '#228B22' : value === 'manager' ? '#D2691E' : '#4169E1'
        }}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: value === 'active' ? '#E8F5E8' : '#FFE8E8',
          color: value === 'active' ? '#228B22' : '#DC143C'
        }}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {editingUser === row.id ? (
            <>
              <Button size="small" variant="success" onClick={handleSaveUser}>
                <Save size={14} />
              </Button>
              <Button size="small" variant="outline" onClick={handleCancelUser}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="small"
              variant="outline"
              onClick={() => handleEditUser(row)}
              disabled={editingUser !== null}
            >
              <Edit2 size={14} />
            </Button>
          )}
        </div>
      )
    }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div style={{ padding: '24px 0 24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '36px' }}>
        <Card title="Bakery Settings" subtitle="Configure your bakery information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, color: '#8B4513', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={20} />
                General Settings
              </h3>
              <Button
                variant="outline"
                onClick={() => setEditingConfig(!editingConfig)}
              >
                {editingConfig ? 'Cancel' : <Edit2 size={16} />}
              </Button>
            </div>

            <Input
              label="Bakery Name"
              name="bakeryName"
              value={config.bakeryName}
              onChange={handleConfigChange}
              disabled={!editingConfig}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '48px',
              rowGap: '20px'
            }}>
              <div style={{ minWidth: 0 }}>
                <Input
                  label="Tax Rate (%)"
                  name="taxRate"
                  type="number"
                  value={config.taxRate}
                  onChange={handleConfigChange}
                  disabled={!editingConfig}
                  noMargin
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <Input
                  label="Currency"
                  name="currency"
                  value={config.currency}
                  onChange={handleConfigChange}
                  disabled={!editingConfig}
                  noMargin
                />
              </div>
            </div>
            {editingConfig && (
              <div style={{ marginTop: '4px' }}>
                <Button variant="success" onClick={handleSaveConfig}>
                  <Save size={16} />
                  Save Settings
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card title="Business Hours" subtitle="Set your operating hours">
          <div>
            {days.map((day) => (
              <div key={day} style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(88px, 110px) minmax(0, 1fr) auto',
                gap: '16px',
                alignItems: 'center',
                padding: '16px 4px',
                borderBottom: '1px solid #E6D4BC',
                backgroundColor: config.businessHours[day].closed ? '#F5F5F5' : 'transparent'
              }}>
                <span style={{ 
                  fontWeight: '600', 
                  color: '#8B4513',
                  textTransform: 'capitalize'
                }}>
                  {day}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                  width: '100%',
                }}>
                  <div style={{ flex: '1 1 0', minWidth: 0 }}>
                    <Input
                      type="time"
                      value={config.businessHours[day].open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      disabled={!editingConfig || config.businessHours[day].closed}
                      noMargin
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    style={{
                      width: '40px',
                      minWidth: '40px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: '1 1 0', minWidth: 0 }}>
                    <Input
                      type="time"
                      value={config.businessHours[day].close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      disabled={!editingConfig || config.businessHours[day].closed}
                      noMargin
                    />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.businessHours[day].closed}
                    onChange={() => handleHoursChange(day, 'closed')}
                    disabled={!editingConfig}
                  />
                  <span style={{ color: '#8B4513', fontSize: '14px' }}>Closed</span>
                </label>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="User Management" subtitle="Manage staff permissions and access">
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#8B4513', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <Users size={20} />
          System Users
        </h3>
        <Table
          data={users}
          columns={userColumns}
          emptyMessage="No users found"
        />
      </Card>
    </div>
  );
};

export default SystemConfig;