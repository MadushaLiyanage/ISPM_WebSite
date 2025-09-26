// Simple test script to check API functionality
const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  console.log('Auth Status:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    hasUser: !!user,
    user: user ? JSON.parse(user) : null
  });
  
  return !!token;
};

const testEmployeeAPI = async () => {
  try {
    console.log('Testing Employee API...');
    
    // Check auth first
    if (!checkAuth()) {
      console.error('No authentication token found. Please login first.');
      return;
    }
    
    // Test get employees
    const response = await fetch('http://localhost:3001/api/admin/employees', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    console.log('API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response Data:', data);
      
      if (data.success && data.data.employees.length > 0) {
        const testEmployee = data.data.employees[0];
        console.log('Found test employee:', testEmployee._id);
        
        // Test delete employee
        console.log('Testing delete employee...');
        const deleteResponse = await fetch(`http://localhost:3001/api/admin/employees/${testEmployee._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        console.log('Delete Response Status:', deleteResponse.status);
        const deleteData = await deleteResponse.json();
        console.log('Delete Response Data:', deleteData);
        
      } else {
        console.log('No employees found to test with');
      }
    } else {
      const errorData = await response.json();
      console.error('API Error:', errorData);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Export functions for console use
window.checkAuth = checkAuth;
window.testEmployeeAPI = testEmployeeAPI;

console.log('API test functions loaded. Use checkAuth() and testEmployeeAPI() in console.');