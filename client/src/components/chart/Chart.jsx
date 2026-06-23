import React from 'react';

const Chart = ({ type, data, title, height = 300, color = '#d4a574' }) => {
  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barWidth = 100 / data.length - 10;
    
    return (
      <div style={{ position: 'relative', height: `${height}px` }}>
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '0',
          right: '0',
          height: `${height - 40}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          padding: '0 10px'
        }}>
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                width: `${barWidth}%`,
                height: `${(item.value / maxValue) * (height - 40)}px`,
                backgroundColor: color,
                borderRadius: '4px',
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              title={`${item.label}: ${item.value}`}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.8';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '12px',
                fontWeight: '600',
                color: '#8b4513',
                whiteSpace: 'nowrap'
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '30px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '12px',
          color: '#a0826d'
        }}>
          {data.map((item, index) => (
            <span key={index} style={{ textAlign: 'center' }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.map((d) => d.value), 1e-9);
    const last = Math.max(data.length - 1, 1);
    const yTop = 10;
    const yBottom = 90;
      const x = (index / xDenom) * 100;
    const ySpan = yBottom - yTop;

    const yForValue = (v) => yBottom - (v / maxValue) * ySpan;

    const points = data
      .map((item, index) => {
        const x = (index / last) * 100;
        const y = yForValue(item.value);
        return `${x},${y}`;
      })
      .join(' ');

    const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => yTop + t * ySpan);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: `${height}px`,
          marginTop: '12px',
          minHeight: 0,
        }}
      >
        <div style={{ flex: '1 1 auto', minHeight: 0, position: 'relative' }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ overflow: 'visible', display: 'block' }}
          >
            {gridYs.map((gy, i) => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={gy}
                x2="100"
                y2={gy}
                stroke="rgba(139, 69, 19, 0.1)"
                strokeWidth="0.5"
              />
            ))}

            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {data.map((item, index) => {
              const x = (index / last) * 100;
              const y = yForValue(item.value);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    title={`${item.label}: ${item.value}`}
                  />
                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#8b4513"
                    fontWeight="600"
                  >
                    {item.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div
          style={{
            flexShrink: 0,
            minHeight: '34px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 10px 0',
            fontSize: '12px',
            color: '#a0826d',
          }}
        >
          {data.map((item, index) => (
            <span key={index} style={{ textAlign: 'center' }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90; // Start from top
    
    return (
      <div style={{ position: 'relative', height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const endAngle = currentAngle + angle;
            
            // Create arc path
            const largeArcFlag = angle > 180 ? 1 : 0;
            const startX = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
            const startY = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
            const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
            const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
            
            const path = [
              `M 100 100`,
              `L ${startX} ${startY}`,
              `A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');
            
            const result = currentAngle;
            currentAngle = endAngle;
            
            return (
              <g key={index}>
                <path
                  d={path}
                  fill={item.color || color}
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  title={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.8';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div style={{
          position: 'absolute',
          right: '-150px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255, 253, 250, 0.95)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(139, 69, 19, 0.1)',
          boxShadow: '0 4px 16px rgba(139, 69, 19, 0.15)'
        }}>
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: item.color || color,
                  borderRadius: '2px',
                  marginRight: '8px'
                }} />
                <span style={{ color: '#8b4513' }}>
                  {item.label}: {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const chartContainerStyle = {
    backgroundColor: 'rgba(255, 253, 250, 0.95)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(139, 69, 19, 0.15)',
    border: '1px solid rgba(139, 69, 19, 0.1)'
  };

  const titleStyle = {
    margin: '0 0 20px 0',
    color: '#8b4513',
    fontSize: '18px',
    fontWeight: '700',
    textAlign: 'center'
  };

  return (
    <div style={chartContainerStyle}>
      {title && <h3 style={titleStyle}>{title}</h3>}
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
    </div>
  );
};

export default Chart;
