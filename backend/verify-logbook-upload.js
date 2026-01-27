import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const LOGIN_EMAIL = 'john.doe@bazeuniversity.edu.ng';
const LOGIN_PASSWORD = 'password123';

async function verifyLogbookUpload() {
    console.log('🚀 Starting Logbook Upload Verification...');

    try {
        // 1. Login to get token
        console.log(`🔐 Logging in as ${LOGIN_EMAIL}...`);
        const loginRes = await axios.post(`${API_URL}/auth/student/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASSWORD
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful!');

        const authConfig = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Create dummy files
        const testFilesDir = path.join(__dirname, 'test_files');
        if (!fs.existsSync(testFilesDir)) fs.mkdirSync(testFilesDir);

        const file1Path = path.join(testFilesDir, 'test1.png');
        const file2Path = path.join(testFilesDir, 'test2.jpg');

        fs.writeFileSync(file1Path, 'fake image 1 content');
        fs.writeFileSync(file2Path, 'fake image 2 content');

        // 3. Submit Logbook Entry with multiple files
        console.log('📝 Submitting new logbook entry with images...');
        const formData = new FormData();
        const weekNum = Math.floor(Math.random() * 30) + 21; // 21 to 50



        formData.append('weekNumber', weekNum.toString());
        formData.append('startDate', '2024-04-01');
        formData.append('endDate', '2024-04-07');
        formData.append('title', 'Verification Test Week ' + weekNum);
        formData.append('weekSummary', 'This is an automated verification test for file uploads.');
        formData.append('mondayActivities', 'Tested file upload logic');
        formData.append('images', fs.createReadStream(file1Path));
        formData.append('images', fs.createReadStream(file2Path));

        const submitRes = await axios.post(`${API_URL}/logbook`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('✅ Logbook created successfully!');
        const logbook = submitRes.data.logbook;
        console.log('📦 Created Logbook ID:', logbook.id);
        console.log('🖼️ Images in response:', JSON.stringify(logbook.images, null, 2));

        // 4. Verify images have full URLs and correct structure
        if (!logbook.images || logbook.images.length !== 2) {
            throw new Error(`Expected 2 images, but got ${logbook.images?.length || 0}`);
        }

        logbook.images.forEach((img, index) => {
            if (typeof img !== 'object' || !img.url || !img.filename) {
                throw new Error(`Image at index ${index} is not correctly formatted: ${JSON.stringify(img)}`);
            }
            if (!img.url.startsWith('http://localhost:5000/uploads/logbooks/logbook-')) {
                throw new Error(`Image URL is invalid: ${img.url}`);
            }
            console.log(`✅ Image ${index + 1} verified: ${img.filename}`);
        });

        // 5. Test GET my-logbook
        console.log('🔍 Verifying "My Logbooks" list endpoint...');
        const listRes = await axios.get(`${API_URL}/logbook/my-logbook`, authConfig);
        const latestLogbook = listRes.data.logbooks.find(lb => lb.id === logbook.id);

        if (!latestLogbook) {
            throw new Error('Could not find created logbook in list');
        }
        console.log('✅ Logbook found in list with correct data');

        // 6. Test GET single logbook
        console.log(`🔍 Verifying single logbook details endpoint for ID ${logbook.id}...`);
        const detailRes = await axios.get(`${API_URL}/logbook/${logbook.id}`, authConfig);
        const detailLogbook = detailRes.data.logbook;

        if (!detailLogbook.images || detailLogbook.images.length !== 2) {
            throw new Error('Details response missing images');
        }
        console.log('✅ Detail view verified');

        // 7. Cleanup (Optional: delete the logbook)
        console.log(`🗑️ Deleting test logbook ${logbook.id}...`);
        await axios.delete(`${API_URL}/logbook/${logbook.id}`, authConfig);
        console.log('✅ Test logbook deleted');

        console.log('\n✨ ALL VERIFICATIONS PASSED SUCCESSFULLY! ✨');

    } catch (error) {
        console.error('❌ Verification failed!');
        if (error.response) {
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    } finally {
        // Cleanup local test files
        const testFilesDir = path.join(__dirname, 'test_files');
        if (fs.existsSync(testFilesDir)) {
            fs.readdirSync(testFilesDir).forEach(file => {
                fs.unlinkSync(path.join(testFilesDir, file));
            });
            fs.rmdirSync(testFilesDir);
        }
    }
}

verifyLogbookUpload();
