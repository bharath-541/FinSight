import api from './api';

const expenseService = {
  // Get all expenses (optionally filtered by month YYYY-MM)
  async getExpenses(month) {
    const params = month ? { month } : {};
    const response = await api.get('/expenses', { params });
    return response.data.data || response.data;
  },

  // Create new expense
  async createExpense(expenseData) {
    const response = await api.post('/expenses', expenseData);
    return response.data.data || response.data;
  },

  // Update existing expense
  async updateExpense(id, expenseData) {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data.data || response.data;
  },

  // Delete expense
  async deleteExpense(id) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data.data || response.data;
  },
};

export default expenseService;
