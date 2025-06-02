import React, { useState, useEffect } from 'react';
import { salesAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { FaDownload, FaEdit, FaSave, FaTimesCircle, FaFilter, FaCalendar, FaSync } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import axios from 'axios';

const LeadSalesSheet = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesPersons, setSalesPersons] = useState([]);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editData, setEditData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Date filtering state
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
  const [showCurrentMonth, setShowCurrentMonth] = useState(false); // Changed to false - don't filter by default
  const [showAllSales, setShowAllSales] = useState(true); // Add showAllSales state - default to true
  
  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];
  
  // Generate year options (5 years back from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadSalesData();
    loadUsers();
    
    // Set up automatic refresh every 2 minutes
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing sales data...");
      loadSalesData(true);
    }, 120000); // 2 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Apply date filters when sales data changes
  useEffect(() => {
    if (sales.length > 0) {
      applyDateFilters();
    }
  }, [sales, filterMonth, filterYear, showCurrentMonth, showAllSales]);

  // Function to filter sales by selected date
  const applyDateFilters = () => {
    // If showAllSales is true, show all sales without filtering
    if (showAllSales) {
      setFilteredSales(sales);
      return;
    }
    
    if (showCurrentMonth) {
      // Show current month data
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();
      
      const filtered = sales.filter(sale => {
        // Make sure we have a valid date to work with
        if (!sale.date && !sale.createdAt) {
          console.log('Sale has no date:', sale);
          return false;
        }
        
        const saleDate = new Date(sale.date || sale.createdAt);
        const saleMonth = saleDate.getMonth() + 1; // Convert to 1-12 format
        const saleYear = saleDate.getFullYear();
        
        return (
          saleMonth === currentMonth && 
          saleYear === currentYear
        );
      });
      
      console.log(`Filtered to current month: ${currentMonth}/${currentYear}. Found ${filtered.length} sales.`);
      setFilteredSales(filtered);
    } else {
      // Show selected month/year data
      const filtered = sales.filter(sale => {
        // Make sure we have a valid date to work with
        if (!sale.date && !sale.createdAt) {
          console.log('Sale has no date:', sale);
          return false;
        }
        
        const saleDate = new Date(sale.date || sale.createdAt);
        const saleMonth = saleDate.getMonth() + 1; // Convert to 1-12 format
        const saleYear = saleDate.getFullYear();
        
        console.log(`Sale date: ${saleDate.toISOString()}, Month: ${saleMonth}, Year: ${saleYear}, Filter: ${filterMonth}/${filterYear}`);
        
        return (
          saleMonth === filterMonth && 
          saleYear === filterYear
        );
      });
      
      console.log(`Filtered to ${filterMonth}/${filterYear}. Found ${filtered.length} sales.`);
      setFilteredSales(filtered);
    }
  };

  const loadSalesData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      console.log('Fetching lead sales for user:', user?.fullName, user?.role, user?._id);
      
      try {
        const res = await salesAPI.getAllForced();
        
        if (res.data && res.data.success) {
          // Filter the sales to only show ones where this user is the lead person
          const leadPersonSales = res.data.data.filter(sale => 
            sale.leadPerson === user._id || 
            (sale.leadPerson && sale.leadPerson._id === user._id)
          );
          
          console.log(`Lead sales data loaded: ${leadPersonSales.length} sales`);
          setSales(leadPersonSales);
          
          // Initialize filteredSales with all sales
          if (!isAutoRefresh) {
            setFilteredSales(leadPersonSales);
          } else {
            // When auto-refreshing, maintain filters but update underlying data
            applyDateFilters();
          }
          
          if (leadPersonSales.length === 0) {
            console.log('No sales found. This could be because:');
            console.log('1. No sales have been assigned to this lead person');
            console.log('2. Sales were created without selecting this lead person');
          } else {
            // Log a sample record for debugging
            console.log('Sample sales data:', leadPersonSales[0]);
          }
          
          if (isAutoRefresh) {
            toast.info("Sales data refreshed automatically");
          }
        } else {
          console.error('Failed to load lead sales data:', res.data);
          setError('Failed to load sales data: ' + (res.data?.message || 'Unknown error'));
        }
      } catch (apiError) {
        console.error('API service call failed:', apiError);
        setError('Failed to load sales data. Please try again.');
      }
    } catch (err) {
      console.error('Error loading sales data:', err);
      if (err.response) {
        console.error('Error details:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError('Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setFilterMonth(parseInt(e.target.value));
    setShowCurrentMonth(false);
    setShowAllSales(false); // Disable show all when selecting specific month
  };
  
  // Handle year change
  const handleYearChange = (e) => {
    setFilterYear(parseInt(e.target.value));
    setShowCurrentMonth(false);
    setShowAllSales(false); // Disable show all when selecting specific year
  };
  
  // Handle reset to current month
  const handleResetToCurrentMonth = () => {
    const today = new Date();
    setFilterMonth(today.getMonth() + 1);
    setFilterYear(today.getFullYear());
    setShowCurrentMonth(true);
    setShowAllSales(false); // Disable show all when resetting to current month
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
        console.log('Updated sale data from server:', response.data.data);
        toast.success("Sale updated successfully");
        
        // Update the local sales state with the updated sale
        setSales(prevSales => prevSales.map(sale => {
          if (sale._id === editingSaleId) {
            console.log('Updating sale in local state:', response.data.data);
            return response.data.data;
          }
          return sale;
        }));
        
        // Temporarily disable date filtering to show all sales so user can see their changes
        const wasShowingAllSales = showAllSales;
        if (!wasShowingAllSales) {
          setShowAllSales(true);
          toast.info("Showing all sales to display your changes. Use filters to narrow down if needed.");
        }
        
      } else {
        console.error('Failed to update sale:', response.data);
        setError("Failed to update sale: " + (response.data?.message || "Unknown error"));
      }
      
      setEditingSaleId(null);
      
      // Only reload data if the update failed, otherwise we've already updated the local state
      if (!response.data || !response.data.success) {
        loadSalesData();
      }
    } catch (err) {
      console.error('Error updating sale:', err);
      setError('Failed to update sale. Please try again.');
      setEditingSaleId(null);
      // Reload data on error to ensure consistency
      loadSalesData();
    }
  };

  const handleCancel = () => {
    setEditingSaleId(null);
  };

  const exportToExcel = () => {
    const fileName = `Lead-Sales-Sheet-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Format data for export - use the currently filtered sales
    const exportData = filteredSales.map(sale => ({
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lead Sales Sheet</h1>
            <p className="text-sm text-gray-600 mt-1">
              This page shows sales where you are the Lead Person. 
              Sales created by Sales Persons who select you as the Lead Person will appear here.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => loadSalesData(false)}
              disabled={refreshing}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {refreshing ? (
                <>
                  <FaSync className="mr-2 animate-spin" /> Refreshing...
                </>
              ) : (
                <>
                  <FaSync className="mr-2" /> Refresh
                </>
              )}
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
              <FaDownload className="mr-2" /> Export
            </button>
          </div>
        </div>
        
        {/* Date Filter Controls */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaFilter className="mr-2 text-blue-500" /> Filter Sales by Date
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-600 mb-1">Month</label>
              <select
                id="month"
                value={filterMonth}
                onChange={handleMonthChange}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={showCurrentMonth}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-600 mb-1">Year</label>
              <select
                id="year"
                value={filterYear}
                onChange={handleYearChange}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={showCurrentMonth}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center ml-4">
              <input
                id="currentMonth"
                type="checkbox"
                checked={showCurrentMonth}
                onChange={() => {
                  setShowCurrentMonth(!showCurrentMonth);
                  if (!showCurrentMonth) {
                    setShowAllSales(false); // Disable show all when showing current month
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="currentMonth" className="ml-2 block text-sm text-gray-700">
                Show Current Month Only
              </label>
            </div>
            
            <div className="flex items-center ml-4">
              <input
                id="showAllSales"
                type="checkbox"
                checked={showAllSales}
                onChange={() => {
                  setShowAllSales(!showAllSales);
                  if (!showAllSales) {
                    // When enabling show all, disable other filters
                    setShowCurrentMonth(false);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showAllSales" className="ml-2 block text-sm text-gray-700 font-semibold text-blue-600">
                Show All Sales (No Date Filter)
              </label>
            </div>
            
            <button
              onClick={handleResetToCurrentMonth}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md ml-auto transition duration-300 flex items-center"
            >
              <FaCalendar className="mr-2" /> Reset to Current Month
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            {showAllSales ? (
              <p>Showing all sales regardless of date: {sales.length} total records</p>
            ) : showCurrentMonth ? (
              <p>Showing sales for current month: {months[new Date().getMonth()].label} {new Date().getFullYear()}</p>
            ) : (
              <p>Showing sales for: {months[filterMonth - 1].label} {filterYear}</p>
            )}
            <p>Total: {filteredSales.length} records</p>
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
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="border px-4 py-2 text-center">
                      <div className="py-6">
                        <p className="text-gray-600 mb-2">No sales data found for you as a Lead Person.</p>
                        <p className="text-sm text-gray-500">
                          When Sales Persons create sales and select you as the Lead Person, they will appear here.
                          <br />
                          Ask Sales Persons to make sure they select your name in the Lead Person dropdown when creating sales.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => (
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