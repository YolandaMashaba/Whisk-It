import React from "react";

const Header = () => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
      <h1> Bakery POS</h1>
      <div>
        <ShoppingCart size={24} />
      </div>
    </header>
  );
};

export default Header;