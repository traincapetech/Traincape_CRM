import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { leadsAPI, taskAPI } from "../services/api";

// Get API URL for Vite (fixes "process is not defined" error)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Directly get token from localStorage instead of only relying on AuthContext
const getToken = () => localStorage.getItem('token');

const TaskManagementPage = () => {
  const { user } = useAuth();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Debug token information
  useEffect(() => {
    // Get fresh token for each API call
    const freshToken = getToken();
    setToken(freshToken);
    
    if (!freshToken) {
      toast.error("No authentication token found. Please try logging out and back in.");
    }
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskType: "Exam",
    customer: "",
    examDate: "",
    examTime: ""
  });
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Get fresh token for API call
      const freshToken = getToken();
      
      // Check token validity first
      if (!freshToken) {
        toast.error("Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }
      
      // Use taskAPI service instead of direct Axios
      const response = await taskAPI.getAll();
      
      if (response.data && response.data.data) {
        console.log('Tasks loaded:', response.data.data);
        
        // Check if customer data is properly populated
        const tasksWithValidCustomers = response.data.data.map(task => {
          // If customer isn't properly populated, add a placeholder
          if (!task.customer || typeof task.customer === 'string') {
            console.log('Task has unpopulated customer:', task);
            // Try to find matching customer from leads list
            const matchingLead = leads.find(lead => lead._id === task.customer);
            if (matchingLead) {
              task.customer = matchingLead;
            }
          }
          return task;
        });
        
        setTasks(tasksWithValidCustomers);
      } else {
        setTasks([]);
        console.log('No tasks found in response');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response && error.response.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to fetch tasks: " + (error.message || "Unknown error"));
      }
      
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLeads = async () => {
    setLeadsLoading(true);
    
    try {
      // Get fresh token for API call
      const freshToken = getToken();
      
      // Check token validity first
      if (!freshToken) {
        toast.error("Authentication token missing. Please log in again.");
        setLeadsLoading(false);
        return;
      }
      
      // Use the API service to get all customers (both leads and reference sales)
      const response = await leadsAPI.getAllCustomers();
      
      // Extract customers data from response
      let apiCustomers = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        apiCustomers = response.data.data;
      } else if (response.data?.leads && Array.isArray(response.data.leads)) {
        apiCustomers = response.data.leads;
      } else if (Array.isArray(response.data)) {
        apiCustomers = response.data;
      }
      
      if (apiCustomers.length > 0) {
        setLeads(apiCustomers);
        
        // Show success message with breakdown
        const leadCount = apiCustomers.filter(c => !c.isReferenceSale).length;
        const refCount = apiCustomers.filter(c => c.isReferenceSale).length;
        
        if (leadCount === 0 && refCount === 0) {
          toast.info("No customer data available");
        }
      }
    } catch (error) {
      // Detailed error logging
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Authentication failed. Your session may have expired.");
        } else {
          toast.error("Could not fetch customer data: " + (error.response.data?.message || "Server error"));
        }
      } else if (error.request) {
        toast.error("No response from server. Check your connection.");
      } else {
        toast.error("Error: " + error.message);
      }
    } finally {
      setLeadsLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchLeads();
    }
  }, [token]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Combine date and time
      const combinedDateTime = new Date(`${formData.examDate}T${formData.examTime}`);
      
      const taskData = {
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType,
        customer: formData.customer,
        examDate: combinedDateTime
      };
      
      let response;
      if (currentTask) {
        // Update existing task
        response = await taskAPI.update(currentTask._id, taskData);
      } else {
        // Create new task
        response = await taskAPI.create(taskData);
      }
      
      if (response.data.success) {
        toast.success(currentTask ? "Task updated successfully" : "Task created successfully");
        
        // Reset form and close modal
        setFormData({
          title: "",
          description: "",
          taskType: "Exam",
          customer: "",
          examDate: "",
          examTime: ""
        });
        setModalOpen(false);
        setCurrentTask(null);
        
        // Refresh tasks list
        fetchTasks();
      } else {
        toast.error(response.data.message || "Error saving task");
      }
    } catch (error) {
      // Detailed error handling
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Authentication failed. Please log out and log back in.");
        } else {
          toast.error(error.response?.data?.message || "Failed to save task");
        }
      } else {
        toast.error("Network error - could not connect to server");
      }
    }
  };
  
  const handleEditTask = (task) => {
    console.log('Editing task:', task);
    
    const examDate = format(new Date(task.examDate), "yyyy-MM-dd");
    const examTime = format(new Date(task.examDate), "HH:mm");
    
    // Handle different customer data formats
    let customerId = '';
    if (task.customer) {
      if (typeof task.customer === 'string') {
        customerId = task.customer;
      } else if (task.customer._id) {
        customerId = task.customer._id;
      }
    }
    
    setFormData({
      title: task.title,
      description: task.description,
      taskType: task.taskType || 'Exam',
      customer: customerId,
      examDate,
      examTime
    });
    
    setCurrentTask(task);
    setModalOpen(true);
    
    // If customer ID is missing or invalid, show a message
    if (!customerId) {
      toast.warning("Customer data may be incomplete. Please select a customer again.");
    }
  };
  
  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await taskAPI.delete(id);
        
        if (response.data && response.data.success) {
          toast.success("Task deleted successfully");
          // Refresh tasks list
          fetchTasks();
        } else {
          toast.error(response.data?.message || "Failed to delete task");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error("Failed to delete task");
        }
      }
    }
  };
  
  const handleMarkCompleted = async (id, completed) => {
    try {
      const response = await taskAPI.updateStatus(id, completed);
      
      if (response.data && response.data.success) {
        toast.success("Task status updated");
        // Refresh tasks list
        fetchTasks();
      } else {
        toast.error(response.data?.message || "Failed to update task status");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to update task status");
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };
  
  // Helper function to display lead/customer name
  const getLeadName = (lead) => {
    // Handle different data structures for leads
    if (!lead) return 'No Name';
    console.log('Getting name for lead:', lead);
    
    // Check if lead is just an ID (string) rather than an object
    if (typeof lead === 'string') {
      return `Customer (ID: ${lead.substring(0, 6)}...)`;
    }
    
    // If lead is not populated properly
    if (!Object.keys(lead).length) {
      return 'Unknown Customer';
    }
    
    let name = '';
    
    // Try all possible name fields
    const possibleNameFields = ['name', 'NAME', 'customerName', 'fullName'];
    
    for (const field of possibleNameFields) {
      if (lead[field] && typeof lead[field] === 'string' && lead[field].trim() !== '') {
        name = lead[field];
        break;
      }
    }
    
    // If still no name found, look for any field containing 'name'
    if (!name) {
      const nameKeys = Object.keys(lead).filter(key => 
        key.toLowerCase().includes('name') && 
        lead[key] && 
        typeof lead[key] === 'string' &&
        lead[key].trim() !== ''
      );
      
      if (nameKeys.length > 0) {
        name = lead[nameKeys[0]];
      }
    }
    
    // If still no name, use course info or ID as fallback
    if (!name || name === 'Unnamed Customer') {
      if (lead.course || lead.COURSE) {
        name = `Student for ${lead.course || lead.COURSE}`;
      } else if (lead._id) {
        name = `Customer ${lead._id.substring(0, 6)}...`;
      } else {
        name = 'Unnamed Customer';
      }
    }
    
    // Add Reference tag if it's a reference customer
    if (lead.isReferenceSale) {
      return `${name} [Reference]`;
    }
    
    // Add course info if available
    const course = lead.course || lead.COURSE;
    if (course && !name.includes(course)) {
      return `${name} (${course})`;
    }
    
    return name;
  };

  // Helper function to get lead contact info (email or phone)
  const getLeadContact = (lead) => {
    if (!lead) return '';
    let contact = '';
    
    // Try to find email
    if (lead.email) {
      contact = lead.email;
    } else if (lead.EMAIL) {
      contact = lead.EMAIL;
    } else if (lead["E-MAIL"]) {
      contact = lead["E-MAIL"];
    } 
    // If no email, try phone/mobile
    else if (lead.contactNumber) {
      contact = lead.contactNumber;
    } else if (lead.phone) {
      contact = lead.phone;
    } else if (lead.MOBILE) {
      contact = lead.MOBILE;
    } else if (lead.CONTACT) {
      contact = lead.CONTACT;
    } else if (lead.NUMBER) {
      contact = lead.NUMBER;
    }
    
    return contact ? ` (${contact})` : '';
  };
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-4 md:py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Task Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentTask(null);
                  setFormData({
                    title: "",
                    description: "",
                    taskType: "Exam",
                    customer: "",
                    examDate: "",
                    examTime: ""
                  });
                  setModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
              >
                Schedule New Exam
              </button>
            </div>
          </div>
          
          {/* Add a notification for authentication issues */}
          {!getToken() && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Authentication Error</p>
                  <p className="text-sm">No authentication token found. Please log out and log back in to refresh your session.</p>
                  <button 
                    onClick={() => window.location.href = '/login'} 
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Task List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white p-4 sm:p-8 rounded-md shadow text-center">
              <p className="text-gray-600">No tasks scheduled yet.</p>
              <p className="mt-2 text-sm text-gray-500">Click "Schedule New Exam" to create your first task.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                    task.completed
                      ? "border-green-500"
                      : new Date(task.examDate) < new Date()
                      ? "border-red-500"
                      : "border-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base sm:text-lg mb-2">{task.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-700">{getLeadName(task.customer)}</p>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-700">{formatDateTime(task.examDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-3 border-t border-gray-100 gap-2">
                    <span className={`text-xs px-2 py-1 rounded mb-2 sm:mb-0 ${task.completed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                    <button
                      onClick={() => handleMarkCompleted(task._id, !task.completed)}
                      className={`text-xs w-full sm:w-auto px-3 py-1 rounded-full ${
                        task.completed
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {task.completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Modal for creating/editing tasks */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md my-8">
                <div className="p-4 sm:p-5 border-b border-gray-200">
                  <h3 className="font-bold text-base sm:text-lg">
                    {currentTask ? "Edit Task" : "Schedule New Exam"}
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-5">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Exam Title"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Exam details"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-2">
                      Customer
                    </label>
                    <select
                      name="customer"
                      value={formData.customer}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Customer</option>
                      
                      {/* Group: Actual Leads from CRM */}
                      {leads.filter(lead => !lead.isReferenceSale).length > 0 && (
                        <optgroup label="Leads">
                          {leads
                            .filter(lead => !lead.isReferenceSale)
                            .map(lead => (
                              <option key={lead._id} value={lead._id}>
                                {lead.name || lead.NAME || "Unknown"} - {lead.course || lead.COURSE || "No course"} 
                                {lead.status ? ` (${lead.status})` : ""}
                              </option>
                          ))}
                        </optgroup>
                      )}
                      
                      {/* Group: Reference Customers */}
                      {leads.filter(lead => lead.isReferenceSale).length > 0 && (
                        <optgroup label="Reference Customers">
                          {leads
                            .filter(lead => lead.isReferenceSale)
                            .map(lead => (
                              <option key={lead._id} value={lead._id}>
                                {lead.name || "Unknown"} - {lead.course || "No course"} 
                                {lead.status ? ` (${lead.status})` : ""} [Reference]
                              </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {leadsLoading ? (
                      <p className="mt-1 text-xs text-gray-500">Loading customers...</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        {leads.filter(lead => !lead.isReferenceSale).length} leads + 
                        {leads.filter(lead => lead.isReferenceSale).length} reference customers available
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-2">
                        Exam Date
                      </label>
                      <input
                        type="date"
                        name="examDate"
                        value={formData.examDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-2">
                        Exam Time
                      </label>
                      <input
                        type="time"
                        name="examTime"
                        value={formData.examTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 mt-6 space-y-2 sm:space-y-0">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm order-1 sm:order-2"
                    >
                      {currentTask ? "Update Task" : "Create Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TaskManagementPage; 