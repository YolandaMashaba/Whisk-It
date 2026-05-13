import React, { useState, useEffect, useCallback } from 'react';
import { Package, BarChart3, Settings, Home, Menu, X, LogOut } from 'lucide-react';
import { Button, Card } from '@/components/Index';
import { useAuth } from '@/context/AuthContext';
import { getSalesReport, getAdminOrders } from '@/api/Index';
import Inventory from './Inventory';
import SalesAnalytics from './SalesAnalytics';
import SystemConfig from './SystemConfig';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Home },
    { id: 'inventory', label: 'Inventory Control', icon: Package },
    { id: 'analytics', label: 'Sales Analytics', icon: BarChart3 },
    { id: 'config', label: 'System Configuration', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <Inventory />;
      case 'analytics':
        return <SalesAnalytics />;
      case 'config':
        return <SystemConfig />;
      default:
        return <DashboardOverview />;
    }
  };

  const DashboardOverview = () => {
    const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, itemsSold: 0, avgOrder: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
      try {
        setStatsLoading(true);
        const [salesData, ordersData] = await Promise.all([
          getSalesReport(),
          getAdminOrders(),
        ]);

        const totalOrders = Array.isArray(ordersData) ? ordersData.length : 0;
        const revenue = Array.isArray(salesData)
          ? salesData.reduce((sum, day) => sum + (day.total_revenue || 0), 0)
          : 0;
        const itemsSold = Array.isArray(salesData)
          ? salesData.reduce((sum, day) => sum + (day.total_items || 0), 0)
          : 0;
        const avgOrder = totalOrders > 0 ? revenue / totalOrders : 0;

        setStats({ totalOrders, revenue, itemsSold, avgOrder });

        const recent = Array.isArray(ordersData)
          ? ordersData
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5)
          : [];
        setRecentOrders(recent);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setStatsLoading(false);
      }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    function formatTime(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
    <div>
      <Card title="Dashboard Overview" subtitle="Welcome to the Whisk-It Admin Panel">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px',
          marginBottom: '64px',
          alignItems: 'stretch',
          justifyItems: 'center'
        }}>
          <Card variant="elevated" style={{ 
            textAlign: 'center', 
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.95) 0%, rgba(255, 249, 240, 0.95) 100%)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            borderRadius: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.15)';
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              position: 'relative',
              boxShadow: '0 8px 16px rgba(212, 165, 116, 0.3)'
            }}>
              <Package size={40} color="white" />
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#8b4513', fontSize: '18px', fontWeight: '700' }}>
              Inventory Management
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#a0826d', fontSize: '15px', lineHeight: '1.5' }}>
              Add, edit, and manage your bakery items with real-time inventory tracking
            </p>
            <Button 
              variant="secondary" 
              onClick={() => setActiveTab('inventory')}
              style={{ 
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(193, 154, 107, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(193, 154, 107, 0.2)';
              }}
            >
              Manage Items
            </Button>
          </Card>

          <Card variant="elevated" style={{ 
            textAlign: 'center', 
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.95) 0%, rgba(255, 249, 240, 0.95) 100%)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            borderRadius: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.15)';
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, #c19a6b 0%, #a0826d 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              position: 'relative',
              boxShadow: '0 8px 16px rgba(193, 154, 107, 0.3)'
            }}>
              <BarChart3 size={40} color="white" />
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#8b4513', fontSize: '18px', fontWeight: '700' }}>
              Sales Analytics
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#a0826d', fontSize: '15px', lineHeight: '1.5' }}>
              Track revenue trends and view detailed performance metrics
            </p>
            <Button 
              variant="secondary" 
              onClick={() => setActiveTab('analytics')}
              style={{ 
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(193, 154, 107, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(193, 154, 107, 0.2)';
              }}
            >
              View Analytics
            </Button>
          </Card>

          <Card variant="elevated" style={{ 
            textAlign: 'center', 
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.95) 0%, rgba(255, 249, 240, 0.95) 100%)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            borderRadius: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.15)';
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, #a0826d 0%, #8b4513 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              position: 'relative',
              boxShadow: '0 8px 16px rgba(160, 130, 109, 0.3)'
            }}>
              <Settings size={40} color="white" />
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#8b4513', fontSize: '18px', fontWeight: '700' }}>
              System Configuration
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#a0826d', fontSize: '15px', lineHeight: '1.5' }}>
              Manage users, permissions, and bakery settings
            </p>
            <Button 
              variant="secondary" 
              onClick={() => setActiveTab('config')}
              style={{ 
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(193, 154, 107, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(193, 154, 107, 0.2)';
              }}
            >
              Configure System
            </Button>
          </Card>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px' 
        }}>
          <Card title="Quick Stats" subtitle="Overall performance">
            <div style={{ 
              padding: '20px',
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '16px' 
            }}>
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(255, 253, 250, 0.8)', 
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(139, 69, 19, 0.1)'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#a0826d', fontSize: '14px' }}>
                  Total Orders
                </h4>
                <p style={{ margin: 0, color: '#8b4513', fontSize: '24px', fontWeight: '700' }}>
                  {statsLoading ? '…' : stats.totalOrders}
                </p>
              </div>
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(193, 154, 107, 0.2)', 
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(193, 154, 107, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#c19a6b', fontSize: '14px' }}>
                  Revenue
                </h4>
                <p style={{ margin: 0, color: '#c19a6b', fontSize: '24px', fontWeight: '700' }}>
                  {statsLoading ? '…' : `R${stats.revenue.toFixed(2)}`}
                </p>
              </div>
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(255, 249, 240, 0.8)', 
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(210, 105, 30, 0.2)'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#a0826d', fontSize: '14px' }}>
                  Items Sold
                </h4>
                <p style={{ margin: 0, color: '#a0826d', fontSize: '24px', fontWeight: '700' }}>
                  {statsLoading ? '…' : stats.itemsSold}
                </p>
              </div>
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(212, 165, 116, 0.2)', 
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(212, 165, 116, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#d4a574', fontSize: '14px' }}>
                  Avg Order
                </h4>
                <p style={{ margin: 0, color: '#d4a574', fontSize: '24px', fontWeight: '700' }}>
                  {statsLoading ? '…' : `R${stats.avgOrder.toFixed(2)}`}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Recent Orders" subtitle="Latest orders placed">
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {statsLoading ? (
                <p style={{ padding: '12px', color: '#a0826d', fontSize: '14px' }}>Loading…</p>
              ) : recentOrders.length === 0 ? (
                <p style={{ padding: '12px', color: '#a0826d', fontSize: '14px' }}>No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(139, 69, 19, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#8b4513', fontSize: '14px' }}>
                        Order #{order.id} — R{Number(order.total_amount).toFixed(2)}
                      </p>
                      <p style={{ margin: 0, color: '#a0826d', fontSize: '12px' }}>
                        {formatTime(order.created_at)} · {order.status || 'pending'}
                      </p>
                    </div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: order.status === 'completed' ? '#16a34a' : '#c19a6b'
                    }} />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)' 
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '60px',
        background: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 100%)',
        color: '#FFFFFF',
        transition: 'width 0.3s ease',
        boxShadow: '2px 0 8px rgba(139, 69, 19, 0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: sidebarOpen ? '20px' : '16px',
            fontWeight: '700',
            color: '#FFFFFF'
          }}>
            {sidebarOpen ? 'Admin Panel' : 'A'}
          </h1>
          <Button
            variant="outline"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #FFFFFF',
              color: '#FFFFFF',
              padding: '8px',
              minWidth: 'auto'
            }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  border: 'none',
                  backgroundColor: activeTab === item.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background-color 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          {sidebarOpen && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Logged in as: <strong>{user?.username}</strong>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px 16px',
                  fontSize: '12px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                <LogOut size={14} />
                Logout
              </Button>
              <p style={{ margin: '12px 0 0', fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Whisk-It
              </p>
            </>
          )}
          {!sidebarOpen && (
            <Button
              variant="outline"
              onClick={logout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '8px',
                fontSize: '12px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              <LogOut size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px 12px 24px 12px', overflowY: 'auto', background: 'rgba(255, 253, 250, 0.3)' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
