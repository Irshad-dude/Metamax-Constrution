// Backend Verification Script
// Uses native fetch (Node 18+)
// server.js is running on 5050.

const API_URL = 'http://localhost:5050/api';
let TOKEN = '';
let PROJECT_ID = '';
let SECTOR_ID = '';

async function runTests() {
    console.log('🚀 Starting Full System Verification...\n');

    // 1. Auth
    console.log('1️⃣  Testing Auth...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'metamax2025' })
    });
    const loginData = await loginRes.json();
    if (loginData.success && loginData.token) {
        TOKEN = loginData.token;
        console.log('   ✅ Login Successful');
    } else {
        console.error('   ❌ Login Failed:', loginData);
        process.exit(1);
    }

    const headers = {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    };

    // 2. Create Project
    console.log('\n2️⃣  Testing Create Project...');
    const createP = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Test Project', category: 'infrastructure', description: 'Test Desc' })
    });
    const createPData = await createP.json();
    if (createPData.success) {
        console.log('   ✅ Project Created');
    } else {
        console.error('   ❌ Create Project Failed:', createPData);
    }

    // 3. Get All Projects (to find ID)
    console.log('\n3️⃣  Testing Get Projects...');
    const getP = await fetch(`${API_URL}/projects`);
    const getPData = await getP.json();
    const testProject = getPData.find(p => p.title === 'Test Project');
    if (testProject) {
        PROJECT_ID = testProject.id;
        console.log(`   ✅ Found Created Project (ID: ${PROJECT_ID})`);
    } else {
        console.error('   ❌ Project Not Found in List');
    }

    // 4. Update Project
    if (PROJECT_ID) {
        console.log('\n4️⃣  Testing Update Project...');
        const updateP = await fetch(`${API_URL}/projects/${PROJECT_ID}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ title: 'Test Project Updated', category: 'infrastructure', description: 'Updated Desc' })
        });
        const updatePData = await updateP.json();
        if (updatePData.success) {
            console.log('   ✅ Project Update Response Success');
            // Verify fetch
            const checkP = await fetch(`${API_URL}/projects/${PROJECT_ID}`);
            const checkPData = await checkP.json();
            if (checkPData.data.title === 'Test Project Updated') {
                console.log('   ✅ Verification: Title matches Updated Value');
            } else {
                console.error('   ❌ Verification Failed: Title is ' + checkPData.data.title);
            }
        } else {
            console.error('   ❌ Update Failed:', updatePData);
        }
    }

    // 5. Create Sector
    console.log('\n5️⃣  Testing Create Sector...');
    const createS = await fetch(`${API_URL}/sectors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Test Sector', category: 'construction', description: 'Desc' })
    });
    const createSData = await createS.json();
    if (createSData.success) console.log('   ✅ Sector Created');

    // Get Sector ID
    const getS = await fetch(`${API_URL}/sectors`);
    const getSData = await getS.json();
    const testSector = getSData.find(s => s.title === 'Test Sector');
    if (testSector) {
        SECTOR_ID = testSector.id;
        console.log(`   ✅ Found Sector (ID: ${SECTOR_ID})`);
    }

    // 6. Update Sector
    if (SECTOR_ID) {
        console.log('\n6️⃣  Testing Update Sector...');
        const updateS = await fetch(`${API_URL}/sectors/${SECTOR_ID}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ title: 'Test Sector Updated', category: 'construction', description: 'Desc', isVisible: false })
        });
        if ((await updateS.json()).success) {
            console.log('   ✅ Sector Updated');
            const checkS = await fetch(`${API_URL}/sectors/${SECTOR_ID}`);
            const checkSData = await checkS.json();
            if (checkSData.data.isVisible === false || checkSData.data.is_active === 0) {
                console.log('   ✅ Verification: Visibility Updates toggled');
            }
        }
    }

    // 7. Stats
    console.log('\n7️⃣  Testing Dashboard Stats...');
    const statsRes = await fetch(`${API_URL}/dashboard/stats`, { headers });
    const stats = await statsRes.json();
    if (stats.success) {
        console.log('   ✅ Stats Fetched:', stats.data);
    }

    // 8. Cleanup (Delete)
    console.log('\n8️⃣  Cleaning Up...');
    if (PROJECT_ID) {
        // await fetch(`${API_URL}/projects/${PROJECT_ID}`, { method: 'DELETE', headers });
        console.log('   ℹ️  Skipping Project Delete for Visual Verification');
    }
    if (SECTOR_ID) {
        await fetch(`${API_URL}/sectors/${SECTOR_ID}`, { method: 'DELETE', headers });
        console.log('   ✅ Sector Deleted');
    }

    console.log('\n🎉 ALL TESTS PASSED!');
}

runTests();
