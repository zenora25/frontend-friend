
const axios = require('axios');

const PORT = 5000;
const API_URL = `http://localhost:${PORT}/api`;
const STUDENT_EMAIL = 'john.doe@bazeuniversity.edu.ng';
const SUPERVISOR_EMAIL = 'sarah.johnson@bazeuniversity.edu.ng';
const PASSWORD = 'password123';

async function verifyImages() {
    try {
        console.log('--- Verification Started ---');

        // 1. Login as Student
        console.log('Logging in as student...');
        const studentLogin = await axios.post(`${API_URL}/auth/student/login`, {
            email: STUDENT_EMAIL,
            password: PASSWORD
        });
        const studentToken = studentLogin.data.data?.token || studentLogin.data.token;
        console.log('Student login successful.');

        // 2. Create Logbook with Images
        console.log('Creating logbook with images...');
        const createLbRes = await axios.post(`${API_URL}/logbook`, {
            weekNumber: 17,
            startDate: '2024-05-18',
            endDate: '2024-05-24',
            title: 'Testing Image Transformation V3',
            weekSummary: 'This is a test summary',
            mondayActivities: 'Act 1',
            tuesdayActivities: 'Act 2',
            wednesdayActivities: 'Act 3',
            thursdayActivities: 'Act 4',
            fridayActivities: 'Act 5',
            challengesFaced: 'None',
            lessonsLearned: 'Transformation works',
            skillsAcquired: 'Sequelize hooks',
            images: ['/uploads/logbooks/test-img-1.jpg', '/uploads/logbooks/test-img-2.png']
        }, { headers: { Authorization: `Bearer ${studentToken}` } });

        const lbId = createLbRes.data.logbook.id;
        console.log(`Logbook created with ID: ${lbId}`);

        // 3. Login as Supervisor
        console.log('\nLogging in as supervisor...');
        const supervisorLogin = await axios.post(`${API_URL}/auth/role/login`, {
            email: SUPERVISOR_EMAIL,
            password: PASSWORD,
            role: 'institutionSupervisor'
        });
        const supervisorToken = supervisorLogin.data.data?.token || supervisorLogin.data.token;
        const config = { headers: { Authorization: `Bearer ${supervisorToken}` } };
        console.log('Supervisor login successful.');

        // 4. Check Dashboard
        console.log('\nChecking Dashboard Overview...');
        const dashboardRes = await axios.get(`${API_URL}/institution-supervisors/dashboard/overview`, config);
        const pendingLogbooks = dashboardRes.data.data?.recentActivities?.logbooks ||
            dashboardRes.data.data?.pendingLogbooks ||
            dashboardRes.data.data?.stats?.pendingLogbooks || [];

        console.log(`Dashboard returned ${pendingLogbooks.length} logbooks.`);
        const testLbInDashboard = pendingLogbooks.find(l => l.id === lbId);
        if (testLbInDashboard) {
            console.log('Found test logbook in dashboard.');
            console.log('Images:', JSON.stringify(testLbInDashboard.images, null, 2));
            if (testLbInDashboard.images && testLbInDashboard.images.length > 0 && testLbInDashboard.images[0].url.startsWith('http')) {
                console.log('✅ Dashboard image URL is transformed correctly.');
            } else {
                console.log('❌ Dashboard image URL is NOT transformed or missing.');
            }
        } else {
            console.log('ℹ️ Test logbook not found in dashboard (might be due to sorting or limit).');
            if (pendingLogbooks.length > 0) {
                console.log('First dashboard logbook images:', JSON.stringify(pendingLogbooks[0].images, null, 2));
            }
        }

        // 5. Check Logbook Detail
        console.log(`\nChecking Logbook Detail for ID: ${lbId}...`);
        const detailRes = await axios.get(`${API_URL}/logbook/${lbId}`, config);
        const logbook = detailRes.data.logbook;

        console.log('Logbook detail images:', JSON.stringify(logbook.images, null, 2));
        if (logbook.images && logbook.images.length > 0) {
            if (logbook.images[0].url.startsWith('http')) {
                console.log('✅ Detail image URL is transformed correctly.');
                console.log(`URL example: ${logbook.images[0].url}`);
            } else {
                console.log('❌ Detail image URL is NOT transformed.');
            }
        } else {
            console.log('❌ Logbook detail has no images.');
        }

        console.log('\n--- Verification Completed ---');
    } catch (error) {
        console.error('Verification failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

verifyImages();
