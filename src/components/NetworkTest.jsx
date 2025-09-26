import React, { useState } from 'react';
import { authAPI } from '../services/api';

const NetworkTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, success, details) => {
    setTestResults(prev => [...prev, { test, success, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    // Test 1: Basic API health check
    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      addResult('Backend Health Check', true, `Status: ${data.status}`);
    } catch (error) {
      addResult('Backend Health Check', false, error.message);
    }

    // Test 2: API endpoint test
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@ipsm.com', password: 'admin123' })
      });
      const data = await response.json();
      addResult('Direct API Test', data.success, `Token received: ${!!data.token}`);
    } catch (error) {
      addResult('Direct API Test', false, error.message);
    }

    // Test 3: Using axios (same as app)
    try {
      const response = await authAPI.login({ email: 'admin@ipsm.com', password: 'admin123' });
      addResult('Axios API Test', true, `User: ${response.data.data.name}`);
    } catch (error) {
      addResult('Axios API Test', false, `${error.code}: ${error.message}`);
    }

    setTesting(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>🔧 Network Connectivity Test</h3>
      <button 
        onClick={runTests} 
        disabled={testing}
        style={{ padding: '10px 20px', marginBottom: '20px' }}
      >
        {testing ? 'Testing...' : 'Run Tests'}
      </button>
      
      <div>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '10px', 
              margin: '5px 0', 
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px'
            }}
          >
            <strong>{result.success ? '✅' : '❌'} {result.test}</strong>
            <br />
            <small>{result.timestamp}: {result.details}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkTest;