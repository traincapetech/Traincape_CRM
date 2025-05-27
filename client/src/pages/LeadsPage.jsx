// src/pages/LeadsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { leadsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LeadForm from "../components/Leads/LeadForm";
import Layout from "../components/Layout/Layout";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaEdit, FaTrash, FaFilter, FaPlus } from 'react-icons/fa';

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
          leadDate.getMonth() + 1 === parseInt(filterMonth) && 
          leadDate.getFullYear() === parseInt(filterYear)
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
      
      // Log the structure of the first lead to see available fields
      if (response.data && response.data.data && response.data.data.length > 0) {
        const firstLead = response.data.data[0];
        console.log('First lead object structure:', firstLead);
        console.log('All field names:', Object.keys(firstLead));
        console.log('Name value:', firstLead.name);
        console.log('NAME value:', firstLead.NAME);
      }
      
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
    
    // Refresh leads after update to ensure we have the latest data
    fetchLeads();
  };
  
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
                  {filteredLeads.length} leads • {showCurrentMonth ? 'Current Month' : `${months.find(m => m.value === parseInt(filterMonth))?.label} ${filterYear}`}
                </p>
              </div>
              
              {/* Always show Add New Lead button */}
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
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Filter Leads</h3>
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
                      <button
                        onClick={handleResetToCurrentMonth}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Show Current Month
                      </button>
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
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Country
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.map((lead) => {
                          // Log each lead to see its structure
                          console.log(`Lead ${lead._id}:`, lead);
                          return (
                            <tr key={lead._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(lead.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{lead.name || lead.NAME || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.course || lead.COURSE || ''}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{lead.phone || lead.NUMBER || ''}</div>
                                <div className="text-sm text-gray-500">{lead.email || lead['E-MAIL'] || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.country || lead.COUNTRY || ''}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  (lead.feedback || lead.FEEDBACK) === 'Converted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : (lead.feedback || lead.FEEDBACK) === 'Not Interested' 
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {lead.feedback || lead.FEEDBACK || 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEditClick(lead)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                  title="Edit Lead"
                                >
                                  <FaEdit className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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
