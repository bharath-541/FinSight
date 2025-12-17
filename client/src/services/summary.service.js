import api from './api';

const summaryService = {
  // Get budget summary for a specific month (YYYY-MM)
  async getSummary(month) {
    const params = month ? { month } : {};
    const response = await api.get('/summary', { params });
    return response.data.data || response.data; // Handle both response structures
  },
};

export default summaryService;
