export const normalizeProducts = async (req, res) => {
  try {    
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid product array provided" });
    }

    // TODO: Pass 'products' array to Gemini API here.
    // For now, we return a mock payload mimicking your exact schema.
    const mockResponse = products.map((product, index) => ({
      original: product,
      normalized: `Standardized ${product.split(' ')[0]}`,
      family: product.split(' ')[0],
      brand: product.split(' ')[0],
      size_value: 12,
      size_unit: "oz",
      confidence: Math.floor(Math.random() * (100 - 85 + 1)) + 85
    }));

    return res.status(200).json({ data: mockResponse });
  } catch (error) {
    console.error("Error standardizing products:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};