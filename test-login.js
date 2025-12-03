const axios = require('axios');

(async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@Ecity.com',
            password: 'admin'
        });
        console.log('Login successful:', response.data);
    } catch (error) {
        console.error('Login error:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Full error:', error.message);
    }
})();
