// Test frontend to backend connectivity
const API_BASE_URL = 'http://localhost:3000/api';

async function testConnection() {
  try {
    console.log('🔄 Testing frontend to backend connection...');
    
    // Test 1: Health check
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health check:', healthData);
    
    // Test 2: API endpoint
    const apiResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ipsm.com',
        password: 'admin123'
      })
    });
    
    const apiData = await apiResponse.json();
    console.log('✅ Login test response:', apiData);
    
    if (apiData.success) {
      console.log('🎉 Frontend can successfully connect to backend!');
      console.log('🔑 Token received:', apiData.token ? 'Yes' : 'No');
      console.log('👤 User data:', apiData.data);
    } else {
      console.log('❌ Login test failed:', apiData.error);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('🔍 Possible issues:');
    console.log('   1. Backend server not running on port 3000');
    console.log('   2. CORS issues');
    console.log('   3. Network connectivity problems');
  }
}

testConnection();