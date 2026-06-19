import { useState, useMemo } from 'react';
import { Loader2, Database, FileJson, Layers, CornerDownRight, Zap, TrendingDown, Clock, ShieldCheck, Play } from 'lucide-react';
import { uploadCsvForNormalization } from './api/productApi';

const SAMPLE_DATA = [
  { "original": "Coca Cola Classic 1L", "normalized": "Coca-Cola Classic 1L", "family": "Soda", "confidence": 98, "brand": "Coca-Cola", "size": "1L" },
  { "original": "Coke Original Taste 1000ml", "normalized": "Coca-Cola Classic 1L", "family": "Soda", "confidence": 95, "brand": "Coca-Cola", "size": "1L" },
  { "original": "Coca-Cola 1 Liter", "normalized": "Coca-Cola Classic 1L", "family": "Soda", "confidence": 98, "brand": "Coca-Cola", "size": "1L" },
  { "original": "Coka Cola 1L", "normalized": "Coca-Cola Classic 1L", "family": "Soda", "confidence": 90, "brand": "Coca-Cola", "size": "1L" },
  { "original": "COKE 1 LITER", "normalized": "Coca-Cola Classic 1L", "family": "Soda", "confidence": 92, "brand": "Coca-Cola", "size": "1L" },
  { "original": "Gatorade Cool Blue 12oz", "normalized": "Gatorade Cool Blue Sports Drink 12oz", "family": "Sports Drink", "confidence": 98, "brand": "Gatorade", "size": "12oz" },
  { "original": "Gatorad Blue 12 oz", "normalized": "Gatorade Cool Blue Sports Drink 12oz", "family": "Sports Drink", "confidence": 90, "brand": "Gatorade", "size": "12oz" },
  { "original": "Gatrade CoolBlue", "normalized": "Gatorade Cool Blue Sports Drink", "family": "Sports Drink", "confidence": 88, "brand": "Gatorade", "size": "" },
  { "original": "GATORADE COOL BLUE", "normalized": "Gatorade Cool Blue Sports Drink", "family": "Sports Drink", "confidence": 95, "brand": "Gatorade", "size": "" },
  { "original": "gatorade blue", "normalized": "Gatorade Cool Blue Sports Drink", "family": "Sports Drink", "confidence": 90, "brand": "Gatorade", "size": "" },
  { "original": "Gatrade 12 oz", "normalized": "Gatorade Sports Drink 12oz", "family": "Sports Drink", "confidence": 85, "brand": "Gatorade", "size": "12oz" },
  { "original": "GATORADE BLUE", "normalized": "Gatorade Cool Blue Sports Drink", "family": "Sports Drink", "confidence": 90, "brand": "Gatorade", "size": "" },
  { "original": "Pepsi Cola 12 Pack 12oz", "normalized": "Pepsi Cola 12-Pack 12oz Cans", "family": "Soda", "confidence": 98, "brand": "Pepsi", "size": "12-Pack 12oz Cans" },
  { "original": "Pepsi 12pk", "normalized": "Pepsi Cola 12-Pack", "family": "Soda", "confidence": 90, "brand": "Pepsi", "size": "12-Pack" },
  { "original": "PEPSI 12 oz cans", "normalized": "Pepsi Cola 12oz Can", "family": "Soda", "confidence": 80, "brand": "Pepsi", "size": "12oz" },
  { "original": "pepsi cola value pack", "normalized": "Pepsi Cola Value Pack", "family": "Soda", "confidence": 85, "brand": "Pepsi", "size": "Value Pack" },
  { "original": "Red Bull Energy Drink 8.4oz", "normalized": "Red Bull Energy Drink 8.4oz", "family": "Energy Drink", "confidence": 98, "brand": "Red Bull", "size": "8.4oz" },
  { "original": "Redbull 8.4 oz", "normalized": "Red Bull Energy Drink 8.4oz", "family": "Energy Drink", "confidence": 95, "brand": "Red Bull", "size": "8.4oz" },
  { "original": "RED BULL 8.4oz", "normalized": "Red Bull Energy Drink 8.4oz", "family": "Energy Drink", "confidence": 98, "brand": "Red Bull", "size": "8.4oz" },
  { "original": "Red Bull energy limited edition", "normalized": "Red Bull Limited Edition Energy Drink", "family": "Energy Drink", "confidence": 90, "brand": "Red Bull", "size": "" },
  { "original": "Lay's Classic Family Pack 8oz", "normalized": "Lay's Classic Potato Chips Family Pack 8oz", "family": "Chips", "confidence": 98, "brand": "Lay's", "size": "Family Pack 8oz" },
  { "original": "Lays classic 8 oz", "normalized": "Lay's Classic Potato Chips 8oz", "family": "Chips", "confidence": 95, "brand": "Lay's", "size": "8oz" },
  { "original": "LAYS CLASSIC", "normalized": "Lay's Classic Potato Chips", "family": "Chips", "confidence": 90, "brand": "Lay's", "size": "" },
  { "original": "Lay's potato chips 8oz", "normalized": "Lay's Classic Potato Chips 8oz", "family": "Chips", "confidence": 92, "brand": "Lay's", "size": "8oz" },
  { "original": "Pringles Sour Cream & Onion 5.5oz", "normalized": "Pringles Sour Cream & Onion Potato Crisps 5.5oz", "family": "Chips", "confidence": 98, "brand": "Pringles", "size": "5.5oz" },
  { "original": "Pringels Sour Cream", "normalized": "Pringles Sour Cream & Onion Potato Crisps", "family": "Chips", "confidence": 88, "brand": "Pringles", "size": "" },
  { "original": "Pringles 5.5 oz", "normalized": "Pringles Potato Crisps 5.5oz", "family": "Chips", "confidence": 90, "brand": "Pringles", "size": "5.5oz" },
  { "original": "pringles sourcream and onion", "normalized": "Pringles Sour Cream & Onion Potato Crisps", "family": "Chips", "confidence": 92, "brand": "Pringles", "size": "" },
  { "original": "Doritos Nacho Cheese 9.25oz", "normalized": "Doritos Nacho Cheese Flavored Tortilla Chips 9.25oz", "family": "Chips", "confidence": 98, "brand": "Doritos", "size": "9.25oz" },
  { "original": "Dorito Nacho 9.25 oz", "normalized": "Doritos Nacho Cheese Flavored Tortilla Chips 9.25oz", "family": "Chips", "confidence": 90, "brand": "Doritos", "size": "9.25oz" },
  { "original": "DORITOS NACHO CHEESE", "normalized": "Doritos Nacho Cheese Flavored Tortilla Chips", "family": "Chips", "confidence": 95, "brand": "Doritos", "size": "" },
  { "original": "Doritos Nacho Family Pack", "normalized": "Doritos Nacho Cheese Flavored Tortilla Chips Family Pack", "family": "Chips", "confidence": 90, "brand": "Doritos", "size": "Family Pack" },
  { "original": "Oreo Regular 14.3oz", "normalized": "Oreo Original Chocolate Sandwich Cookies 14.3oz", "family": "Cookies", "confidence": 98, "brand": "Oreo", "size": "14.3oz" },
  { "original": "Oreos 14.3 oz", "normalized": "Oreo Original Chocolate Sandwich Cookies 14.3oz", "family": "Cookies", "confidence": 95, "brand": "Oreo", "size": "14.3oz" },
  { "original": "OREO cookies original", "normalized": "Oreo Original Chocolate Sandwich Cookies", "family": "Cookies", "confidence": 92, "brand": "Oreo", "size": "" },
  { "original": "oreo 14.3oz value pack", "normalized": "Oreo Original Chocolate Sandwich Cookies 14.3oz Value Pack", "family": "Cookies", "confidence": 95, "brand": "Oreo", "size": "14.3oz Value Pack" },
  { "original": "Kellogg's Frosted Flakes 13.5oz", "normalized": "Kellogg's Frosted Flakes Cereal 13.5oz", "family": "Cereal", "confidence": 98, "brand": "Kellogg's", "size": "13.5oz" },
  { "original": "Kelloggs Frosted Flakes", "normalized": "Kellogg's Frosted Flakes Cereal", "family": "Cereal", "confidence": 95, "brand": "Kellogg's", "size": "" },
  { "original": "Frosted Flakes 13.5 oz", "normalized": "Kellogg's Frosted Flakes Cereal 13.5oz", "family": "Cereal", "confidence": 90, "brand": "Kellogg's", "size": "13.5oz" },
  { "original": "kelloggs frosted flakes", "normalized": "Kellogg's Frosted Flakes Cereal", "family": "Cereal", "confidence": 95, "brand": "Kellogg's", "size": "" },
  { "original": "Tropicana Orange Juice No Pulp 52oz", "normalized": "Tropicana Pure Premium Orange Juice No Pulp 52oz", "family": "Juice", "confidence": 98, "brand": "Tropicana", "size": "52oz" },
  { "original": "Tropicana OJ 52 oz", "normalized": "Tropicana Pure Premium Orange Juice 52oz", "family": "Juice", "confidence": 95, "brand": "Tropicana", "size": "52oz" },
  { "original": "Trop Orange Juice 52oz", "normalized": "Tropicana Pure Premium Orange Juice 52oz", "family": "Juice", "confidence": 90, "brand": "Tropicana", "size": "52oz" },
  { "original": "TROPICANA ORANGE", "normalized": "Tropicana Pure Premium Orange Juice", "family": "Juice", "confidence": 92, "brand": "Tropicana", "size": "" },
  { "original": "Choc Milk 1 Gallon", "normalized": "Chocolate Milk 1 Gallon", "family": "Milk", "confidence": 95, "brand": "", "size": "1 Gallon" },
  { "original": "Frozen Pezza Pepperoni", "normalized": "Frozen Pepperoni Pizza", "family": "Frozen Meals", "confidence": 85, "brand": "", "size": "" },
  { "original": "Sourdough Bred Fresh", "normalized": "Fresh Sourdough Bread", "family": "Bakery", "confidence": 90, "brand": "", "size": "" },
  { "original": "Bannanas bundle organic", "normalized": "Organic Banana Bundle", "family": "Produce", "confidence": 90, "brand": "", "size": "Bundle" },
  { "original": "Papertowels 6 rolls", "normalized": "Paper Towels 6 Rolls", "family": "Paper Products", "confidence": 95, "brand": "", "size": "6 Rolls" },
  { "original": "Tothpaste mint 4oz", "normalized": "Mint Toothpaste 4oz", "family": "Oral Care", "confidence": 90, "brand": "", "size": "4oz" }
];

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

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

  const loadSampleData = () => {
    setLoading(true);
    // Simulate a brief loading state to make the demo feel natural
    setTimeout(() => {
      setData(SAMPLE_DATA);
      setLoading(false);
    }, 600);
  };

  const groupedData = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, item) => {
      if (!acc[item.family]) acc[item.family] = [];
      acc[item.family].push(item);
      return acc;
    }, {});
  }, [data]);

  // --- BUSINESS IMPACT METRICS ---
  const businessImpact = useMemo(() => {
    if (!data) return null;
    const totalSkus = data.length;
    const uniqueProducts = Object.keys(groupedData).length;
    const duplicatesRemoved = totalSkus - uniqueProducts;
    const reductionPercent = totalSkus > 0 ? Math.round((duplicatesRemoved / totalSkus) * 100) : 0;
    const SECONDS_PER_SKU_MANUAL = 30;
    const hoursSaved = ((totalSkus * SECONDS_PER_SKU_MANUAL) / 3600).toFixed(1);

    return { totalSkus, uniqueProducts, duplicatesRemoved, reductionPercent, hoursSaved };
  }, [data, groupedData]);

  const getConfidenceColor = (score) => {
    if (score >= 95) return 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
    if (score >= 80) return 'text-amber-700 bg-amber-50 border-amber-200/60';
    return 'text-rose-700 bg-rose-50 border-rose-200/60';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-2.5 rounded-lg shadow-sm">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Catalog Intelligence Agent</h1>
              <p className="text-slate-500 text-sm mt-0.5">Automated SKU Resolution • Inspired by BetterBasket</p>
            </div>
          </div>
          {data && (
            <button 
              onClick={() => {setData(null); setFile(null);}}
              className="text-sm font-medium text-slate-500 hover:text-zinc-900 transition-colors bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm hover:shadow"
            >
              Reset Environment
            </button>
          )}
        </header>

        {/* UPLOAD & DEMO SECTION */}
        {!data && (
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200/60 flex flex-col items-center justify-center">
            
            {/* HOW IT WORKS */}
            <div className="mb-8 w-full max-w-md bg-slate-50/80 border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-sm text-zinc-900 mb-4 uppercase tracking-wide">How it works</h3>
              <ol className="text-sm text-slate-600 space-y-3 list-decimal list-inside font-medium">
                <li>Upload messy grocery catalog</li>
                <li>AI normalizes product names</li>
                <li>Similar products are grouped into families</li>
                <li>Business impact metrics are generated</li>
              </ol>
            </div>

            {/* UPLOAD DROPZONE */}
            <div className="w-full max-w-md border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center text-center hover:bg-slate-50 hover:border-emerald-400 transition-all group relative mb-8">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="bg-slate-100 group-hover:bg-emerald-50 p-4 rounded-full transition-colors mb-4">
                <FileJson className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {file ? file.name : "Drop retailer CSV here"}
              </h3>
              <p className="text-slate-500 text-xs mt-2">
                {file ? "Ready to process." : "Or click to browse files. Must contain a 'name' column."}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button 
                onClick={loadSampleData}
                disabled={loading}
                className="flex-1 bg-white text-zinc-900 border border-slate-200 px-6 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                {loading && !file ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-500" fill="currentColor" />
                )}
                Try Sample Catalog
              </button>

              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex-1 bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                {loading && file ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  'Run Resolution'
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-6 text-center max-w-md leading-relaxed">
              <strong>Sample Catalog</strong> uses pre-computed normalization results for faster demonstration. <br/>
              <strong>Custom uploads</strong> are processed live using Gemini.
            </p>
          </div>
        )}

        {/* RESULTS DASHBOARD */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* BUSINESS IMPACT SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="bg-zinc-900 px-6 py-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h2 className="text-white font-medium">Business Impact Summary</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-6 flex flex-col gap-1 bg-slate-50/30">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total SKUs Processed</span>
                  <strong className="text-3xl font-bold text-zinc-900">{businessImpact.totalSkus}</strong>
                </div>

                <div className="p-6 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> Unique Core Products
                  </div>
                  <strong className="text-3xl font-bold text-zinc-900">{businessImpact.uniqueProducts}</strong>
                  <span className="text-xs text-slate-500 mt-1">({businessImpact.duplicatesRemoved} duplicates removed)</span>
                </div>

                <div className="p-6 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" /> Catalog Reduction
                  </div>
                  <strong className="text-3xl font-bold text-emerald-600">{businessImpact.reductionPercent}%</strong>
                  <span className="text-xs text-slate-500 mt-1">Cleaner database</span>
                </div>

                <div className="p-6 flex flex-col gap-1 bg-slate-50/30">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Manual Hours Saved
                  </div>
                  <strong className="text-3xl font-bold text-blue-600">{businessImpact.hoursSaved}h</strong>
                  <span className="text-xs text-slate-500 mt-1">Assuming 30s per SKU</span>
                </div>
              </div>
            </div>

            {/* FAMILIES GRID */}
            <div className="grid gap-5">
              {Object.entries(groupedData).map(([family, items]) => (
                <div key={family} className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  
                  {/* Family Header */}
                  <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-200/60 flex items-center gap-3">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-800">{family}</h3>
                    <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-200/50 px-2.5 py-0.5 rounded-full">
                      {items.length} variants unified
                    </span>
                  </div>

                  {/* List Items */}
                  <div className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <div key={idx} className="px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                        
                        {/* Data Transformation View */}
                        <div className="flex flex-col gap-2">
                          <span className="font-semibold text-zinc-900 text-base">
                            {item.normalized}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                            <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-400 text-[10px] font-bold uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">Raw Input:</span>
                            <span className="font-mono text-xs">{item.original}</span>
                          </div>
                          
                          {(item.brand || item.size) && (
                            <div className="flex items-center gap-2 mt-1">
                              {item.brand && (
                                <span className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md shadow-sm">
                                  Brand: <strong className="text-zinc-700">{item.brand}</strong>
                                </span>
                              )}
                              {item.size && (
                                <span className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md shadow-sm">
                                  Size: <strong className="text-zinc-700">{item.size}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Confidence Score */}
                        <div className={`shrink-0 px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md border uppercase ${getConfidenceColor(item.confidence)} opacity-90 group-hover:opacity-100 transition-opacity self-start sm:self-center`}>
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