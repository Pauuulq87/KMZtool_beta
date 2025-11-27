const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';
const TEST_USER = {
    email: `mission_test${Date.now()}@example.com`,
    password: 'password123',
    name: 'Mission Tester'
};

async function testMissions() {
    console.log('Starting Mission API Tests...');

    // 1. Register & Login to get token
    console.log('\n1. Authenticating...');
    let response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });
    let data = await response.json();

    if (response.status !== 201) {
        console.error('Register failed:', data);
        process.exit(1);
    }
    const token = data.token;
    console.log('Authenticated. Token received.');

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 2. Create Mission
    console.log('\n2. Creating Mission...');
    const newMission = {
        name: 'Test Mission 1',
        settings: { altitude: 50, speed: 5 },
        waypoints: [{ lat: 25.0, lng: 121.5 }, { lat: 25.1, lng: 121.6 }],
        pois: []
    };

    response = await fetch(`${BASE_URL}/missions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newMission)
    });
    data = await response.json();

    if (response.status !== 201) {
        console.error('Create Mission failed:', data);
        process.exit(1);
    }
    console.log('Mission created:', data.id);
    const missionId = data.id;

    // 3. List Missions
    console.log('\n3. Listing Missions...');
    response = await fetch(`${BASE_URL}/missions`, { headers });
    data = await response.json();

    if (response.status !== 200 || !Array.isArray(data)) {
        console.error('List Missions failed:', data);
        process.exit(1);
    }
    console.log(`Found ${data.length} missions.`);
    const found = data.find(m => m.id === missionId);
    if (!found) {
        console.error('Created mission not found in list!');
        process.exit(1);
    }

    // 4. Get Mission Details
    console.log('\n4. Getting Mission Details...');
    response = await fetch(`${BASE_URL}/missions/${missionId}`, { headers });
    data = await response.json();

    if (response.status !== 200 || data.name !== newMission.name) {
        console.error('Get Mission failed:', data);
        process.exit(1);
    }
    console.log('Mission details verified.');

    // 5. Update Mission
    console.log('\n5. Updating Mission...');
    const updateData = { name: 'Updated Mission Name' };
    response = await fetch(`${BASE_URL}/missions/${missionId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
    });
    data = await response.json();

    if (response.status !== 200 || data.name !== updateData.name) {
        console.error('Update Mission failed:', data);
        process.exit(1);
    }
    console.log('Mission updated.');

    // 6. Delete Mission
    console.log('\n6. Deleting Mission...');
    response = await fetch(`${BASE_URL}/missions/${missionId}`, {
        method: 'DELETE',
        headers
    });

    if (response.status !== 200) {
        console.error('Delete Mission failed');
        process.exit(1);
    }
    console.log('Mission deleted.');

    // 7. Verify Deletion
    console.log('\n7. Verifying Deletion...');
    response = await fetch(`${BASE_URL}/missions/${missionId}`, { headers });
    if (response.status !== 404) {
        console.error('Mission still exists after deletion!');
        process.exit(1);
    }
    console.log('Deletion verified.');

    console.log('\nAll Mission tests passed!');
}

testMissions().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
