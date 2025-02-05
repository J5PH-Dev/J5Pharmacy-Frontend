import axios, { AxiosError } from 'axios';
import { CartItem } from '../types/cart';
import { HeldTransaction } from '../types/transaction';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    console.log('Auth Token:', token); // Debug token
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const posApi = {
  // Sales Session
  startSession: async (branchId: number) => {
    try {
      console.log('Starting session for branch:', branchId);
      const response = await axios.post(
        `${BASE_URL}/pos/sessions/start`, 
        { branchId },
        { headers: getAuthHeader() }
      );
      console.log('Start session response:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Start session error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  endSession: async (sessionId: number, totalSales: number) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pos/sessions/end`, 
        { sessionId, totalSales },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('End session error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  getCurrentSession: async (branchId: number) => {
    try {
      console.log('Getting current session for branch:', branchId);
      const headers = getAuthHeader();
      console.log('Request headers:', headers);
      const response = await axios.get(
        `${BASE_URL}/pos/sessions/current/${branchId}`,
        { headers }
      );
      console.log('Get current session response:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Full error object:', axiosError);
      console.error('Error response:', axiosError.response);
      console.error('Error status:', axiosError.response?.status);
      throw error;
    }
  },

  // Product Search
  searchProducts: async (query: string, branchId: number) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/pos/products/search/${branchId}`,
        {
          headers: getAuthHeader(),
          params: { query }
        }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Search products error:', 
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  },

  getProductByBarcode: async (barcode: string, branchId: number) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/pos/products/search/${branchId}`,
        {
          headers: getAuthHeader(),
          params: { barcode }
        }
      );
      return response.data[0] || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Get product by barcode error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Transaction Management
  createTransaction: async (transactionData: any) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pos/transactions`, 
        transactionData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Create transaction error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Hold Transaction Management
  holdTransaction: async (data: any) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pos/transactions/hold`, 
        data,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Hold transaction error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  getHeldTransactions: async (salesSessionId: number) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/pos/transactions/held`,
        {
          headers: getAuthHeader(),
          params: { salesSessionId }
        }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Get held transactions error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  recallTransaction: async (id: number): Promise<HeldTransaction> => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pos/transactions/recall/${id}`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Recall transaction error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  deleteHeldTransaction: async (id: number) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/pos/transactions/held/${id}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Delete held transaction error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Customer Management
  searchCustomers: async (query: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/pos/customers/search`,
        {
          headers: getAuthHeader(),
          params: { query }
        }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Search customers error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  getCustomerPoints: async (customerId: number) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/pos/customers/${customerId}/points`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Get customer points error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  updateCustomerPoints: async (data: any) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pos/customers/points/update`,
        data,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Update customer points error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Returns
  processReturn: async (data: {
    saleId: number;
    items: Array<{
      productId: number;
      quantity: number;
      refundAmount: number;
    }>;
    reason: string;
    pharmacistId: number;
  }) => {
    const response = await axios.post(`${BASE_URL}/returns`, data);
    return response.data;
  },

  getReturn: async (returnId: number) => {
    const response = await axios.get(`${BASE_URL}/returns/${returnId}`);
    return response.data;
  }
}; 