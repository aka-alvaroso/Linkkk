/**
 * GitHub OAuth Service
 * Handles GitHub OAuth 2.0 authentication flow
 */

const axios = require('axios');
const config = require('../config/environment');

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USERINFO_URL = 'https://api.github.com/user';
const GITHUB_USER_EMAILS_URL = 'https://api.github.com/user/emails';

/**
 * Generate GitHub OAuth authorization URL
 * @param {string} state - CSRF protection state parameter
 * @returns {string} - Authorization URL to redirect user to
 */
function getAuthorizationUrl(state) {
  const params = new URLSearchParams({
    client_id: config.oauth.github.clientId,
    redirect_uri: config.oauth.github.redirectUri,
    scope: 'user:email',
    state: state,
  });

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from GitHub
 * @returns {Promise<Object>} - Token response from GitHub
 */
async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(
      GITHUB_TOKEN_URL,
      {
        code,
        client_id: config.oauth.github.clientId,
        client_secret: config.oauth.github.clientSecret,
        redirect_uri: config.oauth.github.redirectUri,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for token');
  }
}

/**
 * Get user information from GitHub
 * @param {string} accessToken - Access token from GitHub
 * @returns {Promise<Object>} - User info from GitHub (includes email)
 */
async function getUserInfo(accessToken) {
  try {
    // Get basic user info
    const userResponse = await axios.get(GITHUB_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const userData = userResponse.data;

    // If email is not public, fetch from emails endpoint
    if (!userData.email) {
      const emailsResponse = await axios.get(GITHUB_USER_EMAILS_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      // Find primary verified email
      const primaryEmail = emailsResponse.data.find(
        (email) => email.primary && email.verified
      );

      if (primaryEmail) {
        userData.email = primaryEmail.email;
      }
    }

    // Return normalized data structure similar to Google
    return {
      id: userData.id.toString(), // GitHub returns numeric ID, convert to string
      email: userData.email,
      name: userData.name || userData.login, // Use login as fallback if name is null
      login: userData.login, // GitHub username
    };
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    throw new Error('Failed to fetch user information from GitHub');
  }
}

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
};
