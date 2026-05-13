import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, Package } from 'lucide-react';
import { Card, Button } from '../../components/shared';
import Chart from '../../components/shared/Chart';

const SalesAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    bestSellers: [],
    recentOrders: [],
    timeRange: 'week',
    categoryData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [analytics.timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Enhanced mock data with realistic bakery analytics[cite: 1]
      const mockAnalytics = {
        totalRevenue: 15420.50,
        dailyRevenue: 2150.75,
        weeklyRevenue: 12450.25,
        monthlyRevenue: 48650.00,
        bestSellers: [
          { name: 'Croissant', quantity: 145, revenue: 3625.00 },
          { name: 'Pumpkin Spice Muffin', quantity: 89, revenue: 3115.00 },
          { name: 'Chocolate Chip Cookie', quantity: 234, revenue: 3510.00 },
          { name: 'Sourdough Bread', quantity: 67, revenue: 3015.00 },
          { name: 'Cinnamon Roll', quantity: 156, revenue: 2808.00 },
          { name: 'Blueberry Scone', quantity: 98, revenue: 1960.00 }
        ],
        recentOrders: [
          { id: 1, date: '2026-05-12', items: 3, total: 85.00, customer: 'John Doe' },
          { id: 2, date: '2026-05-12', items: 5, total: 125.50, customer: 'Jane Smith' },
          { id: 3, date: '2026-05-11', items: 2, total: 45.00, customer: 'Bob Johnson' },
          { id: 4, date: '2026-05-11', items: 8, total: 210.75, customer: 'Alice Brown' },
          { id: 5, date: '2026-05-10', items: 4, total: 95.25, customer: 'Charlie Wilson' }
        ],
        revenueData: [
          { label: 'Mon', value: 1850 },
          { label: 'Tue', value: 2200 },
          { label: 'Wed', value: 1950 },
          { label: 'Thu', value: 2450 },
          { label: 'Fri', value: 2850 },
          { label: 'Sat', value: 2100 },
          { label: 'Sun', value: 1750 }
        ],
        categoryData: [
          { label: 'Pastries', value: 45, color: '#d4a574' },
          { label: 'Breads', value: 25, color: '#c19a6b' },
          { label: 'Cakes', value: 20, color: '#a0826d' },
          { label: 'Beverages', value: 10, color: '#8b4513' }
        ]
      };
      setAnalytics(prev => ({ ...prev, ...mockAnalytics }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = '#8b4513', trend = null, subtitle = '' }) => (
    <Card variant="elevated" style={{ 
      textAlign: 'center', 
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.95) 0%, rgba(255, 249, 240, 0.95) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {trend && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: trend > 0 ? '#16a34a' : '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
      
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '16px', 
        backgroundColor: `${color}20`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 16px',
        transition: 'all 0.3s ease'
      }}>
        <Icon size={32} color={color} />
      </div>
      
      <h3 style={{ margin: '0 0 8px 0', color: '#a0826d', fontSize: '14px', fontWeight: '600' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 4px 0', color: color, fontSize: '28px', fontWeight: '800' }}>
        {typeof value === 'number' ? `R${value.toFixed(2)}` : value}
      </p>
      {subtitle && (
        <p style={{ margin: 0, color: '#a0826d', fontSize: '12px', opacity: 0.8 }}>
          {subtitle}
        </p>
      )}
    </Card>
  );

  const BestSellerCard = ({ item, index }) => (
    <Card variant="elevated" style={{
      padding: '16px',
      background: index === 0 ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(193, 154, 107, 0.1) 100%)' : 'rgba(255, 253, 250, 0.95)',
      border: index === 0 ? '2px solid rgba(212, 165, 116, 0.3)' : '1px solid rgba(139, 69, 19, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {index === 0 && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: '#d4a574',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '700'
        }}>
          #1 BEST
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#8b4513',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '18px'
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', color: '#8b4513', fontSize: '16px', fontWeight: '700' }}>
            {item.name}
          </h4>
          <p style={{ margin: 0, color: '#a0826d', fontSize: '13px' }}>
            {item.quantity} units sold
          </p>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid rgba(139, 69, 19, 0.1)'
      }}>
        <span style={{ color: '#a0826d', fontSize: '14px', fontWeight: '600' }}>Revenue</span>
        <span style={{ color: '#8b4513', fontSize: '18px', fontWeight: '800' }}>
          R{item.revenue.toFixed(2)}
        </span>
      </div>
    </Card>
  );

  const RecentOrderRow = ({ order }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '60px 1fr 100px 80px 120px',
      gap: '16px',
      padding: '16px',
      backgroundColor: 'rgba(255, 253, 250, 0.5)',
      borderRadius: '12px',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      border: '1px solid transparent'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 253, 250, 0.5)';
      e.currentTarget.style.borderColor = 'transparent';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: '#8b4513',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px'
      }}>
        #{order.id}
      </div>
      <div style={{ color: '#8b4513', fontWeight: '600' }}>
        {order.customer}
      </div>
      <div style={{ color: '#a0826d', fontSize: '14px' }}>
        {order.date}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        color: '#8b4513',
        fontWeight: '600',
        fontSize: '14px'
      }}>
        <Package size={16} />
        {order.items}
      </div>
      <div style={{ 
        textAlign: 'right', 
        color: '#8b4513', 
        fontWeight: '700', 
        fontSize: '16px'
      }}>
        R{order.total.toFixed(2)}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: '#8b4513',
        fontSize: '18px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(139, 69, 19, 0.2)',
          borderTop: '4px solid #8b4513',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '16px'
        }}></div>
        Loading analytics data...
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Sales Analytics" subtitle="Comprehensive bakery performance insights">
        {/* Time Range Selector */}
        <div style={{ 
          marginBottom: '32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={20} color="#8b4513" />
            <select
              value={analytics.timeRange}
              onChange={(e) => setAnalytics(prev => ({ ...prev, timeRange: e.target.value }))}
              style={{
                padding: '12px 16px',
                border: '2px solid rgba(212, 165, 116, 0.5)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 253, 250, 0.95)',
                color: '#8b4513',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b4513';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 69, 19, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 165, 116, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <Button variant="outline" style={{ fontSize: '14px' }}>
            Export Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          <StatCard
            title="Total Revenue"
            value={analytics.totalRevenue}
            icon={DollarSign}
            color="#16a34a"
            trend={12.5}
            subtitle="vs last month"
          />
          <StatCard
            title="Daily Revenue"
            value={analytics.dailyRevenue}
            icon={TrendingUp}
            color="#8b4513"
            trend={8.2}
            subtitle="vs yesterday"
          />
          <StatCard
            title="Weekly Revenue"
            value={analytics.weeklyRevenue}
            icon={Calendar}
            color="#d4a574"
            trend={-3.1}
            subtitle="vs last week"
          />
          <StatCard
            title="Monthly Revenue"
            value={analytics.monthlyRevenue}
            icon={DollarSign}
            color="#c19a6b"
            trend={15.7}
            subtitle="vs last month"
          />
        </div>

        {/* Charts Section - Fixed Squishing[cite: 1, 2] */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <div style={{ marginTop: '24px' }}>
            <Chart
              type="line"
              title="Revenue Trend"
              data={analytics.revenueData}
              height={250}
              color="#8b4513"
            />
          </div>
          <div style={{ marginTop: '24px' }}>
            <Chart
              type="pie"
              title="Sales by Category"
              data={analytics.categoryData}
              height={300}
            />
          </div>
        </div>

        {/* Best Sellers and Recent Orders */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px' 
        }}>
          <div>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#8b4513', 
              fontSize: '20px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Package size={24} />
              Top Selling Items
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {analytics.bestSellers.map((item, index) => (
                <BestSellerCard key={index} item={item} index={index} />
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#8b4513', 
              fontSize: '20px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShoppingCart size={24} />
              Recent Orders
            </h3>
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px 80px 120px',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(212, 165, 116, 0.1)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: '#8b4513'
                }}>
                  <span>Order #</span>
                  <span>Customer</span>
                  <span>Date</span>
                  <span>Items</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics.recentOrders.map((order) => (
                  <RecentOrderRow key={order.id} order={order} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesAnalytics;