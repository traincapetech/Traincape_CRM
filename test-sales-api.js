const axios = require('axios');

// Test script to verify sales API
async function testSalesAPI() {
  try {
    console.log('Testing Sales API...');
    
    // You'll need to replace this with a valid token from your application
    const token = 'YOUR_AUTH_TOKEN_HERE';
    const baseURL = 'http://localhost:8080';
    
    console.log('1. Testing regular sales endpoint...');
    const regularResponse = await axios.get(`${baseURL}/api/sales`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Regular response:', {
      success: regularResponse.data.success,
      count: regularResponse.data.count,
      dataLength: regularResponse.data.data?.length
    });
    
    console.log('2. Testing sales endpoint with full=true...');
    const fullResponse = await axios.get(`${baseURL}/api/sales?full=true`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Full response:', {
      success: fullResponse.data.success,
      count: fullResponse.data.count,
      dataLength: fullResponse.data.data?.length
    });
    
    console.log('3. Testing sales count endpoint...');
    const countResponse = await axios.get(`${baseURL}/api/sales/count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Count response:', {
      success: countResponse.data.success,
      count: countResponse.data.count
    });
    
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

// Instructions for running this test
console.log(`
To run this test:
1. Make sure your server is running on port 8080
2. Log in to your application and get an auth token from localStorage
3. Replace 'YOUR_AUTH_TOKEN_HERE' with the actual token
4. Run: node test-sales-api.js
`);

// Uncomment the line below and add a valid token to run the test
// testSalesAPI(); 