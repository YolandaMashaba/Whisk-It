import React from 'react';

const Table = ({ 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'No data available',
  className = '',
  ...props 
}) => {
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'rgba(255, 253, 250, 0.95)',
    borderRadius: '16px',
    overflow: 'hidden',
    fontSize: '14px',
    boxShadow: '0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)',
    backdropFilter: 'blur(10px)'
  };

  const headerStyles = {
    background: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 100%)',
    color: 'white',
    fontWeight: '700',
    textAlign: 'left',
    borderBottom: 'none',
  };

  const cellStyles = {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(139, 69, 19, 0.05)',
    color: '#8b4513',
  };

  const headerCellStyles = {
    ...cellStyles,
    ...headerStyles,
  };

  const rowStyles = {
    transition: 'all 0.3s ease',
  };

  const loadingStyles = {
    textAlign: 'center',
    padding: '60px',
    color: '#8b4513',
    fontStyle: 'italic',
    fontSize: '16px',
    backgroundColor: 'rgba(255, 253, 250, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)'
  };

  const emptyStyles = {
    textAlign: 'center',
    padding: '60px',
    color: '#a0826d',
    fontStyle: 'italic',
    fontSize: '16px',
    backgroundColor: 'rgba(255, 253, 250, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)'
  };

  if (loading) {
    return (
      <div style={loadingStyles}>
        Loading...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={emptyStyles}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }} className={className}>
      <table style={tableStyles} {...props}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={headerCellStyles}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              style={rowStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} style={cellStyles}>
                  {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
