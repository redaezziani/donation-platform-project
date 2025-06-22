import axios from 'axios';
import i18n from './i18n.js';

// Base API configuration - use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  
  // If it already starts with API_BASE_URL, return as is
  if (imagePath.startsWith(API_BASE_URL)) return imagePath;
  
  // Handle different path formats
  let cleanPath = imagePath;
  
  // Remove leading slash if present
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // If path doesn't start with uploads/, prepend it
  if (!cleanPath.startsWith('uploads/')) {
    // Handle cases where it might be campaigns/filename.jpg
    if (cleanPath.includes('/') && !cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    } else {
      // Single filename, assume it's in campaigns folder
      cleanPath = `uploads/campaigns/${cleanPath}`;
    }
  }
  
  // Construct final URL
  return `${API_BASE_URL}/${cleanPath}`;
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

  // Get featured campaigns (first 3 active campaigns)
  getFeaturedCampaigns: async () => {
    const url = createUrlWithLang('/api/v1/campaigns/featured');
    const response = await api.get(url);
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
  // Admin Users Management - Updated to work with existing schema
  getAllUsers: async (page = 1, pageSize = 10, status = null, role = null) => {
    const params = { page, page_size: pageSize };
    // Remove status filter since is_suspended doesn't exist yet
    if (role && role !== 'all') params.role = role;
    
    const url = `/api/v1/users?${new URLSearchParams(params)}`;
    const response = await api.get(url);
    return response.data;
  },

  // Update user status (admin only) - simplified for existing schema
  updateUserStatus: async (id, status) => {
    // For now, we can only toggle is_active since is_suspended doesn't exist
    const isActive = status === 'active';
    const response = await api.put(`/api/v1/users/${id}/status`, { status: isActive ? 'active' : 'inactive' });
    return response.data;
  },

  // Get user statistics for admin - Updated to work with existing schema
  getUserStats: async () => {
    try {
      const response = await api.get('/api/v1/users?page_size=1000'); // Get all users
      const users = response.data.items || [];
      
      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active === true).length,
        suspendedUsers: users.filter(u => u.is_active === false).length, // Use inactive as suspended
        adminUsers: users.filter(u => u.is_admin === true).length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        adminUsers: 0,
      };
    }
  },

  // Admin Campaigns Management
  getAllCampaigns: async (page = 1, pageSize = 10, status = null, lang = null) => {
    const params = { page, page_size: pageSize };
    if (status && status !== 'all') params.status = status;
    if (lang && lang !== 'all') params.lang = lang;
    
    // Use admin-specific endpoint that shows all languages by default
    const url = `/api/v1/campaigns/admin/paginated?${new URLSearchParams(params)}`;
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

  // Get comprehensive analytics data
  getComprehensiveAnalytics: async () => {
    try {
      const response = await api.get('/api/v1/analytics/comprehensive');
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      throw error;
    }
  },

  // Get donation trends
  getDonationTrends: async (days = 30) => {
    try {
      const response = await api.get(`/api/v1/analytics/donation-trends?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation trends:', error);
      throw error;
    }
  },

  // Get category distribution
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

// Newsletter API functions
export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: async (email, source = 'footer', language = 'en') => {
    try {
      const response = await api.post('/api/v1/newsletter/subscribe', {
        email,
        source,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email) => {
    try {
      const response = await api.post('/api/v1/newsletter/unsubscribe', {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      throw error;
    }
  },

  // Get subscription status
  getSubscriptionStatus: async (email) => {
    try {
      const response = await api.get(`/api/v1/newsletter/subscription/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  },

  // Get newsletter statistics (admin only)
  getStats: async () => {
    try {
      const response = await api.get('/api/v1/newsletter/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting newsletter stats:', error);
      throw error;
    }
  },

  // Get newsletter subscribers (admin only)
  getSubscribers: async (page = 1, pageSize = 50) => {
    try {
      const response = await api.get(`/api/v1/newsletter/subscribers?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error getting newsletter subscribers:', error);
      throw error;
    }
  },

  // Test email sending (admin only)
  testEmail: async () => {
    try {
      const response = await api.post('/api/v1/newsletter/test-email');
      return response.data;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  },

  // Create test campaign (admin only)
  createTestCampaign: async () => {
    try {
      const response = await api.post('/api/v1/newsletter/test-campaign');
      return response.data;
    } catch (error) {
      console.error('Error creating test campaign:', error);
      throw error;
    }
  },
};

export default api;