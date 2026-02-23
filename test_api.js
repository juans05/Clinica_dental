const axios = require('axios');

async function test() {
    try {
        // We don't have the token easily, but we can check if the server responds at least
        const res = await axios.get('http://localhost:3000/api/patients/4');
        console.log('API Response:', res.status, res.data);
    } catch (e) {
        console.log('API Error:', e.response?.status, e.response?.data);
    }
}

test();
