import React, { useState } from 'react';
import { Package, BarChart3, Settings, Home, Menu, X, LogOut } from 'lucide-react';
import { Button, Card } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
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

  const DashboardOverview = () => (
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
          <Card title="Quick Stats" subtitle="Today's performance">
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
                  47
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
                  R2,150
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
                  156
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
                  R45
                </p>
              </div>
            </div>
          </Card>

          <Card title="Recent Activity" subtitle="Latest system events">
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {[
                { time: '10:45 AM', event: 'New order received', type: 'order' },
                { time: '10:30 AM', event: 'Low stock alert: Croissants', type: 'warning' },
                { time: '09:15 AM', event: 'John logged in', type: 'user' },
                { time: '08:45 AM', event: 'Daily sales report generated', type: 'report' },
                { time: '08:00 AM', event: 'System backup completed', type: 'system' },
              ].map((activity, index) => (
                <div key={index} style={{
                  padding: '12px',
                  borderBottom: '1px solid rgba(139, 69, 19, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#8b4513', fontSize: '14px' }}>
                      {activity.event}
                    </p>
                    <p style={{ margin: 0, color: '#a0826d', fontSize: '12px' }}>
                      {activity.time}
                    </p>
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: {
                      order: '#c19a6b',
                      warning: '#d4a574',
                      user: '#a0826d',
                      report: '#8b4513',
                      system: '#6b4423'
                    }[activity.type]
                  }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );

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
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'rgba(255, 253, 250, 0.3)' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
