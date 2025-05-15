import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout/Layout';

const TokenDebugPage = () => {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get token from localStorage
    const savedToken = localStorage.getItem('token');
    setToken(savedToken || 'No token found');
  }, []);

  const testToken = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://crm-backend-o36v.onrender.com/api/auth/debug', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setTestResult(JSON.stringify(error.response?.data || error.message, null, 2));
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
        
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Current User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2) || 'Not logged in'}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Stored Token</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto mb-4">
            {token}
          </pre>
          
          <button 
            onClick={testToken}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Testing...' : 'Test Token'}
          </button>
        </div>
        
        {testResult && (
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-2">Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TokenDebugPage; 