const csv = require('csv-parser');
const { Readable } = require('stream');
const { processProductNames } = require('../services/geminiService');

const normalizeCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No CSV catalog file uploaded." });
  }

  const rawRows = [];
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on('data', (data) => rawRows.push(data))
    .on('end', async () => {
      try {
        // Extract names to run batch parsing
        const uniqueNames = [...new Set(rawRows.map(row => row.name))];
        
        // Pass to Gemini Service for structural processing
        const normalizedMetaList = await processProductNames(uniqueNames);

        // Map Gemini's intelligence back to the original client transaction arrays (prices/skus)
        const combinedResults = rawRows.map(row => {
          const meta = normalizedMetaList.find(m => m.original === row.name) || {
            normalized: row.name,
            family: "Unclassified",
            brand: "Unknown",
            size_value: "",
            size_unit: "",
            confidence: 50
          };

          return {
            sku: row.sku,
            price: parseFloat(row.price) || 0.00,
            ...meta
          };
        });

        return res.json({ success: true, data: combinedResults });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });
};

module.exports = { normalizeCSV };