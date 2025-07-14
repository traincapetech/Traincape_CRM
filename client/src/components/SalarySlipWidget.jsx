import React, { useState, useEffect } from 'react';
import api, { payrollAPI } from '../services/api';

const SalarySlipWidget = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingSlip, setDownloadingSlip] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Remove automatic data fetching on component mount
  // useEffect(() => {
  //   fetchPayrollData();
  // }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await payrollAPI.getAll({ month: selectedMonth, year: selectedYear });
      setPayrollData(response.data.data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      alert('Error fetching payroll data: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchPayrollData();
  };

  const handleDownloadSlip = async (payrollId) => {
    setDownloadingSlip(payrollId);
    try {
      const response = await payrollAPI.generateSalarySlip(payrollId);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'salary-slip.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      alert('Error downloading salary slip: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setDownloadingSlip(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'DRAFT': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300',
      'PAID': 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses['DRAFT']}`}>
        {status}
      </span>
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);
  const months = [
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
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Salary Slips
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Manual Update Required
        </div>
      </div>

      {/* Manual Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Month:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Year:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Load Salary Slips</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      ) : payrollData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No salary slip found for the selected month and year
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click "Load Salary Slips" to fetch data or select a different month/year
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payrollData.map((payroll) => (
            <div key={payroll._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {payroll.monthName} {payroll.year}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generated on {new Date(payroll.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {getStatusBadge(payroll.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Working Days</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {payroll.workingDays}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-xs text-green-700 dark:text-green-400">Present Days</div>
                  <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {payroll.presentDays}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-xs text-blue-700 dark:text-blue-400">Gross Salary</div>
                  <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {formatCurrency(payroll.grossSalary)}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-xs text-purple-700 dark:text-purple-400">Net Salary</div>
                  <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    {formatCurrency(payroll.netSalary)}
                  </div>
                </div>
              </div>

              {payroll.status === 'APPROVED' || payroll.status === 'PAID' ? (
                <button
                  onClick={() => handleDownloadSlip(payroll._id)}
                  disabled={downloadingSlip === payroll._id}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  {downloadingSlip === payroll._id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span>Download Salary Slip</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-2 px-4 rounded-md text-center">
                  Salary slip not available (Status: {payroll.status})
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalarySlipWidget; 