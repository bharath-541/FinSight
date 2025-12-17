import api from './api';

const authService = {
  // Register new user
  async register(name, email, password) {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    
    if (response.data.data?.token) {
      localStorage.setItem('finsight_token', response.data.data.token);
      localStorage.setItem('finsight_user', JSON.stringify(response.data.data.user));
    }
    
    return response.data.data;
  },

  // Login user
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.data?.token) {
      localStorage.setItem('finsight_token', response.data.data.token);
      localStorage.setItem('finsight_user', JSON.stringify(response.data.data.user));
    }
    
    return response.data.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem('finsight_token');
    localStorage.removeItem('finsight_user');
  },

  // Get current token
  getToken() {
    return localStorage.getItem('finsight_token');
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('finsight_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;
