import axios from 'axios';
import i18n from './i18n.js';

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

// Helper function to get current language
const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

// Language change listeners for cache invalidation
const languageChangeListeners = new Set();

// Subscribe to language changes
export const onLanguageChange = (callback) => {
  languageChangeListeners.add(callback);
  return () => languageChangeListeners.delete(callback);
};

// Trigger language change event
const triggerLanguageChange = () => {
  languageChangeListeners.forEach(callback => callback());
};

// Listen to i18n language changes
i18n.on('languageChanged', triggerLanguageChange);

// Helper function to create URL with language parameter
const createUrlWithLang = (baseUrl, params = {}) => {
  const urlParams = new URLSearchParams({
    ...params,
    lang: getCurrentLanguage()
  });
  return `${baseUrl}?${urlParams}`;
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
    const params = { page, page_size: pageSize };
    if (status) params.status = status;
    
    const url = createUrlWithLang('/api/v1/campaigns/paginated', params);
    const response = await api.get(url);
    return response.data;
  },

  // Get public approved campaigns only (for homepage)
  getPublicCampaigns: async (page = 1, pageSize = 10) => {
    const params = { page, page_size: pageSize };
    const url = createUrlWithLang('/api/v1/campaigns/public', params);
    const response = await api.get(url);
    return response.data;
  },

  // Search campaigns by keyword
  searchCampaigns: async (keyword, page = 1, pageSize = 10, status = null) => {
    const params = { 
      keyword, 
      page, 
      page_size: pageSize,
    };
    if (status) params.status = status;
    
    const url = createUrlWithLang('/api/v1/campaigns/search', params);
    const response = await api.get(url);
    return response.data;
  },

  // Get user's campaigns
  getMyCampaigns: async (page = 1, pageSize = 10) => {
    const params = { page, page_size: pageSize };
    const url = createUrlWithLang('/api/v1/campaigns/me/paginated', params);
    const response = await api.get(url);
    return response.data;
  },

  // Get single campaign
  getCampaign: async (id) => {
    const url = createUrlWithLang(`/api/v1/campaigns/${id}`);
    const response = await api.get(url);
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

// Payment API functions
export const paymentAPI = {
  // Create payment intent for donation
  createPaymentIntent: async (donationData) => {
    const response = await api.post('/api/v1/donations/create-payment-intent', donationData);
    return response.data;
  },
  
  // Confirm payment after Stripe processing
  confirmPayment: async (paymentIntentId) => {
    const response = await api.post(`/api/v1/donations/confirm-payment/${paymentIntentId}`);
    return response.data;
  },
  
  // Get donations for a campaign
  getCampaignDonations: async (campaignId, skip = 0, limit = 50) => {
    const response = await api.get(`/api/v1/donations/campaign/${campaignId}?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  // Get donation statistics for a campaign
  getDonationStats: async (campaignId) => {
    const response = await api.get(`/api/v1/donations/stats/${campaignId}`);
    return response.data;
  },
  
  // Get current user's donations
  getMyDonations: async (skip = 0, limit = 50) => {
    const response = await api.get(`/api/v1/donations/my-donations?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};

// Admin API functions
export const adminAPI = {
  // Admin Users Management
  getAllUsers: async (page = 1, pageSize = 10) => {
    const params = { page, page_size: pageSize };
    const url = createUrlWithLang('/api/v1/users', params);
    const response = await api.get(url);
    return response.data;
  },

  // Admin Campaigns Management
  getAllCampaigns: async (page = 1, pageSize = 10, status = null) => {
    const params = { page, page_size: pageSize };
    if (status && status !== 'all') params.status = status;
    
    const url = createUrlWithLang('/api/v1/campaigns/paginated', params);
    const response = await api.get(url);
    return response.data;
  },

  // Update campaign status (admin only)
  updateCampaignStatus: async (id, status) => {
    const response = await api.put(`/api/v1/campaigns/${id}`, { status });
    return response.data;
  },

  // Admin Donations Management
  getAllDonations: async (page = 1, pageSize = 10) => {
    const params = { page, page_size: pageSize };
    const url = createUrlWithLang('/api/v1/donations', params);
    const response = await api.get(url);
    return response.data;
  },

  // Get admin dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/api/v1/admin/stats');
    return response.data;
  },

  // Get campaign statistics for admin
  getCampaignStats: async () => {
    // Fetch all campaigns using multiple pages (since max page_size is 100)
    let allCampaigns = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const response = await api.get(`/api/v1/campaigns/paginated?page=${currentPage}&page_size=100`);
      allCampaigns.push(...(response.data.items || []));
      totalPages = response.data.pagination?.total_pages || 1;
      currentPage++;
    } while (currentPage <= totalPages);
    
    return {
      totalCampaigns: allCampaigns.length,
      activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
      pendingCampaigns: allCampaigns.filter(c => c.status === 'pending').length,
      completedCampaigns: allCampaigns.filter(c => c.status === 'completed').length,
      totalRaised: allCampaigns.reduce((sum, c) => sum + (c.current_amount || 0), 0),
      totalTarget: allCampaigns.reduce((sum, c) => sum + (c.target_amount || 0), 0),
    };
  },

  // Get donation statistics for admin
  getDonationStats: async () => {
    // Since we don't have a direct admin donations endpoint, we'll calculate from campaign donations
    // Fetch all campaigns using multiple pages
    let allCampaigns = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const response = await api.get(`/api/v1/campaigns/paginated?page=${currentPage}&page_size=100`);
      allCampaigns.push(...(response.data.items || []));
      totalPages = response.data.pagination?.total_pages || 1;
      currentPage++;
    } while (currentPage <= totalPages);
    
    let totalDonations = 0;
    let totalAmount = 0;
    
    for (const campaign of allCampaigns) {
      totalAmount += campaign.current_amount || 0;
      // Estimate donations count based on average donation
      if (campaign.current_amount > 0) {
        totalDonations += Math.max(1, Math.floor(campaign.current_amount / 100)); // Estimate
      }
    }
    
    return {
      totalDonations,
      totalAmount,
      averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0,
      pendingDonations: 0, // Would need specific endpoint
    };
  },

  // Get donation trends data for charts
  getDonationTrends: async (days = 30) => {
    try {
      const response = await api.get(`/api/v1/analytics/donation-trends?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation trends:', error);
      throw error;
    }
  },

  // Get category distribution data
  getCategoryDistribution: async () => {
    try {
      const response = await api.get('/api/v1/analytics/category-distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      throw error;
    }
  },
};

// Analytics API functions
export const analyticsAPI = {
  // Get weekly analytics data
  getWeeklyAnalytics: async (weeks = 16) => {
    const response = await api.get(`/api/v1/analytics/weekly-overview?weeks=${weeks}`);
    return response.data;
  },
};

export default api;