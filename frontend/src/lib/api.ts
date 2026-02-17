const API_BASE_URL = 'http://localhost:3001'; // The backend port

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const api = {
  get: async (path: string) => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, { headers });
    return res.json();
  },

  post: async (path: string, data: any) => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  put: async (path: string, data: any) => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export default api;
