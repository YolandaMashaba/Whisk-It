import React, { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';
import { Header } from './components/Index';
import './App.scss';

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
    <div className="p-5 font-sans">
      <Header />

      <main className="mt-5">
        <p className="text-base font-semibold">
          <strong>Status:</strong> {serverMessage}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {/* Example Item Card */}
          <button className="p-4 rounded-lg border border-gray-300 bg-white hover:shadow-lg cursor-pointer text-center transition-shadow">
            <Utensils size={20} className="mx-auto mb-2" />
            <p className="font-medium">Croissant</p>
            <span className="text-sm text-gray-600">R25.00</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;