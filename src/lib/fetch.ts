export async function fetchApi(endpoint: string, params: any, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${baseUrl}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };
  const fetchOptions: RequestInit = {
    ...options,
    headers: defaultHeaders,
    method: "POST",
    body: JSON.stringify(params),
  };
  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchApi:', error);
    throw error;
  }
}
