const fetch = require('node-fetch');

async function testSettings() {
    try {
        const res = await fetch('http://localhost:5000/api/settings');
        const data = await res.json();
        console.log('Current Settings:', data);
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testSettings();
