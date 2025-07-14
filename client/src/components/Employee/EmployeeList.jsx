import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import employeeAPI from '../../services/employeeAPI';
import AddEmployeeDialog from './AddEmployeeDialog';
import EmployeeDetailsDialog from './EmployeeDetailsDialog';
import EditEmployeeDialog from './EditEmployeeDialog';

const EmployeeList = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeAPI.getAll();
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching employees');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await employeeAPI.getDepartments();
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await employeeAPI.getRoles();
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setDeletingId(id);
      try {
        const response = await employeeAPI.delete(id);
        if (response.data.success) {
          setEmployees(employees.filter(emp => emp._id !== id));
        } else {
          alert('Failed to delete employee. Please try again.');
        }
      } catch (err) {
        alert('Failed to delete employee. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowEditDialog(true);
  };

  const handleViewDetails = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowDetailsDialog(true);
  };

  const filteredEmployees = employees.filter((employee) => {
    const departmentName = typeof employee.department === 'object' && employee.department !== null
      ? employee.department.name
      : employee.department;
    const roleName = typeof employee.role === 'object' && employee.role !== null
      ? employee.role.name
      : employee.role;

    return (
      employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Employee Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your organization's employees</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Employee</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{error}</span>
          <button
            onClick={fetchEmployees}
            className="ml-auto text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 px-2 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No employees found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <div key={employee._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  {employee.photograph ? (
                    <img
                      src={`/api/uploads/${employee.photograph}`}
                      alt={employee.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                      {employee.fullName ? employee.fullName[0] : 'E'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
                    onClick={() => handleViewDetails(employee._id)}
                  >
                    {employee.fullName || 'No Name'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {typeof employee.role === 'object' && employee.role !== null ? employee.role.name : employee.role || 'No Role'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  employee.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {employee.status?.toLowerCase() || 'unknown'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {employee.email || 'No Email'}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Department:</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {typeof employee.department === 'object' && employee.department !== null ? employee.department.name : employee.department || 'N/A'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Salary:</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {employee.salary ? `₹${employee.salary.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Joining Date:</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {employee.phoneNumber && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">Phone:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{employee.phoneNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleEdit(employee._id)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(employee._id)}
                  disabled={deletingId === employee._id}
                  className="bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {deletingId === employee._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEmployeeAdded={fetchEmployees}
        departments={departments}
        roles={roles}
      />

      <EmployeeDetailsDialog
        employeeId={selectedEmployeeId}
        isOpen={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <EditEmployeeDialog
        employeeId={selectedEmployeeId}
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        onEmployeeUpdated={fetchEmployees}
        departments={departments}
        roles={roles}
      />
    </div>
  );
};

export default EmployeeList; 