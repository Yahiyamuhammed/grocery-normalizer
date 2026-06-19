import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import 'dotenv/config';


// Initialize Gemini

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processCsvAndMatch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded." });
    }

    const results = [];
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    // Parse the CSV from memory buffer
    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csvParser())
        .on('data', (data) => {
          // Assuming CSV has a 'name' column. Fallback to first column if missing.
          const productName = data.name || Object.values(data)[0];
          if (productName) results.push(productName);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      return res.status(400).json({ error: "CSV appears to be empty or missing data." });
    }

    // Call Gemini with Structured JSON Output
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              original: { type: SchemaType.STRING },
              normalized: { type: SchemaType.STRING },
              family: { type: SchemaType.STRING },
              brand: { type: SchemaType.STRING },
              size: { type: SchemaType.STRING },
              confidence: { type: SchemaType.NUMBER }
            },
            required: ["original", "normalized", "family", "confidence"]
          }
        }
      }
    });

    const prompt = `
      You are an AI product matching system used by grocery retailers.
      Your goal is to normalize the following messy grocery product names.
      
      For each product:
      1. Normalize the product name.
      2. Detect spelling mistakes and correct them.
      3. Standardize units (e.g., '12 oz' to '12oz').
      4. Assign a broad product family so identical products group together.
      5. Extract the Brand and Size if available.
      6. Assign a confidence score (0-100) on your normalization accuracy.

      Products:
      ${JSON.stringify(results)}
    `;

    const response = await model.generateContent(prompt);
    const aiData = JSON.parse(response.response.text());

    return res.status(200).json({ data: aiData });
  } catch (error) {
    console.error("AI Processing Error:", error);
    return res.status(500).json({ error: "Failed to process catalog data." });
  }
};