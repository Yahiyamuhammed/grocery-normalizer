import { useState, useMemo } from 'react';
import { UploadCloud, Loader2, ArrowRight } from 'lucide-react';
import { uploadCsvForNormalization } from './api/productApi';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [showNormalized, setShowNormalized] = useState(true); // The Before/After Toggle

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadCsvForNormalization(file);
      setData(result);
    } catch (error) {
      console.error(error);
      alert("Error processing file. Ensure backend is running and API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  // Group the flat JSON array into families for the UI
  const groupedData = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, item) => {
      if (!acc[item.family]) acc[item.family] = [];
      acc[item.family].push(item);
      return acc;
    }, {});
  }, [data]);

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Athena Graph Engine</h1>
            <p className="text-gray-500 mt-1">Prototype: Automated SKU Normalization & Matching</p>
          </div>
        </header>

        {/* UPLOAD SECTION */}
        {!data && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center space-y-6">
            <div className="bg-blue-50 p-4 rounded-full">
              <UploadCloud className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Upload Retailer Data</h3>
              <p className="text-gray-500 text-sm mt-1 mb-4">CSV file containing messy 'name' fields</p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-gray-900 text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Run Graph AI'}
            </button>
          </div>
        )}

        {/* RESULTS DASHBOARD */}
        {data && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex gap-8 text-sm">
                <div><span className="text-gray-500">Total Items:</span> <strong className="ml-1 text-lg">{data.length}</strong></div>
                <div><span className="text-gray-500">Unique Families:</span> <strong className="ml-1 text-lg">{Object.keys(groupedData).length}</strong></div>
              </div>
              
              {/* THE TOGGLE */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setShowNormalized(false)}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${!showNormalized ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                >
                  Raw Retailer Data
                </button>
                <button 
                  onClick={() => setShowNormalized(true)}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all flex items-center gap-2 ${showNormalized ? 'bg-blue-600 shadow text-white' : 'text-gray-500'}`}
                >
                  <ArrowRight className="w-4 h-4" /> Normalized View
                </button>
              </div>
            </div>

            {/* FAMILIES LIST */}
            <div className="grid gap-6">
              {Object.entries(groupedData).map(([family, items]) => (
                <div key={family} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">{family}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map((item, idx) => (
                      <div key={idx} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col">
                          {showNormalized ? (
                            <span className="font-medium text-blue-900">{item.normalized}</span>
                          ) : (
                            <span className="font-medium text-red-900 line-through opacity-80">{item.original}</span>
                          )}
                          
                          {showNormalized && item.brand && (
                            <span className="text-xs text-gray-500 mt-1">Brand: {item.brand} • Size: {item.size || 'N/A'}</span>
                          )}
                        </div>
                        
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${getConfidenceColor(item.confidence)}`}>
                          {item.confidence}% Match
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;