/**
 * Google OAuth Service
 * Handles Google OAuth 2.0 authentication flow
 */

const axios = require('axios');
const config = require('../config/environment');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * Generate Google OAuth authorization URL
 * @param {string} state - CSRF protection state parameter
 * @returns {string} - Authorization URL to redirect user to
 */
function getAuthorizationUrl(state) {
  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent screen to get refresh token
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from Google
 * @returns {Promise<Object>} - Token response from Google
 */
async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      redirect_uri: config.oauth.google.redirectUri,
      grant_type: 'authorization_code',
    });

    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for token');
  }
}

/**
 * Get user information from Google
 * @param {string} accessToken - Access token from Google
 * @returns {Promise<Object>} - User info from Google
 */
async function getUserInfo(accessToken) {
  try {
    const response = await axios.get(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    throw new Error('Failed to fetch user information from Google');
  }
}

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
};
