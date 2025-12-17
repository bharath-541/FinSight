import api from './api';

const financeService = {
  // Assets
  async getAssets() {
    const response = await api.get('/assets');
    return response.data.data || response.data;
  },

  async createAsset(assetData) {
    const response = await api.post('/assets', assetData);
    return response.data.data || response.data;
  },

  async updateAsset(assetId, assetData) {
    const response = await api.put(`/assets/${assetId}`, assetData);
    return response.data.data || response.data;
  },

  async deleteAsset(assetId) {
    const response = await api.delete(`/assets/${assetId}`);
    return response.data.data || response.data;
  },

  // Debts
  async getDebts() {
    const response = await api.get('/debts');
    return response.data.data || response.data;
  },

  async createDebt(debtData) {
    const response = await api.post('/debts', debtData);
    return response.data.data || response.data;
  },

  async updateDebt(debtId, debtData) {
    const response = await api.put(`/debts/${debtId}`, debtData);
    return response.data.data || response.data;
  },

  async deleteDebt(debtId) {
    const response = await api.delete(`/debts/${debtId}`);
    return response.data.data || response.data;
  },

  // Pay EMI
  async payEMI(debtId, month) {
    const response = await api.post(`/debts/${debtId}/pay-emi`, { month });
    return response.data.data || response.data;
  },

  // Get expenses (for EMI payment tracking)
  async getExpenses(month) {
    const response = await api.get('/expenses', {
      params: month ? { month } : {}
    });
    return response.data.data || response.data;
  },
};

export default financeService;
