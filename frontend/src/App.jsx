import { useState } from 'react';
import { normalizeProductCatalog } from './api/productApi';

function App() {
  const [data, setData] = useState(null);

  const handleTestCall = async () => {
    
    const rawProducts = ["Gatorade Cool Blue 12oz", "Gatrade Blue 12 oz"];
    try {
      const result = await normalizeProductCatalog(rawProducts);
      setData(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary">BetterBasket Prototype</h1>
      </header>
      
      <main>
        <button 
          onClick={handleTestCall}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-secondary cursor-pointer"
        >
          Test Backend Connection
        </button>

        {data && (
          <pre className="mt-4 bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </main>
    </div>
  );
}

export default App;