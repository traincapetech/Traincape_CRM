// src/pages/LeadsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { leadsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LeadForm from "../components/Leads/LeadForm";
import Layout from "../components/Layout/Layout";
import AOS from 'aos';
import 'aos/dist/aos.css';

const LeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Date filtering state
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
  const [showCurrentMonth, setShowCurrentMonth] = useState(true); // Flag to show current month by default
  
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
  
  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);
  
  // Apply date filters when leads, month, or year changes
  useEffect(() => {
    if (leads.length > 0) {
      filterLeadsByDate();
    }
  }, [leads, filterMonth, filterYear, showCurrentMonth]);
  
  // Function to filter leads by selected date
  const filterLeadsByDate = () => {
    if (showCurrentMonth) {
      // Show current month data
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();
      
      const filtered = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return (
          leadDate.getMonth() + 1 === currentMonth && 
          leadDate.getFullYear() === currentYear
        );
      });
      
      setFilteredLeads(filtered);
    } else {
      // Show selected month/year data
      const filtered = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return (
          leadDate.getMonth() + 1 === filterMonth && 
          leadDate.getFullYear() === filterYear
        );
      });
      
      setFilteredLeads(filtered);
    }
  };
  
  // Function to fetch leads from the API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      console.log('Current user:', user);
      const response = await leadsAPI.getAll();
      console.log('API Response:', response.data);
      setLeads(response.data.data);
      // Initially filter for current month
      filterLeadsByDate(response.data.data);
      console.log('Leads set in state:', response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle successful lead creation/update
  const handleLeadSuccess = (lead) => {
    if (selectedLead) {
      // Update the leads list with the updated lead
      const updatedLeads = leads.map(l => l._id === lead._id ? lead : l);
      setLeads(updatedLeads);
      setSelectedLead(null);
    } else {
      // Add the new lead to the leads list
      const updatedLeads = [...leads, lead];
      setLeads(updatedLeads);
      setShowAddForm(false);
    }
  };
  
  // Handle month change
  const handleMonthChange = (e) => {
    setFilterMonth(parseInt(e.target.value));
    setShowCurrentMonth(false);
  };
  
  // Handle year change
  const handleYearChange = (e) => {
    setFilterYear(parseInt(e.target.value));
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

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 mb-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center" data-aos="fade-down">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Leads Management</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  {filteredLeads.length} leads • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              {!showAddForm && !selectedLead && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 md:mt-0 bg-white hover:bg-blue-50 text-blue-600 py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Lead
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm" data-aos="fade-up">
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
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8" data-aos="fade-up">
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
          
          {/* Leads Table */}
          {!showAddForm && !selectedLead && (
            <>
              {/* Date Filter Controls */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8" data-aos="fade-up">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Filter Leads</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="w-full md:w-auto">
                      <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                      <select
                        id="month"
                        value={filterMonth}
                        onChange={handleMonthChange}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={showCurrentMonth}
                      >
                        {months.map(month => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-full md:w-auto">
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <select
                        id="year"
                        value={filterYear}
                        onChange={handleYearChange}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={showCurrentMonth}
                      >
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center ml-0 md:ml-4 mt-4 md:mt-0">
                      <input
                        id="currentMonth"
                        type="checkbox"
                        checked={showCurrentMonth}
                        onChange={() => setShowCurrentMonth(!showCurrentMonth)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="currentMonth" className="ml-2 block text-sm text-gray-700">
                        Show Current Month Only
                      </label>
                    </div>
                    
                    <button
                      onClick={handleResetToCurrentMonth}
                      className="ml-auto mt-4 md:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Reset Filters
                    </button>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500 flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Showing {filteredLeads.length} leads for {showCurrentMonth ? 'current month' : `${months.find(m => m.value === filterMonth)?.label} ${filterYear}`}</span>
                  </div>
                </div>
              </div>
              
              {/* Leads Table Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Leads Overview</h3>
                </div>
                
                {loading ? (
                  <div className="p-12 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.map((lead) => (
                          <tr key={lead._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 font-medium text-sm">
                                    {lead.name?.charAt(0)}{lead.name?.split(' ')[1]?.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
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
                                  <div className="text-sm text-gray-500">{lead.assignedTo?.fullName || "Unassigned"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{lead.email}</div>
                              <div className="text-sm text-gray-500">{lead.countryCode} {lead.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{lead.course}</div>
                              <div className="text-sm text-gray-500">{lead.country}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                lead.status === "Introduction" ? "bg-green-100 text-green-800" :
                                lead.status === "Acknowledgement" ? "bg-blue-100 text-blue-800" :
                                lead.status === "Question" ? "bg-purple-100 text-purple-800" :
                                lead.status === "Future Promise" ? "bg-red-100 text-red-800" :
                                lead.status === "Payment" ? "bg-green-100 text-green-800" :
                                lead.status === "Analysis" ? "bg-gray-100 text-gray-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(lead.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="text-blue-600 hover:text-blue-900 focus:outline-none"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                {/* Add more actions if needed */}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
