import React, { useState, useEffect } from 'react';
import { Users, Save, Edit2 } from 'lucide-react';
import { Button, Card, Table } from '@/components/Index';
import { getAdminUsers, patchAdminUser } from '@/api/Index';

const SystemConfig = () => {
  const [users, setUsers] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      // Transform API data to component format
      const transformedData = data.map(user => ({
        id: user.id,
        name: user.username,
        role: user.role,
        is_admin: user.is_admin
      }));
      setUsers(transformedData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setFormData(user);
  };

  const handleSaveUser = async () => {
    try {
      const updateData = {
        is_admin: formData.is_admin ?? false
      };

      await patchAdminUser(editingUser, updateData);

      // Refresh users list
      await fetchUsers();

      setEditingUser(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancelUser = () => {
    setEditingUser(null);
    setFormData({});
  };

  const userColumns = [
    {
      header: 'Username',
      accessor: 'name',
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value) => (
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
      header: 'Admin',
      accessor: 'is_admin',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: value ? '#E8F5E8' : '#F0F8FF',
          color: value ? '#228B22' : '#4169E1'
        }}>
          {value ? 'Yes' : 'No'}
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

  return (
    <div style={{ padding: '24px 0 24px 0' }}>
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