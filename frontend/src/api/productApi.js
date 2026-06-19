const API_BASE_URL = 'http://localhost:5001/api/v1';

export const normalizeProductCatalog = async (productNames) => {
    console.log('calling api');
    
  const response = await fetch(`${API_BASE_URL}/matching/normalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: productNames }),
  });

  if (!response.ok) {
    throw new Error('Failed to normalize products');
  }

  const result = await response.json();
  return result.data;
};