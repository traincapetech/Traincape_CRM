import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { leadsAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const AdminLeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    country: "",
    course: "",
    source: "",
    dateFrom: "",
    dateTo: "",
    assignedTo: "",
    leadPerson: ""
  });
  
  // Options for filters
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    courses: [],
    sources: [],
    salesPersons: [],
    leadPersons: []
  });

  // Lead statuses
  const statusOptions = [
    'New', 
    'Contacted', 
    'Qualified',  
    'Lost', 
    'Converted', 
    'Introduction', 
    'Acknowledgement', 
    'Question', 
    'Future Promise', 
    'Payment', 
    'Analysis'
  ];

  useEffect(() => {
    fetchLeads();
    fetchUserOptions();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      applyFilters();
      extractFilterOptions();
    }
  }, [leads, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll();
      
      if (response.data.success) {
        setLeads(response.data.data);
        setFilteredLeads(response.data.data);
        setError(null);
      } else {
        setError("Failed to load leads");
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOptions = async () => {
    try {
      const salesPersonsResponse = await authAPI.getUsers("Sales Person");
      const leadPersonsResponse = await authAPI.getUsers("Lead Person");
      
      setFilterOptions(prev => ({
        ...prev,
        salesPersons: salesPersonsResponse.data.data || [],
        leadPersons: leadPersonsResponse.data.data || []
      }));
    } catch (err) {
      console.error("Error fetching user options:", err);
    }
  };

  const extractFilterOptions = () => {
    // Extract unique values for filter options
    const countries = [...new Set(leads.map(lead => lead.country).filter(Boolean))];
    const courses = [...new Set(leads.map(lead => lead.course).filter(Boolean))];
    const sources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];
    
    setFilterOptions(prev => ({
      ...prev,
      countries,
      courses,
      sources
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      country: "",
      course: "",
      source: "",
      dateFrom: "",
      dateTo: "",
      assignedTo: "",
      leadPerson: ""
    });
  };

  const applyFilters = () => {
    let filtered = [...leads];
    
    // Text search (name, email, phone, pseudoId)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(lead => 
        (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.pseudoId && lead.pseudoId.toLowerCase().includes(searchTerm))
      );
    }
    
    // Status filter
    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }
    
    // Country filter
    if (filters.country) {
      filtered = filtered.filter(lead => lead.country === filters.country);
    }
    
    // Course filter
    if (filters.course) {
      filtered = filtered.filter(lead => lead.course === filters.course);
    }
    
    // Source filter
    if (filters.source) {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }
    
    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(lead => new Date(lead.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(lead => new Date(lead.createdAt) <= toDate);
    }
    
    // Assigned To filter
    if (filters.assignedTo) {
      filtered = filtered.filter(lead => 
        lead.assignedTo && lead.assignedTo._id === filters.assignedTo
      );
    }
    
    // Lead Person filter
    if (filters.leadPerson) {
      filtered = filtered.filter(lead => 
        lead.leadPerson && lead.leadPerson._id === filters.leadPerson
      );
    }
    
    setFilteredLeads(filtered);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Leads Management</h1>
          <Link
            to="/leads"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md transition"
          >
            Standard Leads View
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Advanced Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Advanced Filters</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Field */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search name, email, phone..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            {/* Country Filter */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {filterOptions.countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            {/* Course Filter */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course
              </label>
              <select
                id="course"
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              >
                <option value="">All Courses</option>
                {filterOptions.courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            
            {/* Source Filter */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Source
              </label>
              <select
                id="source"
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              >
                <option value="">All Sources</option>
                {filterOptions.sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            
            {/* Date Range - From */}
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date From
              </label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              />
            </div>
            
            {/* Date Range - To */}
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date To
              </label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              />
            </div>
            
            {/* Assigned To Filter */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assigned To
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={filters.assignedTo}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              >
                <option value="">All Sales Persons</option>
                {filterOptions.salesPersons.map(salesPerson => (
                  <option key={salesPerson._id} value={salesPerson._id}>
                    {salesPerson.fullName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Lead Person Filter */}
            <div>
              <label htmlFor="leadPerson" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Lead Person
              </label>
              <select
                id="leadPerson"
                name="leadPerson"
                value={filters.leadPerson}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
              >
                <option value="">All Lead Persons</option>
                {filterOptions.leadPersons.map(leadPerson => (
                  <option key={leadPerson._id} value={leadPerson._id}>
                    {leadPerson.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-medium">{filteredLeads.length} Leads Found</h3>
              <div className="text-sm text-slate-500 dark:text-gray-400">
                Showing filtered results from a total of {leads.length} leads
              </div>
            </div>
            
            {filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-gray-400">
                No leads found matching your filters. Try adjusting your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Country
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Lead By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredLeads.map((lead, index) => (
                      <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {lead.name}
                            {lead.isRepeatCustomer && (
                              <span 
                                className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                title={`Repeat customer! Previous courses: ${lead.previousCourses?.join(', ') || 'None'}`}
                              >
                                Repeat
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-gray-400">{lead.pseudoId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-slate-100">{lead.email}</div>
                          <div className="text-sm text-slate-500 dark:text-gray-400">
                            {lead.countryCode} {lead.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-slate-100">{lead.course}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${lead.status === 'Introduction' ? 'bg-blue-100 text-blue-800' : 
                            lead.status === 'Acknowledgement' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'Question' ? 'bg-purple-100 text-purple-800' :
                            lead.status === 'Future Promise' ? 'bg-red-100 text-red-800' :
                            lead.status === 'Payment' ? 'bg-green-100 text-green-800' :
                            lead.status === 'Analysis' ? 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200' :
                            'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}
                          `}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {lead.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {lead.assignedTo ? lead.assignedTo.fullName : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {lead.leadPerson ? lead.leadPerson.fullName : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          <Link
                            to={`/leads#${lead._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminLeadsPage; 