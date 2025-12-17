import api from './api';

const userService = {
  // Get current user profile
  async getProfile() {
    const response = await api.get('/user/me');
    return response.data.data || response.data; // Handle nested data structure
  },

  // Update monthly income
  async updateIncome(monthlyIncome) {
    const response = await api.put('/user/income', { monthlyIncome });
    
    // Update cached user data
    const userStr = localStorage.getItem('finsight_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.monthlyIncome = monthlyIncome;
      localStorage.setItem('finsight_user', JSON.stringify(user));
    }
    
    return response.data.data || response.data;
  },
};

export default userService;
