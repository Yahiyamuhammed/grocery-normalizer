import { useState, useMemo } from 'react';
import { UploadCloud, Loader2, Database, FileJson, Layers, CornerDownRight, Zap, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { uploadCsvForNormalization } from './api/productApi';

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
    
    // Avoid division by zero edge case
    const reductionPercent = totalSkus > 0 ? Math.round((duplicatesRemoved / totalSkus) * 100) : 0;
    
    // Assuming a human analyst takes ~30 seconds to manually review, standardize, and map 1 messy SKU
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
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Athena Engine</h1>
              <p className="text-slate-500 text-sm mt-0.5">Automated SKU Resolution Prototype</p>
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

        {/* UPLOAD SECTION */}
        {!data && (
          <div className="bg-white p-12 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200/60 flex flex-col items-center justify-center space-y-8">
            <div className="w-full max-w-md border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center text-center hover:bg-slate-50 hover:border-emerald-400 transition-all group relative">
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

            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-zinc-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  Processing Graph...
                </>
              ) : (
                'Run Resolution Engine'
              )}
            </button>
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