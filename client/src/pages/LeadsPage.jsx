// src/pages/LeadsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { leadsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LeadForm from "../components/Leads/LeadForm";
import Layout from "../components/Layout/Layout";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaEdit, FaTrash, FaFilter, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const LeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Date filtering state - Default to current month instead of March 2025
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1); // Current month
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear()); // Current year
  const [showCurrentMonth, setShowCurrentMonth] = useState(true); // Show current month by default
  
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
  
  // Generate year options (include current year + 1 and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i); // Include next year and 5 years back
  
  // Function to fetch leads from the API
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Current user:', user);
      
      // EMERGENCY FIX: Remove date filtering to show all leads
      console.log('Fetching ALL leads without date filters');
      const response = await leadsAPI.getAll({});
      console.log('API Response:', response.data);
      
      // Log the structure of the first lead to see available fields
      if (response.data && response.data.data && response.data.data.length > 0) {
        const firstLead = response.data.data[0];
        console.log('First lead object structure:', firstLead);
        console.log('All field names:', Object.keys(firstLead));
        console.log('Name value:', firstLead.name);
        console.log('NAME value:', firstLead.NAME);
      }
      
      // Set leads directly from API (no frontend filtering needed)
      setLeads(response.data.data || []);
      setFilteredLeads(response.data.data || []);
      console.log('Leads set in state:', response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
      // Set empty arrays to prevent undefined errors
      setLeads([]);
      setFilteredLeads([]);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Fetch leads on component mount only
  useEffect(() => {
    console.log('Component mounted, fetching all leads');
    fetchLeads();
  }, [fetchLeads]);
  
  // Filter leads based on selected month and year
  useEffect(() => {
    if (leads.length === 0) return;
    
    console.log('Filtering leads for:', { filterMonth, filterYear, showCurrentMonth });
    
    let filtered = leads;
    
    if (showCurrentMonth) {
      // Filter for current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      filtered = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        const leadMonth = leadDate.getMonth() + 1;
        const leadYear = leadDate.getFullYear();
        return leadMonth === currentMonth && leadYear === currentYear;
      });
    } else {
      // Filter for selected month/year
      filtered = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        const leadMonth = leadDate.getMonth() + 1;
        const leadYear = leadDate.getFullYear();
        return leadMonth === filterMonth && leadYear === filterYear;
      });
    }
    
    console.log(`Filtered ${filtered.length} leads from ${leads.length} total leads`);
    setFilteredLeads(filtered);
  }, [leads, filterMonth, filterYear, showCurrentMonth]);
  
  // Note: Date filtering is now handled on the backend via API query parameters
  // This ensures sales persons only receive leads for the selected time period
  // instead of loading all leads and filtering on frontend
  
  // Debug function to log current state
  const debugCurrentState = useCallback(() => {
    console.log('============= DEBUG CURRENT STATE =============');
    console.log('Current leads count:', leads.length);
    console.log('Current filteredLeads count:', filteredLeads.length);
    console.log('Filter settings:', { filterMonth, filterYear, showCurrentMonth });
    console.log('Selected lead:', selectedLead);
    console.log('Current date:', new Date());
    console.log('Filter date range:', {
      start: showCurrentMonth 
        ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        : new Date(filterYear, filterMonth - 1, 1),
      end: showCurrentMonth
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        : new Date(filterYear, filterMonth, 0)
    });
    console.log('First 3 leads in leads array:', leads.slice(0, 3).map(l => ({ 
      id: l._id, 
      name: l.name, 
      createdAt: l.createdAt,
      createdAtFormatted: new Date(l.createdAt).toLocaleDateString(),
      month: new Date(l.createdAt).getMonth() + 1,
      year: new Date(l.createdAt).getFullYear()
    })));
    console.log('First 3 leads in filteredLeads array:', filteredLeads.slice(0, 3).map(l => ({ 
      id: l._id, 
      name: l.name, 
      createdAt: l.createdAt,
      createdAtFormatted: new Date(l.createdAt).toLocaleDateString(),
      month: new Date(l.createdAt).getMonth() + 1,
      year: new Date(l.createdAt).getFullYear()
    })));
    console.log('============= END DEBUG STATE =============');
  }, [leads, filteredLeads, filterMonth, filterYear, showCurrentMonth, selectedLead]);
  
  // Force refetch function that bypasses all caching
  const forceRefetch = useCallback(async () => {
    console.log('=== FORCE REFETCH TRIGGERED ===');
    setLoading(true);
    try {
      // Clear current state first
      setLeads([]);
      setFilteredLeads([]);
      
      // Wait a moment to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch fresh data
      await fetchLeads();
      
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Force refetch failed:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchLeads]);
  
  // Function to handle successful lead creation/update
  const handleLeadSuccess = useCallback((lead) => {
    console.log('============= HANDLE LEAD SUCCESS =============');
    console.log('Lead success callback called with:', lead);
    
    if (selectedLead) {
      console.log('Lead updated successfully');
      setSelectedLead(null);
      
      // Show success message immediately
      toast.success('Lead updated successfully!');
      
      // Simple solution: Just refetch the data
      fetchLeads();
      
    } else {
      // Add new lead
      console.log('Adding new lead to list');
      setShowAddForm(false);
      fetchLeads();
      toast.success('Lead created successfully!');
    }
    
    console.log('============= END HANDLE LEAD SUCCESS =============');
  }, [selectedLead, fetchLeads]);
  
  // Handle month change
  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    console.log("Changing month to:", newMonth);
    setFilterMonth(newMonth);
    setShowCurrentMonth(false);
  };
  
  // Handle year change
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    console.log("Changing year to:", newYear);
    setFilterYear(newYear);
    setShowCurrentMonth(false);
  };
  
  // Handle reset to current month
  const handleResetToCurrentMonth = () => {
    setFilterMonth(new Date().getMonth() + 1);
    setFilterYear(new Date().getFullYear());
    setShowCurrentMonth(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Add AOS initialization in useEffect
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

  // Handle edit button click
  const handleEditClick = (lead) => {
    console.log("Edit clicked for lead:", lead);
    setSelectedLead(lead);
  };

  // Function to analyze date ranges in leads data
  const analyzeDateRanges = (leadsData) => {
    if (!leadsData || leadsData.length === 0) return null;
    
    const dateRanges = {};
    leadsData.forEach(lead => {
      const date = new Date(lead.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const monthName = months[date.getMonth()].label;
      const year = date.getFullYear();
      
      if (!dateRanges[monthYear]) {
        dateRanges[monthYear] = {
          month: date.getMonth() + 1,
          year: year,
          monthName: monthName,
          count: 0,
          leads: []
        };
      }
      dateRanges[monthYear].count++;
      dateRanges[monthYear].leads.push(lead);
    });
    
    return dateRanges;
  };

  // Function to get date range suggestions
  const getDateRangeSuggestions = () => {
    const ranges = analyzeDateRanges(leads);
    if (!ranges) return null;
    
    const sortedRanges = Object.values(ranges).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    return sortedRanges.slice(0, 3); // Top 3 date ranges
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 mb-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Leads Management</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  {filteredLeads.length} leads • {showCurrentMonth ? 'Current Month' : `${months.find(m => m.value === parseInt(filterMonth))?.label} ${filterYear}`}
                </p>
              </div>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 md:mt-0 bg-white hover:bg-blue-50 text-blue-600 py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center font-medium"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                Add New Lead
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {/* Add/Edit Lead Form */}
          {(showAddForm || selectedLead) && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedLead ? "Edit Lead" : "Add New Lead"}
                </h2>
              </div>
              <div className="p-6">
                <LeadForm 
                  lead={selectedLead}
                  onSuccess={handleLeadSuccess}
                />
                
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedLead(null);
                  }}
                  className="mt-6 text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Leads List
                </button>
              </div>
            </div>
          )}
          
          {/* Leads List */}
          {!showAddForm && !selectedLead && (
            <>
              {/* Date Filter Controls */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Filter Leads by Month</h3>
                  <FaFilter className="text-gray-500" />
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                      <select
                        id="month"
                        value={filterMonth}
                        onChange={handleMonthChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {months.map(month => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <select
                        id="year"
                        value={filterYear}
                        onChange={handleYearChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <div className="grid grid-cols-1 gap-2 w-full">
                        <button
                          onClick={handleResetToCurrentMonth}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Show Current Month
                        </button>
                        <button
                          onClick={() => {
                            setFilterMonth(3);
                            setFilterYear(2025);
                            setShowCurrentMonth(false);
                          }}
                          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                        >
                          📁 March 2025 (Imported Leads)
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Showing {filteredLeads.length} leads for {showCurrentMonth ? 'current month' : `${months.find(m => m.value === parseInt(filterMonth))?.label} ${filterYear}`}</span>
                  </div>
                </div>
              </div>
              
              {/* Leads Cards */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Leads Overview ({filteredLeads.length})</h3>
                </div>
                
                {loading ? (
                  <div className="p-12 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="ml-4 text-gray-600">Loading leads...</p>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No leads found</h3>
                    <p className="text-gray-500 mb-6">No leads were found for the selected time period</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Your First Lead
                    </button>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredLeads.map((lead) => (
                        <div key={lead._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{lead.name}</h3>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                lead.feedback === 'Converted' 
                                  ? 'bg-green-100 text-green-800' 
                                  : lead.feedback === 'Not Interested' 
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {lead.feedback || 'Pending'}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="ml-2 inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-full transition-colors duration-200"
                              title="Edit Lead"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 w-16">Course:</span>
                              <span>{lead.course}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 w-16">Phone:</span>
                              <span>{lead.phone || lead.countryCode}</span>
                            </div>
                            {lead.email && (
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700 w-16">Email:</span>
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 w-16">Country:</span>
                              <span>{lead.country || lead.countryCode}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 w-16">Date:</span>
                              <span>{formatDate(lead.createdAt)}</span>
                            </div>
                            {lead.assignedTo && (
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700 w-16">Assigned:</span>
                                <span className="text-blue-600">
                                  {typeof lead.assignedTo === 'object' 
                                    ? lead.assignedTo.fullName || lead.assignedTo.name || 'Unknown User'
                                    : lead.assignedTo
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeadsPage;
