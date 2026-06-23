import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, Package } from 'lucide-react';
import { Card, Button, Chart } from '@/components/Index';
import { getSalesReport, getTopProducts, getAdminOrders } from '@/api/Index';

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
      setLoading(true);

      // Fetch sales report data
      const salesData = await getSalesReport();
      const topProductsData = await getTopProducts();
      const ordersData = await getAdminOrders();

      const allOrders = Array.isArray(ordersData) ? ordersData : [];
      const salesDays = Array.isArray(salesData) ? salesData : [];
      const topProducts = Array.isArray(topProductsData) ? topProductsData : [];

      const totalRevenue = salesDays.reduce((sum, day) => sum + (day.total_revenue || 0), 0);

      const today = new Date().toISOString().split('T')[0];
      const todayData = salesDays.find(day => day.date === today);
      const dailyRevenue = todayData ? todayData.total_revenue : 0;

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyRevenue = allOrders
        .filter(o => new Date(o.created_at) >= weekAgo)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = allOrders
        .filter(o => new Date(o.created_at) >= monthStart)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const recentOrders = allOrders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          date: order.created_at ? order.created_at.split('T')[0] : '',
          items: order.orderItems ? order.orderItems.length : 0,
          total: order.total_amount,
          customer: `Order #${order.id}`
        }));

      const bestSellers = topProducts.map(product => ({
        name: product.name,
        quantity: product.total_quantity,
        revenue: product.total_revenue
      }));

      const categoryMap = {};
      const categoryColors = ['#d4a574', '#c19a6b', '#a0826d', '#8b4513', '#654321', '#432818'];
      allOrders.forEach(order => {
        (order.orderItems || []).forEach(item => {
          const cat = item.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + ((item.price || 0) * (item.quantity || 1));
        });
      });
      const categoryData = Object.entries(categoryMap).map(([label, value], i) => ({
        label,
        value,
        color: categoryColors[i % categoryColors.length]
      }));

      setAnalytics({
        totalRevenue,
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
        bestSellers,
        recentOrders,
        timeRange: 'week',
        categoryData
      });

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
    <div style={{ padding: '24px 0 24px 0' }}>
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
            subtitle="all time"
          />
          <StatCard
            title="Daily Revenue"
            value={analytics.dailyRevenue}
            icon={TrendingUp}
            color="#8b4513"
            subtitle="today"
          />
          <StatCard
            title="Weekly Revenue"
            value={analytics.weeklyRevenue}
            icon={Calendar}
            color="#d4a574"
            subtitle="last 7 days"
          />
          <StatCard
            title="Monthly Revenue"
            value={analytics.monthlyRevenue}
            icon={DollarSign}
            color="#c19a6b"
            subtitle="this month"
          />
        </div>

        <div
          style={{
            marginBottom: '32px',
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div style={{ width: '100%', maxWidth: '480px' }}>
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