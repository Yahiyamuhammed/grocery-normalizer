const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadCsvForNormalization = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/matching/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to process file');
  }

  const result = await response.json();
  return result.data;
};