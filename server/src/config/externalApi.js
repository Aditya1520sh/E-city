const axios = require('axios');
const { baseUrl } = require('./apiConfig');

function getExternalApi() {
  if (!baseUrl) {
    throw new Error('Missing API_BASE_URL in environment.');
  }
  return axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

module.exports = { getExternalApi };
