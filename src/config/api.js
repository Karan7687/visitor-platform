// API Configuration
// Using Render backend for production deployment

export const API_BASE_URL = 'https://expo-lead-generation.onrender.com';

export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: `${API_BASE_URL}/api/mobile/login`,
  REGISTER: `${API_BASE_URL}/api/mobile/register`,
  GET_USER: (id) => `${API_BASE_URL}/api/mobile/${id}`,
  
  // Visitor endpoints
  VISITORS: `${API_BASE_URL}/api/visitors`,
  CHECK_PHONE: (phone) => `${API_BASE_URL}/api/visitors/check-phone/${phone}`,
  PHONE_SUGGESTIONS: (query) => `${API_BASE_URL}/api/visitors/phone-suggestions/${query}`,
  
  // General endpoints
  HEALTH: `${API_BASE_URL}/health`,
  PING: `${API_BASE_URL}/ping`,
  COMPANIES: `${API_BASE_URL}/companies`,
};

// Helper function to test API connectivity
export const testApiConnection = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};