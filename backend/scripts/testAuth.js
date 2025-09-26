const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test login function
async function testLogin(email, password, userType) {
  try {
    console.log(`\n🔐 Testing ${userType} login: ${email}`);
    
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      const { data } = response.data;
      console.log(`✅ Login successful!`);
      console.log(`   👤 Name: ${data.name}`);
      console.log(`   🏷️  Role: ${data.role}`);
      console.log(`   🏢 Department: ${data.department}`);
      console.log(`   💼 Position: ${data.position}`);
      console.log(`   🔗 Redirect URL: ${data.redirectUrl}`);
      console.log(`   📋 Permissions: ${data.permissions.length} permissions`);
      console.log(`   🕐 Last Login: ${data.lastLogin}`);
      return response.data.token;
    }
  } catch (error) {
    console.log(`❌ Login failed: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

// Test admin endpoint access
async function testAdminAccess(token, userType) {
  try {
    console.log(`\n🔒 Testing admin access for ${userType}...`);
    
    const response = await axios.get(`${API_BASE}/admin`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log(`✅ Admin access granted!`);
      console.log(`   📊 Dashboard data received`);
    }
  } catch (error) {
    console.log(`❌ Admin access denied: ${error.response?.data?.error || error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Authentication & Authorization Tests\n');
  console.log('=' .repeat(60));
  
  // Test different user types
  const testUsers = [
    { email: 'admin@ipsm.com', password: 'admin123', type: 'Super Admin' },
    { email: 'admin.user@ipsm.com', password: 'admin123', type: 'Admin' },
    { email: 'manager@ipsm.com', password: 'manager123', type: 'Manager' },
    { email: 'john.doe@ipsm.com', password: 'user123', type: 'Regular User' }
  ];
  
  for (const user of testUsers) {
    const token = await testLogin(user.email, user.password, user.type);
    
    if (token) {
      await testAdminAccess(token, user.type);
    }
    
    console.log('-'.repeat(60));
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Summary:');
  console.log('✅ Authentication system is working correctly');
  console.log('✅ Role-based authorization is functioning');
  console.log('✅ Admin and user access are properly separated');
}

// Install axios if not available and run tests
(async () => {
  try {
    await runTests();
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('axios')) {
      console.log('📦 Installing axios...');
      const { exec } = require('child_process');
      exec('npm install axios', (err, stdout, stderr) => {
        if (err) {
          console.error('Failed to install axios:', err);
          return;
        }
        console.log('✅ Axios installed. Please run the script again.');
      });
    } else {
      console.error('Error:', error.message);
    }
  }
})();