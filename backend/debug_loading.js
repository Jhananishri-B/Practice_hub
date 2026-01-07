
const axios = require('axios');

async function testEndpoint() {
    try {
        console.log("Testing endpoint...");
        // Log in to get token
        const login = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'USER',
            password: '123'
        });
        const token = login.data.token;
        console.log("Logged in:", token ? "Success" : "Failed");

        // Get course to find an ID
        const courses = await axios.get('http://localhost:5000/api/courses', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const courseId = courses.data[0].id; // Assumption: at least one course
        console.log("Course ID:", courseId);

        // Get levels
        const levels = await axios.get(`http://localhost:5000/api/courses/${courseId}/levels`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const levelId = levels.data[0].id;
        console.log("Level ID:", levelId);

        // GET LEVEL DETAILS (The problematic endpoint)
        console.log(`Fetching details for ${levelId}...`);
        const start = Date.now();
        const details = await axios.get(`http://localhost:5000/api/courses/${courseId}/levels/${levelId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Details Status:", details.status);
        console.log("Time taken:", Date.now() - start, "ms");
        console.log("Data keys:", Object.keys(details.data));

    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) {
            console.error("Response:", error.response.status, error.response.data);
        }
    }
}

testEndpoint();
