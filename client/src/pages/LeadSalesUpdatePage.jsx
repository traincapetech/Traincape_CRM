import React, { useState, useEffect } from 'react';
import { salesAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { FaPlus } from 'react-icons/fa';

const LeadSalesUpdatePage = () => {
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesPersons, setSalesPersons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    DATE: new Date().toISOString().split('T')[0],
    NAME: '',
    COUNTRY: '',
    COURSE: '',
    CODE: '',
    NUMBER: '',
    'E-MAIL': '',
    'PSUDO ID': '',
    'SALE PERSON': '',
    'LEAD PERSON': '',
    SOURSE: '',
    'CLIENT REMARK': '',
    FEEDBACK: '',
    'TOTAL COST': 0,
    'TOTAL COST CURRENCY': 'USD',
    'TOKEN AMOUNT': 0,
    'TOKEN AMOUNT CURRENCY': 'USD'
  });
  
  // Get user from auth context
  const { user, loadUser } = useAuth();
  
  // Log user info right away
  console.log('User object in LeadSalesUpdatePage initial load:', user);
  console.log('User ID formats:', user ? {
    id: user.id,
    _id: user._id,
    userId: user.userId
  } : 'No user data');

  // Try to refresh user data if it's missing
  useEffect(() => {
    if (!user) {
      console.log('No user data found, attempting to reload user data');
      loadUser();
    } else {
      console.log('User data available:', user);
      console.log('User ID variations:', {
        id: user.id,
        _id: user._id,
        userId: user.userId
      });
    }
  }, []);

  useEffect(() => {
    // Log user information for debugging
    console.log('User information on load:', user);
    
    // Only try to load data if we have user information
    if (user) {
      loadSalesData();
      loadUsers();
    }
  }, [user]);  // Re-run when user changes

  // Another useEffect to set the initial lead person when user data becomes available
  useEffect(() => {
    if (user) {
      // Try all possible ID formats
      const userId = user.id || user._id || user.userId;
      console.log('Setting lead person ID to:', userId);
      
      if (userId) {
        setFormData(prev => ({
          ...prev,
          'LEAD PERSON': userId
        }));
      }
    }
  }, [user]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await salesAPI.getLeadSheet();
      setSalesList(res.data.data);
    } catch (err) {
      console.error('Error loading sales data:', err);
      setError('Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get sales persons
      const salesRes = await authAPI.getUsers('Sales Person');
      setSalesPersons(salesRes.data.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if user info is available and find the correct ID format
      if (!user) {
        console.error('No user object available');
        throw new Error('User information not available. Please log in again.');
      }

      console.log('Full user object:', user);
      
      // Try all possible ID formats
      const userId = user.id || user._id || user.userId;
      
      if (!userId) {
        console.error('No user ID found in any format:', user);
        throw new Error('User ID not available. Please log in again.');
      }

      console.log('Using user ID:', userId);

      const saleData = {
        date: formData.DATE,
        customerName: formData.NAME,
        country: formData.COUNTRY,
        course: formData.COURSE,
        countryCode: formData.CODE,
        contactNumber: formData.NUMBER,
        email: formData['E-MAIL'],
        pseudoId: formData['PSUDO ID'],
        salesPerson: formData['SALE PERSON'],
        totalCost: parseFloat(formData['TOTAL COST']),
        totalCostCurrency: formData['TOTAL COST CURRENCY'],
        tokenAmount: parseFloat(formData['TOKEN AMOUNT']),
        tokenAmountCurrency: formData['TOKEN AMOUNT CURRENCY'],
        leadPerson: userId,
        source: formData.SOURSE,
        clientRemark: formData['CLIENT REMARK'],
        feedback: formData.FEEDBACK
      };
      
      console.log('Sending sale data:', saleData);
      
      const res = await salesAPI.create(saleData);
      
      if (res.data.success) {
        // Reset form
        setFormData({
          DATE: new Date().toISOString().split('T')[0],
          NAME: '',
          COUNTRY: '',
          COURSE: '',
          CODE: '',
          NUMBER: '',
          'E-MAIL': '',
          'PSUDO ID': '',
          'SALE PERSON': '',
          'LEAD PERSON': userId,
          SOURSE: '',
          'CLIENT REMARK': '',
          FEEDBACK: '',
          'TOTAL COST': 0,
          'TOTAL COST CURRENCY': 'USD',
          'TOKEN AMOUNT': 0,
          'TOKEN AMOUNT CURRENCY': 'USD'
        });
        
        setShowForm(false);
        loadSalesData();
      }
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(err.response?.data?.message || 'Failed to create sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add a direct test button that uses a hardcoded ID for testing
  const handleDirectTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Hard-coded test data with explicit leadPerson ID
      const testSaleData = {
        date: new Date().toISOString(),
        customerName: "Test Customer",
        course: "Test Course",
        contactNumber: "1234567890",
        country: "Test Country",
        salesPerson: salesPersons.length > 0 ? salesPersons[0]._id : '681b2b9c4e40e43301577c7c', // Fallback ID
        totalCost: 100,
        totalCostCurrency: 'USD',
        tokenAmount: 10,
        tokenAmountCurrency: 'USD',
        leadPerson: '681b2b9c4e40e43301577c7d' // Hardcoded Lead Person ID (replace with a real ID from your DB)
      };
      
      console.log('Sending test sale data with hardcoded IDs:', testSaleData);
      
      const res = await salesAPI.create(testSaleData);
      
      if (res.data.success) {
        console.log('Test sale created successfully:', res.data);
        loadSalesData();
      }
    } catch (err) {
      console.error('Error creating test sale:', err);
      setError(err.response?.data?.message || 'Failed to create test sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Update Sales</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <FaPlus className="mr-2" /> {showForm ? "Cancel" : "Add New Sale"}
            </button>
            <button
              onClick={loadSalesData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Refresh
            </button>
            <button
              onClick={handleDirectTest}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              title="Add a test sale with fixed data"
            >
              Add Test Sale
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Sale</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DATE*
                  </label>
                  <input
                    type="date"
                    name="DATE"
                    value={formData.DATE}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NAME*
                  </label>
                  <input
                    type="text"
                    name="NAME"
                    value={formData.NAME}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    COUNTRY*
                  </label>
                  <input
                    type="text"
                    name="COUNTRY"
                    value={formData.COUNTRY}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Course */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    COURSE*
                  </label>
                  <input
                    type="text"
                    name="COURSE"
                    value={formData.COURSE}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Country Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CODE
                  </label>
                  <input
                    type="text"
                    name="CODE"
                    value={formData.CODE}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NUMBER*
                  </label>
                  <input
                    type="text"
                    name="NUMBER"
                    value={formData.NUMBER}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-MAIL
                  </label>
                  <input
                    type="email"
                    name="E-MAIL"
                    value={formData['E-MAIL']}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Pseudo ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PSUDO ID
                  </label>
                  <input
                    type="text"
                    name="PSUDO ID"
                    value={formData['PSUDO ID']}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Sales Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SALE PERSON*
                  </label>
                  <select
                    name="SALE PERSON"
                    value={formData['SALE PERSON']}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Sales Person</option>
                    {salesPersons.map(person => (
                      <option key={person._id} value={person._id}>
                        {person.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SOURSE
                  </label>
                  <input
                    type="text"
                    name="SOURSE"
                    value={formData.SOURSE}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Client Remark */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CLIENT REMARK
                  </label>
                  <input
                    type="text"
                    name="CLIENT REMARK"
                    value={formData['CLIENT REMARK']}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FEEDBACK
                  </label>
                  <input
                    type="text"
                    name="FEEDBACK"
                    value={formData.FEEDBACK}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Total Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TOTAL COST*
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="TOTAL COST"
                      value={formData['TOTAL COST']}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <select
                      name="TOTAL COST CURRENCY"
                      value={formData['TOTAL COST CURRENCY']}
                      onChange={handleChange}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="INR">INR</option>
                      <option value="JPY">JPY</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>
                </div>
                
                {/* Token Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TOKEN AMOUNT*
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="TOKEN AMOUNT"
                      value={formData['TOKEN AMOUNT']}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <select
                      name="TOKEN AMOUNT CURRENCY"
                      value={formData['TOKEN AMOUNT CURRENCY']}
                      onChange={handleChange}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="INR">INR</option>
                      <option value="JPY">JPY</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Sale'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {loading && !showForm ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">DATE</th>
                  <th className="border px-4 py-2">NAME</th>
                  <th className="border px-4 py-2">COURSE</th>
                  <th className="border px-4 py-2">NUMBER</th>
                  <th className="border px-4 py-2">COUNTRY</th>
                  <th className="border px-4 py-2">SALES PERSON</th>
                  <th className="border px-4 py-2">TOTAL COST</th>
                  <th className="border px-4 py-2">TOKEN AMOUNT</th>
                  <th className="border px-4 py-2">LEAD PERSON</th>
                </tr>
              </thead>
              <tbody>
                {salesList.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="border px-4 py-2 text-center">No sales data found</td>
                  </tr>
                ) : (
                  salesList.map(sale => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="border px-4 py-2">{sale.customerName}</td>
                      <td className="border px-4 py-2">{sale.course}</td>
                      <td className="border px-4 py-2">{sale.contactNumber}</td>
                      <td className="border px-4 py-2">{sale.country}</td>
                      <td className="border px-4 py-2">{sale.salesPerson?.fullName}</td>
                      <td className="border px-4 py-2">{sale.totalCost?.toFixed(2) || '0.00'} {sale.totalCostCurrency || 'USD'}</td>
                      <td className="border px-4 py-2">{sale.tokenAmount?.toFixed(2) || '0.00'} {sale.tokenAmountCurrency || 'USD'}</td>
                      <td className="border px-4 py-2">{sale.leadPerson?.fullName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LeadSalesUpdatePage; 