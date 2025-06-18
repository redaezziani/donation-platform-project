import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to convert image paths to full URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If image path already starts with http, it's already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Otherwise, append it to the API base URL
  return `${API_BASE_URL}/${imagePath}`;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },
};

// Campaigns API functions
export const campaignsAPI = {
  // Get all campaigns with pagination
  getCampaigns: async (page = 1, pageSize = 10, status = null) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (status) params.append('status', status);
    
    const response = await api.get(`/api/v1/campaigns/paginated?${params}`);
    return response.data;
  },

  // Get public approved campaigns only (for homepage)
  getPublicCampaigns: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    const response = await api.get(`/api/v1/campaigns/public?${params}`);
    return response.data;
  },

  // Search campaigns by keyword
  searchCampaigns: async (keyword, page = 1, pageSize = 10, status = null) => {
    const params = new URLSearchParams({ 
      keyword, 
      page, 
      page_size: pageSize 
    });
    if (status) params.append('status', status);
    
    const response = await api.get(`/api/v1/campaigns/search?${params}`);
    return response.data;
  },

  // Get user's campaigns
  getMyCampaigns: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    const response = await api.get(`/api/v1/campaigns/me/paginated?${params}`);
    return response.data;
  },

  // Get single campaign
  getCampaign: async (id) => {
    const response = await api.get(`/api/v1/campaigns/${id}`);
    return response.data;
  },

  // Create campaign
  createCampaign: async (formData) => {
    const response = await api.post('/api/v1/campaigns/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    const response = await api.put(`/api/v1/campaigns/${id}`, campaignData);
    return response.data;
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    await api.delete(`/api/v1/campaigns/${id}`);
  },
};

export default api;