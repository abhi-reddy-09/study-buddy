const API_BASE_URL = 'http://localhost:5000';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const buildHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
};

const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE_URL}${path}`, { headers: buildHeaders() });
    return handleResponse(res);
  },

  post: async (path: string, data?: any) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(res);
  },

  put: async (path: string, data?: any) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(res);
  },

  delete: async (path: string) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

export default api;
