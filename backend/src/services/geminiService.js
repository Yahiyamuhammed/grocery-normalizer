const { GoogleGenAI, Type } = require('@google/generative-ai');

// Ensure you use standard configuration for initializing the client
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Enforce a strict JSON Schema output from Gemini
const responseSchema = {
  type: Type.ARRAY,
  description: "List of normalized and parsed product data matching the input array.",
  items: {
    type: Type.OBJECT,
    properties: {
      original: { type: Type.STRING, description: "The exact original string passed into the system." },
      normalized: { type: Type.STRING, description: "The corrected, standardized full name of the product." },
      family: { type: Type.STRING, description: "The generalized product grouping/family name." },
      brand: { type: Type.STRING, description: "The extracted manufacturer brand name." },
      size_value: { type: Type.STRING, description: "The numeric size or volume string." },
      size_unit: { type: Type.STRING, description: "The metric or imperial unit of measurement." },
      confidence: { type: Type.INTEGER, description: "A system confidence score from 0 to 100." }
    },
    required: ["original", "normalized", "family", "brand", "confidence"]
  }
};

const processProductNames = async (productNames) => {
  try {
    // Using gemini-2.5-flash as it is highly efficient for structured data tasks
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const prompt = `
      You are an elite grocery retail catalog normalization engine. Your objective is to build a clean master product ledger.
      Analyze the following list of raw, messy, mismatched grocery item descriptions.
      
      Tasks:
      1. Correct typographical errors, abbreviations, and clear misspellings.
      2. Standardize case and unit structures (e.g., convert ml to ML or oz to Oz uniformly).
      3. Cluster variations of the exact same product into an identical global 'family'.
      
      Input Products List:
      ${JSON.stringify(productNames)}
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to process catalog metadata via Gemini API.");
  }
};

module.exports = { processProductNames };