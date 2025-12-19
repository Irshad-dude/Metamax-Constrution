
// Backend Verification Script
// Uses native fetch (Node 18+)
// Let's assume fetch is available (Node 18+) or use 'http' module.
// Safest is standard 'http' but it's verbose.
// Let's try 'fetch' first as it's cleaner.

const BASE_URL = 'http://localhost:5050/api';

async function testBackend() {
    console.log('🔍 Starting Backend Verification...\n');

    // 1. Authenticate
    console.log('1️⃣  Testing Admin Login...');
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'metamax2025' })
        });

        const loginData = await loginRes.json();

        if (loginData.success) {
            console.log('✅ Login Successful!');
            console.log(`🔑 Token received: ${loginData.token.substring(0, 20)}...\n`);

            const token = loginData.token;

            // 2. Create Project
            console.log('2️⃣  Creating a Test Project via API...');
            const createRes = await fetch(`${BASE_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: "API Verification Project",
                    category: "automation",
                    description: "This project implies the backend CRUD is working successfully."
                })
            });

            const createData = await createRes.json();
            if (createData.success) {
                console.log('✅ Project Created Successfully!');
                console.log(`📄 Project ID: ${createData.data.id}\n`);
            } else {
                console.log('❌ Project Creation Failed:', createData);
            }

            // 3. List Projects
            console.log('3️⃣  Fetching All Projects...');
            const listRes = await fetch(`${BASE_URL}/projects`);
            const listData = await listRes.json();

            console.log(`✅ Fetched ${listData.length} projects from database.`);
            console.log('📋 Project List:');
            listData.forEach(p => console.log(`   - [${p.category.toUpperCase()}] ${p.title}`));

        } else {
            console.log('❌ Login Failed:', loginData);
        }

    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        console.error('   Ensure server server.js is running on port 5050');
    }
}

testBackend();
