const axios = require('axios');

async function checkNetworkAndGuide() {
  console.log('🔍 MongoDB Atlas Connection Diagnostics');
  console.log('=' .repeat(50));
  
  // Step 1: Check internet connectivity
  console.log('\\n1️⃣ Testing Internet Connectivity...');
  try {
    await axios.get('https://www.google.com', { timeout: 5000 });
    console.log('✅ Internet connection is working');
  } catch (error) {
    console.log('❌ Internet connection issue detected');
    console.log('💡 Fix your internet connection first');
    return;
  }
  
  // Step 2: Get current IP address
  console.log('\\n2️⃣ Getting Current IP Address...');
  try {
    const ipResponse = await axios.get('https://api.ipify.org?format=json', { timeout: 10000 });
    const currentIP = ipResponse.data.ip;
    console.log(`✅ Your current IP address: ${currentIP}`);
    
    console.log('\\n📋 MongoDB Atlas IP Whitelist Configuration:');
    console.log('   1. Go to https://cloud.mongodb.com');
    console.log('   2. Select your cluster (cluster0)');
    console.log('   3. Click "Network Access" in the left sidebar');
    console.log('   4. Click "Add IP Address"');
    console.log(`   5. Add your current IP: ${currentIP}`);
    console.log('   6. OR add 0.0.0.0/0 for testing (allows all IPs)');
    console.log('   7. Save the changes');
    
  } catch (error) {
    console.log('⚠️ Could not determine IP address');
    console.log('💡 Manually check your IP at https://whatismyipaddress.com');
  }
  
  // Step 3: Check DNS resolution
  console.log('\\n3️⃣ Testing DNS Resolution...');
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec('nslookup cluster0.knoxe1u.mongodb.net', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ DNS resolution failed');
        console.log('💡 Recommended fixes:');
        console.log('   • Change DNS servers to 8.8.8.8 and 8.8.4.4');
        console.log('   • Or use 1.1.1.1 and 1.0.0.1 (Cloudflare)');
        console.log('   • Restart your network adapter');
        console.log('   • Check if corporate firewall blocks MongoDB Atlas');
      } else {
        console.log('✅ DNS resolution is working');
      }
      
      // Step 4: Network configuration tips
      console.log('\\n4️⃣ Network Configuration Tips:');
      console.log('   🏢 Corporate Network:');
      console.log('      • MongoDB Atlas uses port 27017');
      console.log('      • Ask IT to whitelist *.mongodb.net');
      console.log('      • Try from personal hotspot to test');
      console.log('   🏠 Home Network:');
      console.log('      • Restart router/modem');
      console.log('      • Disable VPN temporarily');
      console.log('      • Check antivirus firewall settings');
      
      // Step 5: Alternative solutions
      console.log('\\n5️⃣ Quick Solutions to Try:');
      console.log('   A. Use MongoDB Compass to test connection:');
      console.log('      • Download from https://www.mongodb.com/products/compass');
      console.log('      • Test with same connection string');
      console.log('   B. Try mobile hotspot:');
      console.log('      • Connect computer to phone hotspot');
      console.log('      • Test if it works on different network');
      console.log('   C. Use alternative connection string formats');
      
      console.log('\\n🎯 Next Steps:');
      console.log('   1. ✅ Add your IP to MongoDB Atlas whitelist');
      console.log('   2. ✅ Wait 2-3 minutes for changes to propagate');
      console.log('   3. ✅ Run: npm run dev');
      console.log('   4. ✅ Test login with: admin@ipsm.com / admin123');
      
      console.log('\\n📞 Need Help?');
      console.log('   • MongoDB Atlas Support: https://support.mongodb.com');
      console.log('   • Community Forums: https://community.mongodb.com');
      
      resolve();
    });
  });
}

checkNetworkAndGuide().then(() => {
  console.log('\\n🏁 Diagnostics completed!');
});