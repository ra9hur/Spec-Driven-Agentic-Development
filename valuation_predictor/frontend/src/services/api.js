const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function submitValuationData(formData) {
  const response = await fetch(`${BACKEND_URL}/api/v1/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Server returned execution exception: ${response.status}`);
  }

  return response.json();
}
