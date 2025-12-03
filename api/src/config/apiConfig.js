require('dotenv').config();

const apiConfig = {
  baseUrl: process.env.API_BASE_URL || '',
};

module.exports = apiConfig;
