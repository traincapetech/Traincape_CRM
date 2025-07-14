import React, { useState } from 'react';
import { FaUsers, FaCalendarAlt, FaClock, FaAddressBook, FaCog, FaMoneyBillWave } from 'react-icons/fa';
import Layout from '../components/Layout/Layout';
import EmployeeList from '../components/Employee/EmployeeList';
import EmployeeDirectory from '../components/Employee/EmployeeDirectory';
import BulkOperations from '../components/Employee/BulkOperations';
import LeaveManagement from '../components/Employee/LeaveManagement';
import LeaveApproval from '../components/Admin/LeaveApproval';
import AttendanceManagement from '../components/Employee/AttendanceManagement';
import PayrollComponent from '../components/Employee/PayrollComponent';
import { useAuth } from '../context/AuthContext';

const EmployeeManagementPage = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const { user } = useAuth();

  const tabs = [
    { id: 'employees', label: 'Employees', icon: FaUsers },
    { id: 'directory', label: 'Directory', icon: FaAddressBook },
    ...(user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR' ? 
      [{ id: 'bulk-ops', label: 'Bulk Operations', icon: FaCog }] : []),
    { id: 'leave', label: user?.role === 'Admin' || user?.role === 'Manager' ? 'Leave Approvals' : 'Leave Management', icon: FaCalendarAlt },
    { id: 'attendance', label: 'Attendance', icon: FaClock },
    ...(user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR' ? 
      [{ id: 'payroll', label: 'Payroll Management', icon: FaMoneyBillWave }] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeList />;
      case 'directory':
        return <EmployeeDirectory />;
      case 'bulk-ops':
        return <BulkOperations />;
      case 'leave':
        return user?.role === 'Admin' || user?.role === 'Manager' ? 
          <LeaveApproval /> : 
          <LeaveManagement userRole={user?.role} />;
      case 'attendance':
        return <AttendanceManagement userRole={user?.role} />;
      case 'payroll':
        return <PayrollComponent />;
      default:
        return <EmployeeList />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Employee Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your organization's employees, leave requests, and attendance
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        {renderContent()}
      </div>
    </Layout>
  );
};

export default EmployeeManagementPage; 