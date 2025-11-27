const fetch = require('node-fetch'); // or native fetch if node 18+

const BASE_URL = 'http://localhost:3001/api/auth';
const TEST_USER = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User'
};

async function testAuth() {
    console.log('Starting Auth Tests...');

    // 1. Register
    console.log('\n1. Testing Register...');
    let response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });
    let data = await response.json();

    if (response.status !== 201) {
        console.error('Register failed:', data);
        process.exit(1);
    }
    console.log('Register success:', data.user.email);
    const token = data.token;

    // 2. Login
    console.log('\n2. Testing Login...');
    response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
    });
    data = await response.json();

    if (response.status !== 200) {
        console.error('Login failed:', data);
        process.exit(1);
    }
    console.log('Login success. Token received.');

    // 3. Get Me (Protected)
    console.log('\n3. Testing Get Me...');
    response = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    data = await response.json();

    if (response.status !== 200) {
        console.error('Get Me failed:', data);
        process.exit(1);
    }
    console.log('Get Me success:', data);

    console.log('\nAll tests passed!');
}

testAuth().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
