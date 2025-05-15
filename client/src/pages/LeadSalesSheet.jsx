import React, { useState, useEffect } from 'react';
import { salesAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { FaDownload, FaEdit, FaSave, FaTimesCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const LeadSalesSheet = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesPersons, setSalesPersons] = useState([]);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editData, setEditData] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    loadSalesData();
    loadUsers();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await salesAPI.getLeadSheet();
      setSales(res.data.data);
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

  const handleEdit = (sale) => {
    setEditingSaleId(sale._id);
    // Ensure we have default values for all fields to prevent undefined errors
    setEditData({
      DATE: sale.date || new Date().toISOString(),
      NAME: sale.customerName || '',
      COUNTRY: sale.country || '',
      COURSE: sale.course || '',
      CODE: sale.countryCode || '+1',
      NUMBER: sale.contactNumber || '',
      'E-MAIL': sale.email || '',
      'PSUDO ID': sale.pseudoId || '',
      'SALE PERSON': (sale.salesPerson && (sale.salesPerson._id || sale.salesPerson)) || '',
      'LEAD PERSON': (sale.leadPerson && (sale.leadPerson._id || sale.leadPerson)) || user.id || '',
      SOURSE: sale.source || '',
      'CLIENT REMARK': sale.clientRemark || '',
      FEEDBACK: sale.feedback || '',
      TOTAL_COST: sale.totalCost || 0,
      TOTAL_COST_CURRENCY: sale.totalCostCurrency || 'USD',
      TOKEN_AMOUNT: sale.tokenAmount || 0,
      TOKEN_AMOUNT_CURRENCY: sale.tokenAmountCurrency || 'USD'
    });
    console.log('Edit data populated:', sale);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Saving with data:', editData);
      
      const saleData = {
        date: editData.DATE,
        customerName: editData.NAME,
        country: editData.COUNTRY,
        course: editData.COURSE,
        countryCode: editData.CODE,
        contactNumber: editData.NUMBER,
        email: editData['E-MAIL'],
        pseudoId: editData['PSUDO ID'],
        salesPerson: editData['SALE PERSON'],
        leadPerson: editData['LEAD PERSON'],
        source: editData.SOURSE,
        clientRemark: editData['CLIENT REMARK'],
        feedback: editData.FEEDBACK,
        totalCost: parseFloat(editData.TOTAL_COST) || 0,
        totalCostCurrency: editData.TOTAL_COST_CURRENCY,
        tokenAmount: parseFloat(editData.TOKEN_AMOUNT) || 0,
        tokenAmountCurrency: editData.TOKEN_AMOUNT_CURRENCY
      };
      
      const response = await salesAPI.update(editingSaleId, saleData);
      if (response.data && response.data.success) {
        console.log('Sale updated successfully:', response.data);
        toast.success("Sale updated successfully");
      } else {
        console.error('Failed to update sale:', response.data);
        setError("Failed to update sale: " + (response.data?.message || "Unknown error"));
      }
      
      setEditingSaleId(null);
      loadSalesData();
    } catch (err) {
      console.error('Error updating sale:', err);
      setError('Failed to update sale. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingSaleId(null);
  };

  const exportToExcel = () => {
    const fileName = `Lead-Sales-Sheet-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Format data for export
    const exportData = sales.map(sale => ({
      'DATE': new Date(sale.date).toLocaleDateString(),
      'NAME': sale.customerName,
      'COUNTRY': sale.country,
      'COURSE': sale.course,
      'CODE': sale.countryCode || '',
      'NUMBER': sale.contactNumber,
      'E-MAIL': sale.email || '',
      'PSUDO ID': sale.pseudoId || '',
      'SALE PERSON': sale.salesPerson?.fullName || '',
      'LEAD PERSON': sale.leadPerson?.fullName || '',
      'SOURSE': sale.source || '',
      'CLIENT REMARK': sale.clientRemark || '',
      'FEEDBACK': sale.feedback || '',
      'TOTAL COST': `${sale.totalCost?.toFixed(2) || '0.00'} ${sale.totalCostCurrency || 'USD'}`,
      'TOKEN AMOUNT': `${sale.tokenAmount?.toFixed(2) || '0.00'} ${sale.tokenAmountCurrency || 'USD'}`
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lead Sales');
    
    // Generate Excel file
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lead Sales Sheet</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={loadSalesData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
              <FaDownload className="mr-2" /> Export
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
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
                  <th className="border px-4 py-2">EMAIL</th>
                  <th className="border px-4 py-2">COUNTRY</th>
                  <th className="border px-4 py-2">SALES PERSON</th>
                  <th className="border px-4 py-2">TOTAL COST</th>
                  <th className="border px-4 py-2">TOKEN AMOUNT</th>
                  <th className="border px-4 py-2">LEAD PERSON</th>
                  <th className="border px-4 py-2">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="border px-4 py-2 text-center">No sales data found</td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      {editingSaleId === sale._id ? (
                        // Edit mode
                        <>
                          <td className="border px-4 py-2">
                            <input
                              type="date"
                              name="DATE"
                              value={editData.DATE ? new Date(editData.DATE).toISOString().split('T')[0] : ''}
                              onChange={handleChange}
                              className="w-full p-1 border"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="text"
                              name="NAME"
                              value={editData.NAME}
                              onChange={handleChange}
                              className="w-full p-1 border"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="text"
                              name="COURSE"
                              value={editData.COURSE}
                              onChange={handleChange}
                              className="w-full p-1 border"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="text"
                              name="NUMBER"
                              value={editData.NUMBER}
                              onChange={handleChange}
                              className="w-full p-1 border"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="text"
                              name="E-MAIL"
                              value={editData['E-MAIL']}
                              onChange={handleChange}
                              className="w-full p-1 border"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="text"
                              name="COUNTRY"
                              value={editData.COUNTRY}
                              onChange={handleChange}
                              className="w-full p-1 border"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <select
                              name="SALE PERSON"
                              value={editData['SALE PERSON']}
                              onChange={handleChange}
                              className="w-full p-1 border"
                            >
                              <option value="">Select</option>
                              {salesPersons.map(person => (
                                <option key={person._id} value={person._id}>
                                  {person.fullName}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border px-4 py-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                name="TOTAL_COST"
                                value={editData.TOTAL_COST}
                                onChange={handleChange}
                                className="w-2/3 p-1 border"
                              />
                              <select
                                name="TOTAL_COST_CURRENCY"
                                value={editData.TOTAL_COST_CURRENCY}
                                onChange={handleChange}
                                className="w-1/3 p-1 border text-xs"
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
                          </td>
                          <td className="border px-4 py-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                name="TOKEN_AMOUNT"
                                value={editData.TOKEN_AMOUNT}
                                onChange={handleChange}
                                className="w-2/3 p-1 border"
                              />
                              <select
                                name="TOKEN_AMOUNT_CURRENCY"
                                value={editData.TOKEN_AMOUNT_CURRENCY}
                                onChange={handleChange}
                                className="w-1/3 p-1 border text-xs"
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
                          </td>
                          <td className="border px-4 py-2">
                            {/* Lead Person cannot be changed here */}
                            {sale.leadPerson?.fullName}
                          </td>
                          <td className="border px-4 py-2">
                            <div className="flex justify-center space-x-1">
                              <button
                                onClick={handleSave}
                                className="p-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                              >
                                <FaTimesCircle />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="border px-4 py-2">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="border px-4 py-2">{sale.customerName}</td>
                          <td className="border px-4 py-2">{sale.course}</td>
                          <td className="border px-4 py-2">
                            {sale.countryCode && sale.contactNumber ? 
                              `${sale.countryCode} ${sale.contactNumber}` : 
                              sale.contactNumber || 'N/A'}
                          </td>
                          <td className="border px-4 py-2">{sale.email || 'N/A'}</td>
                          <td className="border px-4 py-2">{sale.country || 'N/A'}</td>
                          <td className="border px-4 py-2">
                            {sale.salesPerson?.fullName || 
                             (typeof sale.salesPerson === 'string' ? sale.salesPerson : 'N/A')}
                          </td>
                          <td className="border px-4 py-2">
                            {(sale.totalCost !== undefined ? sale.totalCost.toFixed(2) : '0.00')} {sale.totalCostCurrency || 'USD'}
                          </td>
                          <td className="border px-4 py-2">
                            {(sale.tokenAmount !== undefined ? sale.tokenAmount.toFixed(2) : '0.00')} {sale.tokenAmountCurrency || 'USD'}
                          </td>
                          <td className="border px-4 py-2">
                            {sale.leadPerson?.fullName || 
                             (typeof sale.leadPerson === 'string' ? sale.leadPerson : 'N/A')}
                          </td>
                          <td className="border px-4 py-2 flex justify-center">
                            <button
                              onClick={() => handleEdit(sale)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            >
                              <FaEdit />
                            </button>
                          </td>
                        </>
                      )}
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

export default LeadSalesSheet; 