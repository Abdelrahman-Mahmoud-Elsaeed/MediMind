const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const authService = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || 'Login failed');
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    
    return data.data;
  },
  
  async register(userData) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || 'Registration failed');
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    
    return data.data;
  },
  
  async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`,
      },
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    
    return res.ok;
  },
  
  getAccessToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }
};
