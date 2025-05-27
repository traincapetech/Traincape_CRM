import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { salesAPI, leadsAPI, authAPI, currencyAPI } from '../services/api';
import { FaFilter, FaCalendar, FaChartBar, FaChartPie, FaChartLine, FaFileExport, FaTable, FaSortDown, FaSortUp, FaSort } from 'react-icons/fa';
import { formatCurrency, convertCurrency, getCurrencySettings, setCurrencySettings, BASE_CURRENCY } from '../utils/helpers';
import * as XLSX from 'xlsx';
import CurrencySelector from '../components/CurrencySelector';
import axios from 'axios';

// Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminReportsPage = () => {
  // State for loading status and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for sales and lead data
  const [sales, setSales] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  
  // State for exchange rates
  const [exchangeRates, setExchangeRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  // State for time-based filters
  const [timeFrame, setTimeFrame] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentQuarter, setCurrentQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'sales', 'courses', 'detailed'
  
  // State for table sorting
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Years for year selection
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);
  
  // Months for month selection
  const months = useMemo(() => [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ], []);
  
  // Quarters for quarter selection
  const quarters = useMemo(() => [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ], []);
  
  // Listen for currency setting changes
  useEffect(() => {
    const settings = getCurrencySettings();
    setSelectedCurrency(settings.currency);
    setExchangeRates(settings.exchangeRates);
    
    // Define a handler function for storage events
    const handleStorageChange = () => {
      const newSettings = getCurrencySettings();
      setSelectedCurrency(newSettings.currency);
      setExchangeRates(newSettings.exchangeRates);
    };
    
    // Add event listener for changes in localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Update filtered sales when timeframe or filters change
  useEffect(() => {
    if (sales.length > 0) {
      filterSalesByTimeFrame();
    }
  }, [sales, timeFrame, currentYear, currentMonth, currentQuarter, selectedCurrency]);

  // Function to fetch all required data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sales data with robust error handling
      let salesData = [];
      try {
        // Use direct axios for more reliable data fetching with full=true to get all sales
        const token = localStorage.getItem('token');
        const salesResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/sales?full=true&nocache=${new Date().getTime()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Log the full response for debugging
        console.log("AdminReportsPage - Full sales response:", salesResponse);
        
        // Check if we have data in the expected format
        if (salesResponse.data && salesResponse.data.success && salesResponse.data.data && Array.isArray(salesResponse.data.data)) {
          salesData = salesResponse.data.data;
          console.log("AdminReportsPage - Sales count from direct axios call:", salesData.length);
        } else if (salesResponse.data && Array.isArray(salesResponse.data)) {
          // Handle case where data might be directly in the response
          salesData = salesResponse.data;
          console.log("AdminReportsPage - Sales count from direct array response:", salesData.length);
        } else {
          console.warn("AdminReportsPage - Unexpected sales response format:", salesResponse.data);
          // Fallback to empty array
          salesData = [];
        }
      } catch (salesError) {
        console.error('AdminReportsPage - Error fetching sales with direct axios:', salesError);
        
        // Fallback to the API service as a second attempt
        try {
          const fallbackResponse = await salesAPI.getAllForced();
          if (fallbackResponse.data && fallbackResponse.data.success) {
            salesData = fallbackResponse.data.data;
            console.log("AdminReportsPage - Sales count from fallback API:", salesData.length);
          }
        } catch (fallbackError) {
          console.error("AdminReportsPage - Fallback sales fetch also failed:", fallbackError);
          salesData = []; // Ensure we have an empty array as fallback
        }
      }
      
      // Fetch leads data
      const leadsResponse = await leadsAPI.getAll();
      const leadsData = leadsResponse.data.success ? leadsResponse.data.data : [];
      
      // Fetch exchange rates
      const ratesResponse = await currencyAPI.getRates();
      let ratesData = {};
      if (ratesResponse.data.success) {
        ratesData = ratesResponse.data.data;
        // Update currency settings with latest rates
        setCurrencySettings({ exchangeRates: ratesData });
      } else {
        // Use default rates if API fails
        ratesData = getCurrencySettings().exchangeRates;
      }
      
      // Process the sales data to ensure consistency
      const processedSales = salesData.map(sale => {
        return {
          ...sale,
          // Ensure we have standard field names
          id: sale._id,
          date: new Date(sale.date || sale.createdAt),
          customerName: sale.customerName || (sale.leadId && (sale.leadId.name || sale.leadId.NAME)) || 'Unknown',
          course: sale.course || sale.product || 'Unknown',
          // Ensure financial fields are consistent and numbers
          totalCost: parseFloat(sale.totalCost || sale.amount || 0),
          tokenAmount: parseFloat(sale.tokenAmount || sale.token || 0),
          pendingAmount: parseFloat(sale.status === 'Completed' ? 0 : 
            (sale.pendingAmount || (sale.totalCost || sale.amount || 0) - (sale.tokenAmount || sale.token || 0))),
          // Ensure we have the currency
          currency: sale.currency || 'USD'
        };
      });
      
      // Set state with the data
      setSales(processedSales);
      setLeads(leadsData);
      setExchangeRates(ratesData);
      
      // Initial filtering
      filterSalesByTimeFrame(processedSales);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to filter sales by the selected time frame
  const filterSalesByTimeFrame = (salesData = sales) => {
    // Use passed salesData or fall back to state
    const data = salesData || [];
    
    let filteredData = [];
    
    switch (timeFrame) {
      case 'monthly':
        // Filter by selected month and year
        filteredData = data.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getMonth() + 1 === currentMonth && 
                 saleDate.getFullYear() === currentYear;
        });
        break;
        
      case 'quarterly':
        // Filter by selected quarter and year
        filteredData = data.filter(sale => {
          const saleDate = new Date(sale.date);
          const saleMonth = saleDate.getMonth() + 1;
          const saleQuarter = Math.ceil(saleMonth / 3);
          return saleQuarter === currentQuarter && 
                 saleDate.getFullYear() === currentYear;
        });
        break;
        
      case 'yearly':
        // Filter by selected year
        filteredData = data.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getFullYear() === currentYear;
        });
        break;
        
      default:
        filteredData = data;
    }
    
    // Apply sorting
    filteredData = sortSalesData(filteredData, sortField, sortDirection);
    
    // Update state
    setFilteredSales(filteredData);
  };
  
  // Function to sort sales data
  const sortSalesData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;
      
      // Handle different field types
      switch (field) {
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'totalCost':
        case 'tokenAmount':
        case 'pendingAmount':
          // Convert all to a common currency for sorting
          valueA = convertCurrency(a[field], 'USD');
          valueB = convertCurrency(b[field], 'USD');
          break;
        default:
          valueA = a[field] || '';
          valueB = b[field] || '';
      }
      
      // String comparison for non-numeric fields
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // Numeric comparison
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  };
  
  // Handle sort column change
  const handleSort = (field) => {
    const newDirection = 
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // Re-sort the data
    const sorted = sortSalesData(filteredSales, field, newDirection);
    setFilteredSales(sorted);
  };
  
  // Get sort icon for a column
  const getSortIcon = (field) => {
    if (field !== sortField) return <FaSort className="ml-1" />;
    return sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };
  
  // Calculate summary statistics from filtered sales
  const calculateSummaryStats = () => {
    if (!filteredSales.length) return { totalSales: 0, totalRevenue: 0, totalToken: 0, totalPending: 0, averageSaleValue: 0 };
    
    // Initialize values
    let totalRevenue = 0;
    let totalToken = 0;
    let totalPending = 0;
    
    // Process each sale
    filteredSales.forEach(sale => {
      // Convert amounts to the selected currency
      const totalCostInSelectedCurrency = convertAmountToSelectedCurrency(sale.totalCost, sale.currency);
      const tokenAmountInSelectedCurrency = convertAmountToSelectedCurrency(sale.tokenAmount, sale.currency);
      const pendingAmountInSelectedCurrency = convertAmountToSelectedCurrency(sale.pendingAmount, sale.currency);
      
      // Add to totals
      totalRevenue += totalCostInSelectedCurrency;
      totalToken += tokenAmountInSelectedCurrency;
      totalPending += pendingAmountInSelectedCurrency;
    });
    
    // Calculate average sale value
    const averageSaleValue = filteredSales.length ? totalRevenue / filteredSales.length : 0;
    
    return {
      totalSales: filteredSales.length,
      totalRevenue,
      totalToken,
      totalPending,
      averageSaleValue
    };
  };
  
  // Helper function to convert amount to selected currency
  const convertAmountToSelectedCurrency = (amount, fromCurrency) => {
    if (!amount) return 0;
    
    // If currencies match, no conversion needed
    if (fromCurrency === selectedCurrency) return amount;
    
    // Get exchange rates
    const rates = exchangeRates || getCurrencySettings().exchangeRates;
    
    // Convert to USD first (if not already USD)
    let amountInUSD;
    if (fromCurrency === 'USD') {
      amountInUSD = amount;
    } else {
      // If rate is available, use it, otherwise use a default 1:1 rate
      const fromRate = rates[fromCurrency] || 1;
      amountInUSD = amount / fromRate;
    }
    
    // Then convert from USD to selected currency
    const toRate = rates[selectedCurrency] || 1;
    return amountInUSD * toRate;
  };
  
  // Group sales by course and calculate metrics
  const calculateCourseMetrics = () => {
    if (!filteredSales.length) return [];
    
    const courseData = {};
    
    // Process each sale
    filteredSales.forEach(sale => {
      const course = sale.course || 'Unknown';
      const totalCostInSelectedCurrency = convertAmountToSelectedCurrency(sale.totalCost, sale.currency);
      
      // Initialize course data if it doesn't exist
      if (!courseData[course]) {
        courseData[course] = {
          name: course,
          count: 0,
          totalRevenue: 0
        };
      }
      
      // Update course metrics
      courseData[course].count += 1;
      courseData[course].totalRevenue += totalCostInSelectedCurrency;
    });
    
    // Convert to array and sort by count (most popular first)
    return Object.values(courseData).sort((a, b) => b.count - a.count);
  };
  
  // Group sales by month/quarter/year for trend analysis
  const calculateTimeTrends = () => {
    if (!filteredSales.length) return [];
    
    const timeData = {};
    let timeFormat = '';
    
    // Determine format based on time frame
    switch (timeFrame) {
      case 'monthly':
        timeFormat = 'day'; // Group by day within month
        break;
      case 'quarterly':
        timeFormat = 'month'; // Group by month within quarter
        break;
      case 'yearly':
        timeFormat = 'month'; // Group by month within year
        break;
      default:
        timeFormat = 'month';
    }
    
    // Process each sale
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      let timeKey;
      
      // Format the time key based on time frame
      if (timeFormat === 'day') {
        timeKey = saleDate.getDate().toString(); // Day of month (1-31)
      } else if (timeFormat === 'month') {
        timeKey = (saleDate.getMonth() + 1).toString(); // Month (1-12)
      } else {
        timeKey = saleDate.getFullYear().toString(); // Year
      }
      
      const totalCostInSelectedCurrency = convertAmountToSelectedCurrency(sale.totalCost, sale.currency);
      
      // Initialize time data if it doesn't exist
      if (!timeData[timeKey]) {
        timeData[timeKey] = {
          timeKey,
          count: 0,
          totalRevenue: 0
        };
      }
      
      // Update time metrics
      timeData[timeKey].count += 1;
      timeData[timeKey].totalRevenue += totalCostInSelectedCurrency;
    });
    
    // Convert to array and sort by time key
    return Object.values(timeData).sort((a, b) => {
      return parseInt(a.timeKey) - parseInt(b.timeKey);
    });
  };
  
  // Format trend data for chart display
  const formatTrendDataForChart = () => {
    const trendData = calculateTimeTrends();
    
    // Format labels based on time frame
    let labels = [];
    if (timeFrame === 'monthly') {
      // Days in month
      labels = trendData.map(item => `Day ${item.timeKey}`);
    } else if (timeFrame === 'quarterly') {
      // Months in quarter
      labels = trendData.map(item => months.find(m => m.value === parseInt(item.timeKey))?.label || item.timeKey);
    } else {
      // Months in year
      labels = trendData.map(item => months.find(m => m.value === parseInt(item.timeKey))?.label || item.timeKey);
    }
    
    // Dataset for revenue
    const revenueData = trendData.map(item => item.totalRevenue);
    
    // Dataset for count
    const countData = trendData.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Number of Sales',
          data: countData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };
  
  // Format course data for chart display
  const formatCourseDataForChart = () => {
    const courseData = calculateCourseMetrics();
    
    // Only show top 10 courses for readability
    const topCourses = courseData.slice(0, 10);
    
    // Labels (course names)
    const labels = topCourses.map(course => course.name);
    
    // Dataset for count
    const countData = topCourses.map(course => course.count);
    
    // Dataset for revenue
    const revenueData = topCourses.map(course => course.totalRevenue);
    
    return {
      labels,
      countData,
      revenueData,
    };
  };
  
  // Function to handle exporting data to Excel
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredSales.map(sale => ({
      Date: new Date(sale.date).toLocaleDateString(),
      Customer: sale.customerName,
      Course: sale.course,
      'Total Cost': formatCurrency(convertAmountToSelectedCurrency(sale.totalCost, sale.currency)),
      'Token Amount': formatCurrency(convertAmountToSelectedCurrency(sale.tokenAmount, sale.currency)),
      'Pending Amount': formatCurrency(convertAmountToSelectedCurrency(sale.pendingAmount, sale.currency)),
      Status: sale.status,
      'Original Currency': sale.currency
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
    
    // Generate filename based on current filter
    let filename;
    if (timeFrame === 'monthly') {
      filename = `Sales_Report_${months.find(m => m.value === currentMonth)?.label}_${currentYear}.xlsx`;
    } else if (timeFrame === 'quarterly') {
      filename = `Sales_Report_Q${currentQuarter}_${currentYear}.xlsx`;
    } else {
      filename = `Sales_Report_${currentYear}.xlsx`;
    }
    
    // Export to file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sales Reports</h1>
            <p className="text-sm text-gray-600 mt-1">Comprehensive sales analytics and reporting</p>
          </div>
          <Link to="/admin" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Loading and error states */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center mb-4 md:mb-0">
                  <FaFilter className="mr-2 text-blue-500" /> Report Filters
                </h2>
                
                <div className="flex items-center">
                  <div className="mr-4">
                    <CurrencySelector darkMode={false} />
                  </div>
                  
                  <button 
                    onClick={exportToExcel}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    <FaFileExport className="mr-2" /> Export
                  </button>
                </div>
              </div>
              
              {/* Time Frame Selection */}
              <div className="mb-6">
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setTimeFrame('monthly')}
                    className={`px-4 py-2 rounded-md ${timeFrame === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimeFrame('quarterly')}
                    className={`px-4 py-2 rounded-md ${timeFrame === 'quarterly' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    Quarterly
                  </button>
                  <button
                    onClick={() => setTimeFrame('yearly')}
                    className={`px-4 py-2 rounded-md ${timeFrame === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    Yearly
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  {/* Month selector (visible when timeFrame is 'monthly') */}
                  {timeFrame === 'monthly' && (
                    <div>
                      <label htmlFor="month" className="block text-sm font-medium text-gray-600 mb-1">Month</label>
                      <select
                        id="month"
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Quarter selector (visible when timeFrame is 'quarterly') */}
                  {timeFrame === 'quarterly' && (
                    <div>
                      <label htmlFor="quarter" className="block text-sm font-medium text-gray-600 mb-1">Quarter</label>
                      <select
                        id="quarter"
                        value={currentQuarter}
                        onChange={(e) => setCurrentQuarter(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {quarters.map(quarter => (
                          <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Year selector (always visible) */}
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-600 mb-1">Year</label>
                    <select
                      id="year"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs for different report views */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FaChartLine className="inline mr-2" /> Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('sales')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'sales'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FaChartBar className="inline mr-2" /> Sales Trends
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'courses'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FaChartPie className="inline mr-2" /> Course Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('detailed')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'detailed'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FaTable className="inline mr-2" /> Detailed Data
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Summary Statistics Cards */}
            {activeTab === 'overview' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Sales Card */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
                        <p className="text-3xl font-bold mt-1">{calculateSummaryStats().totalSales}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Revenue Card */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(calculateSummaryStats().totalRevenue)}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Token Amount Card */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Token Amount</h3>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(calculateSummaryStats().totalToken)}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pending Amount Card */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Pending Amount</h3>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(calculateSummaryStats().totalPending)}</p>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Overview Charts */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Trend Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
                    <div className="h-80">
                      {filteredSales.length > 0 ? (
                        <Line 
                          data={formatTrendDataForChart()} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              mode: 'index',
                              intersect: false,
                            },
                            scales: {
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                  display: true,
                                  text: `Revenue (${selectedCurrency})`
                                }
                              },
                              y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                grid: {
                                  drawOnChartArea: false,
                                },
                                title: {
                                  display: true,
                                  text: 'Number of Sales'
                                }
                              },
                            },
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500">No data available for the selected period</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Top Courses Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Top Courses</h3>
                    <div className="h-80">
                      {calculateCourseMetrics().length > 0 ? (
                        <Bar 
                          data={{
                            labels: formatCourseDataForChart().labels,
                            datasets: [
                              {
                                label: 'Number of Sales',
                                data: formatCourseDataForChart().countData,
                                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Top Courses by Number of Sales'
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500">No data available for the selected period</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sales Trends Tab */}
            {activeTab === 'sales' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Sales Trends</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue and Sales Over Time</h3>
                  <div className="h-96">
                    {filteredSales.length > 0 ? (
                      <Line 
                        data={formatTrendDataForChart()} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            mode: 'index',
                            intersect: false,
                          },
                          scales: {
                            y: {
                              type: 'linear',
                              display: true,
                              position: 'left',
                              title: {
                                display: true,
                                text: `Revenue (${selectedCurrency})`
                              }
                            },
                            y1: {
                              type: 'linear',
                              display: true,
                              position: 'right',
                              grid: {
                                drawOnChartArea: false,
                              },
                              title: {
                                display: true,
                                text: 'Number of Sales'
                              }
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">No data available for the selected period</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sales Summary Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Period
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sales Count
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {calculateTimeTrends().map((period, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {timeFrame === 'monthly' ? `Day ${period.timeKey}` : 
                               timeFrame === 'quarterly' ? months.find(m => m.value === parseInt(period.timeKey))?.label : 
                               months.find(m => m.value === parseInt(period.timeKey))?.label}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {period.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(period.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Course Analysis Tab */}
            {activeTab === 'courses' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Course Analysis</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Course Sales Count Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Course Sales Count</h3>
                    <div className="h-96">
                      {calculateCourseMetrics().length > 0 ? (
                        <Bar 
                          data={{
                            labels: formatCourseDataForChart().labels,
                            datasets: [
                              {
                                label: 'Number of Sales',
                                data: formatCourseDataForChart().countData,
                                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Top Courses by Number of Sales'
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500">No data available for the selected period</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Course Revenue Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Course Revenue</h3>
                    <div className="h-96">
                      {calculateCourseMetrics().length > 0 ? (
                        <Pie 
                          data={{
                            labels: formatCourseDataForChart().labels,
                            datasets: [
                              {
                                label: `Revenue (${selectedCurrency})`,
                                data: formatCourseDataForChart().revenueData,
                                backgroundColor: [
                                  'rgba(255, 99, 132, 0.5)',
                                  'rgba(54, 162, 235, 0.5)',
                                  'rgba(255, 206, 86, 0.5)',
                                  'rgba(75, 192, 192, 0.5)',
                                  'rgba(153, 102, 255, 0.5)',
                                  'rgba(255, 159, 64, 0.5)',
                                  'rgba(199, 199, 199, 0.5)',
                                  'rgba(83, 102, 255, 0.5)',
                                  'rgba(78, 252, 173, 0.5)',
                                  'rgba(255, 99, 255, 0.5)'
                                ],
                                borderWidth: 1
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right',
                              },
                              title: {
                                display: true,
                                text: 'Revenue by Course'
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500">No data available for the selected period</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Course Details Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Course Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sales Count
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg. Sale Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {calculateCourseMetrics().map((course, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {course.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(course.totalRevenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(course.totalRevenue / course.count)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Detailed Data Tab */}
            {activeTab === 'detailed' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Detailed Sales Data</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                            <div className="flex items-center">
                              Date {getSortIcon('date')}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('customerName')}>
                            <div className="flex items-center">
                              Customer {getSortIcon('customerName')}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('course')}>
                            <div className="flex items-center">
                              Course {getSortIcon('course')}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalCost')}>
                            <div className="flex items-center">
                              Total Cost {getSortIcon('totalCost')}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('tokenAmount')}>
                            <div className="flex items-center">
                              Token Amount {getSortIcon('tokenAmount')}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('pendingAmount')}>
                            <div className="flex items-center">
                              Pending Amount {getSortIcon('pendingAmount')}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                            <div className="flex items-center">
                              Status {getSortIcon('status')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSales.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                              No sales data found for the selected period
                            </td>
                          </tr>
                        ) : (
                          filteredSales.map((sale, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(sale.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {sale.customerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {sale.course}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(convertAmountToSelectedCurrency(sale.totalCost, sale.currency))}
                                {sale.currency !== selectedCurrency && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (orig: {sale.currency})
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(convertAmountToSelectedCurrency(sale.tokenAmount, sale.currency))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(convertAmountToSelectedCurrency(sale.pendingAmount, sale.currency))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  sale.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                  sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {sale.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminReportsPage; 