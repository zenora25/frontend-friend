import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api';
const LOGIN_EMAIL = 'john.doe@bazeuniversity.edu.ng';
const LOGIN_PASSWORD = 'password123';

async function reproduce() {
    try {
        // 1. Login
        console.log('🔐 Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/role/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASSWORD,
            role: 'student'
        });
        const token = loginRes.data.token;
        console.log('✅ Login success');

        const authHeader = { Authorization: `Bearer ${token}` };

        // 2. Test Cases

        // Case A: Missing fields
        console.log('\n🧪 Testing Case A: Missing Week Number');
        const formA = new FormData();
        formA.append('title', 'Test title');
        try {
            await axios.post(`${API_URL}/logbook`, formA, { headers: { ...authHeader, ...formA.getHeaders() } });
        } catch (e) {
            console.log('❌ Caught expected 400:', e.response?.data);
        }

        // Case B: Duplicate Week Number (if week 8 exists)
        console.log('\n🧪 Testing Case B: Duplicate Week Number (8)');
        const formB = new FormData();
        formB.append('weekNumber', '8');
        formB.append('startDate', '2024-04-01');
        formB.append('endDate', '2024-04-07');
        formB.append('title', 'Duplicate Week');
        formB.append('weekSummary', 'Summary');
        try {
            await axios.post(`${API_URL}/logbook`, formB, { headers: { ...authHeader, ...formB.getHeaders() } });
        } catch (e) {
            console.log('❌ Caught 400:', e.response?.data);
        }

        // Case C: No files sent
        console.log('\n🧪 Testing Case C: Missing "images" field (No files)');
        const formC = new FormData();
        const randomWeek = Math.floor(Math.random() * 1000) + 100; // Safe random
        formC.append('weekNumber', randomWeek.toString());
        formC.append('startDate', '2024-04-01');
        formC.append('endDate', '2024-04-07');
        formC.append('title', 'No Files Test');
        formC.append('weekSummary', 'This should work even without images');
        try {
            const resC = await axios.post(`${API_URL}/logbook`, formC, { headers: { ...authHeader, ...formC.getHeaders() } });
            console.log('✅ Success without files:', resC.data.message);
        } catch (e) {
            console.error('❌ Failed without files:', e.response?.data || e.message);
        }

    } catch (error) {
        console.error('💥 Script error:', error.message);
    }
}

reproduce();
