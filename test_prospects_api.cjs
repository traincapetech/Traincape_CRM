const axios = require('axios');

const API_BASE_URL = 'https://crm-backend-o36v.onrender.com';

// Test credentials
const testUser = {
  email: 'rajesh@traincapetech.in',
  password: 'rajesh123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      console.log('👤 User:', response.data.user.fullName, '(' + response.data.user.role + ')');
      return true;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testProspectAPIs() {
  console.log('\n📊 Testing Prospect APIs...\n');

  // Test 1: Get prospect statistics
  try {
    console.log('1️⃣ Testing GET /api/prospects/stats');
    const response = await axios.get(`${API_BASE_URL}/api/prospects/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Prospect stats retrieved successfully');
      console.log('📈 Stats:', JSON.stringify(response.data.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Get prospect stats failed:', error.response?.data?.message || error.message);
  }

  // Test 2: Create a new prospect
  let prospectId = '';
  try {
    console.log('\n2️⃣ Testing POST /api/prospects');
    const prospectData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      company: 'Tech Solutions Inc',
      designation: 'CTO',
      source: 'LinkedIn',
      sourceDetails: 'Connected through mutual contact',
      industry: 'Technology',
      companySize: '51-200',
      budget: 50000,
      budgetCurrency: 'USD',
      serviceInterest: 'Web Development',
      requirements: 'Need a modern e-commerce platform',
      timeline: '1-3 months',
      status: 'New',
      priority: 'High',
      notes: 'Very interested prospect, follow up soon',
      tags: ['hot-lead', 'e-commerce', 'urgent'],
      linkedinProfile: 'https://linkedin.com/in/johndoe',
      websiteUrl: 'https://techsolutions.com'
    };

    const response = await axios.post(`${API_BASE_URL}/api/prospects`, prospectData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      prospectId = response.data.data._id;
      console.log('✅ Prospect created successfully');
      console.log('🆔 Prospect ID:', prospectId);
      console.log('👤 Prospect:', response.data.data.name);
    }
  } catch (error) {
    console.error('❌ Create prospect failed:', error.response?.data?.message || error.message);
  }

  // Test 3: Get all prospects
  try {
    console.log('\n3️⃣ Testing GET /api/prospects');
    const response = await axios.get(`${API_BASE_URL}/api/prospects?limit=5`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Prospects retrieved successfully');
      console.log('📊 Total prospects:', response.data.pagination.total);
      console.log('📄 Current page:', response.data.pagination.current);
      console.log('🔢 Prospects on this page:', response.data.data.length);
    }
  } catch (error) {
    console.error('❌ Get prospects failed:', error.response?.data?.message || error.message);
  }

  // Test 4: Get single prospect
  if (prospectId) {
    try {
      console.log('\n4️⃣ Testing GET /api/prospects/:id');
      const response = await axios.get(`${API_BASE_URL}/api/prospects/${prospectId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.data.success) {
        console.log('✅ Single prospect retrieved successfully');
        console.log('👤 Prospect:', response.data.data.name);
        console.log('🏢 Company:', response.data.data.company);
        console.log('📧 Email:', response.data.data.email);
        console.log('📱 Phone:', response.data.data.phone);
        console.log('🎯 Status:', response.data.data.status);
        console.log('⚡ Priority:', response.data.data.priority);
      }
    } catch (error) {
      console.error('❌ Get single prospect failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Update prospect
    try {
      console.log('\n5️⃣ Testing PUT /api/prospects/:id');
      const updateData = {
        status: 'Contacted',
        priority: 'Medium',
        notes: 'Initial contact made via email. Scheduled follow-up call.',
        lastContactDate: new Date().toISOString().split('T')[0],
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contactMethod: 'Email'
      };

      const response = await axios.put(`${API_BASE_URL}/api/prospects/${prospectId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.data.success) {
        console.log('✅ Prospect updated successfully');
        console.log('🎯 New status:', response.data.data.status);
        console.log('⚡ New priority:', response.data.data.priority);
        console.log('📝 Updated notes:', response.data.data.notes);
      }
    } catch (error) {
      console.error('❌ Update prospect failed:', error.response?.data?.message || error.message);
    }

    // Test 6: Convert prospect to lead
    try {
      console.log('\n6️⃣ Testing POST /api/prospects/:id/convert');
      const response = await axios.post(`${API_BASE_URL}/api/prospects/${prospectId}/convert`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.data.success) {
        console.log('✅ Prospect converted to lead successfully');
        console.log('🔄 Prospect status:', response.data.data.prospect.status);
        console.log('🎯 New lead ID:', response.data.data.lead._id);
        console.log('👤 Lead name:', response.data.data.lead.name);
      }
    } catch (error) {
      console.error('❌ Convert prospect failed:', error.response?.data?.message || error.message);
    }
  }

  // Test 7: Search prospects
  try {
    console.log('\n7️⃣ Testing GET /api/prospects with search');
    const response = await axios.get(`${API_BASE_URL}/api/prospects?search=john&status=Converted to Lead`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Prospect search successful');
      console.log('🔍 Search results:', response.data.data.length, 'prospects found');
      if (response.data.data.length > 0) {
        console.log('👤 First result:', response.data.data[0].name);
      }
    }
  } catch (error) {
    console.error('❌ Search prospects failed:', error.response?.data?.message || error.message);
  }

  // Test 8: Get updated stats
  try {
    console.log('\n8️⃣ Testing GET /api/prospects/stats (after operations)');
    const response = await axios.get(`${API_BASE_URL}/api/prospects/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Updated prospect stats retrieved successfully');
      console.log('📈 Updated Stats:', JSON.stringify(response.data.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Get updated prospect stats failed:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Prospect API Tests...\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  await testProspectAPIs();
  
  console.log('\n✨ Prospect API tests completed!');
}

// Run the tests
runTests().catch(console.error); 