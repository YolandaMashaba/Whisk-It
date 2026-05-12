import React, { useState, useEffect } from 'react';
import { ShoppingCart, Utensils } from 'lucide-react';

function App() {
  const [serverMessage, setServerMessage] = useState("Connecting to backend...");

  // Testing connection to your Node.js server
  useEffect(() => {
    fetch('http://localhost:5001/api/status')
      .then(res => res.json())
      .then(data => setServerMessage(data.message))
      .catch(err => setServerMessage("Backend offline"));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h1> Bakery POS</h1>
        <div>
          <ShoppingCart size={24} />
        </div>
      </header>

      <main style={{ marginTop: '20px' }}>
        <p><strong>Status:</strong> {serverMessage}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {/* Example Item Card */}
          <button style={cardStyle}>
            <Utensils size={20} />
            <p>Croissant</p>
            <span>R25.00</span>
          </button>
        </div>
      </main>
    </div>
  );
}

const cardStyle = {
  padding: '15px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  textAlign: 'center'
};

export default App;