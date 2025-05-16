import React, { useState, useEffect } from "react";
import { salesAPI, leadsAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout/Layout";
import { FaWhatsapp, FaEnvelope, FaPhone, FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from "../services/api"; // Import the api instance to access baseURL

const SalesTrackingPage = () => {
  // Custom styles for PhoneInput
  const phoneInputStyle = {
    container: {
      width: '100%',
    },
    inputStyle: {
      width: '100%',
      height: '42px',
      padding: '8px 8px 8px 50px',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      borderColor: '#D1D5DB',
    },
    buttonStyle: {
      borderTopLeftRadius: '0.375rem',
      borderBottomLeftRadius: '0.375rem',
      borderColor: '#D1D5DB',
    },
    dropdownStyle: {
      width: '300px',
    }
  };
  
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSale, setNewSale] = useState({
    leadId: "",
    amount: 0,
    token: 0,
    pending: 0,
    product: "",
    status: "Pending",
    isReference: false,
    customerName: "",
    email: "",
    contactNumber: "",
    country: "",
    leadPerson: "",
    countryCode: "+1",
    loginId: "",
    password: "",
    leadBy: "",
    saleDate: new Date()
  });
  const [availableLeads, setAvailableLeads] = useState([]);
  const [leadOptions, setLeadOptions] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadPersonOptions, setLeadPersonOptions] = useState([]);
  const [loadingLeadPersons, setLoadingLeadPersons] = useState(false);
  
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

  // Sale status options - must match the enum values in the server's Sale model
  const statusOptions = [
    "Pending", 
    "Completed", 
    "Cancelled"
  ];

  // Add new state for delete confirmation
  const [deletingSale, setDeletingSale] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch sales data
  useEffect(() => {
    fetchSales();
  }, [user]);
  
  // Apply date filters when sales, month, or year changes
  useEffect(() => {
    if (sales.length > 0) {
      filterSalesByDate();
    }
  }, [sales, filterMonth, filterYear, showCurrentMonth]);
  
  // Fetch lead persons when in reference sale mode
  useEffect(() => {
    if (newSale.isReference && leadPersonOptions.length === 0) {
      fetchLeadPersons();
    }
  }, [newSale.isReference]);
  
  // Function to filter sales by selected date
  const filterSalesByDate = () => {
    if (showCurrentMonth) {
      // Show current month data
      const thisMonth = new Date().getMonth() + 1; // 1-12
      const thisYear = new Date().getFullYear();
      
      const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getMonth() + 1 === thisMonth && 
          saleDate.getFullYear() === thisYear
        );
      });
      
      setFilteredSales(filtered);
    } else {
      // Show selected month/year data
      const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getMonth() + 1 === filterMonth && 
          saleDate.getFullYear() === filterYear
        );
      });
      
      setFilteredSales(filtered);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching sales...");
      
      // Use the API service instead of direct Axios call
      const response = await salesAPI.getAll();
      
      console.log("Sales API response status:", response.status);
      console.log("Sales API response success:", response.data?.success);
      console.log("Sales count:", response.data?.count || 0);
      
      if (response.data && response.data.success) {
        // Initialize sales with additional fields we want to track
        const processedSales = response.data.data.map(sale => {
          // Create a properly formatted sale object with consistent fields
          const formattedSale = {
            ...sale,
            _id: sale._id,
            // Convert ObjectId to string if needed 
            salesPerson: typeof sale.salesPerson === 'object' ? 
                         (sale.salesPerson._id || sale.salesPerson) : 
                         sale.salesPerson,
            // Ensure all financial fields exist
            amount: parseFloat(sale.totalCost || 0),
            token: parseFloat(sale.tokenAmount || 0),
            pending: sale.status === 'Completed' ? 0 : parseFloat(sale.totalCost || 0) - parseFloat(sale.tokenAmount || 0),
            // Ensure we have product info
            product: sale.course || sale.product || 'Unknown',
            // Ensure we have a status
            status: sale.status || 'Pending',
            // Ensure login credentials are preserved
            loginId: sale.loginId || '',
            password: sale.password || '',
            leadBy: sale.leadBy || ''
          };
          
          return formattedSale;
        });
        
        console.log("Processed sales:", processedSales.slice(0, 2)); // Show first 2 for debugging
        
        setSales(processedSales);
      } else {
        console.error("Failed to load sales data:", response.data?.message || "Unknown error");
        setError("Failed to load sales data: " + (response.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
      if (err.response) {
        console.error("Error details:", err.response.data);
        console.error("Error status:", err.response.status);
      }
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available leads for selection in add sale form
  const fetchAvailableLeads = async () => {
    try {
      setLoadingLeads(true);
      let leadsData = [];
      
      // If sales person, fetch assigned leads
      if (user.role === 'Sales Person') {
        const response = await leadsAPI.getAssigned();
        if (response.data.success) {
          leadsData = response.data.data.filter(lead => lead.status !== 'Converted');
        }
      } else {
        // For admin and manager, fetch all leads
        const response = await leadsAPI.getAll();
        if (response.data.success) {
          leadsData = response.data.data.filter(lead => lead.status !== 'Converted');
        }
      }
      
      setAvailableLeads(leadsData);
      
      // Create options for select dropdown
      const options = leadsData.map(lead => ({
        value: lead._id,
        label: `${lead.name} - ${lead.course} (${lead.status})`,
        data: lead
      }));
      
      setLeadOptions(options);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoadingLeads(false);
    }
  };

  // Fetch available lead persons (admins, managers) 
  const fetchLeadPersons = async () => {
    try {
      setLoadingLeadPersons(true);
      const response = await authAPI.getUsers('Lead Person');
      if (response.data.success) {
        const options = response.data.data.map(user => ({
          value: user._id,
          label: user.fullName || user.email,
        }));
        setLeadPersonOptions(options);
      }
    } catch (err) {
      console.error("Error fetching lead persons:", err);
    } finally {
      setLoadingLeadPersons(false);
    }
  };

  // Handle opening add sale modal
  const handleAddSaleClick = () => {
    fetchAvailableLeads();
    setShowAddModal(true);
    // Reset new sale form
    setNewSale({
      leadId: "",
      amount: 0,
      token: 0,
      pending: 0,
      product: "",
      status: "Pending",
      isReference: false,
      customerName: "",
      email: "",
      contactNumber: "",
      country: "",
      leadPerson: "",
      countryCode: "+1",
      loginId: "",
      password: "",
      leadBy: "",
      saleDate: new Date()
    });
  };

  // Handle lead selection in add form
  const handleLeadSelect = (e) => {
    const selectedLeadId = e.target.value;
    const selectedLead = availableLeads.find(lead => lead._id === selectedLeadId);
    
    if (selectedLead) {
      console.log('Selected lead:', selectedLead);
      
      setNewSale(prev => ({
        ...prev,
        leadId: selectedLeadId,
        // Get course/product from lead
        product: selectedLead.course || selectedLead.COURSE || '',
        // Store other lead data we'll need for the API
        _selectedLead: selectedLead
      }));
    }
  };

  // Handle new sale form input changes
  const handleNewSaleChange = (field, value) => {
    setNewSale(prev => {
      const updates = { ...prev, [field]: value };
      
      // Automatically calculate pending when amount or token changes
      if (field === 'amount' || field === 'token') {
        const amount = field === 'amount' ? parseFloat(value) || 0 : parseFloat(prev.amount) || 0;
        const token = field === 'token' ? parseFloat(value) || 0 : parseFloat(prev.token) || 0;
        updates.pending = amount - token;
      }
      
      return updates;
    });
  };

  // Handle toggle for reference sale
  const handleReferenceToggle = (isReference) => {
    setNewSale(prev => ({
      ...prev,
      isReference,
      leadId: isReference ? "" : prev.leadId // Clear lead selection if toggling to reference
    }));
    
    // Fetch lead persons when toggling to reference
    if (isReference && leadPersonOptions.length === 0) {
      fetchLeadPersons();
    }
  };

  // Submit new sale - simplified without currency conversion complexity
  const handleSubmitNewSale = async (e) => {
    e.preventDefault();
    
    try {
      // Different validation based on whether it's a reference sale
      if (!newSale.isReference) {
        // Non-reference sale validation
        if (!newSale.leadId) {
          setError("Please select a lead");
          return;
        }
        
        if (!newSale.product) {
          setError("Please enter a product/course name");
          return;
        }
      } else {
        // Reference sale validation
        if (!newSale.customerName) {
          setError("Please enter customer name");
          return;
        }
        
        if (!newSale.contactNumber) {
          setError("Please enter contact number");
          return;
        }
        
        if (!newSale.product) {
          setError("Please enter a product/course name");
          return;
        }
        
        if (!newSale.country) {
          setError("Please enter country");
          return;
        }
      }
      
      // Get fresh token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }
      
      let saleData;
      
      if (!newSale.isReference) {
        // Process normal sale from lead
        const selectedLead = newSale._selectedLead || availableLeads.find(lead => lead._id === newSale.leadId);
        
        if (!selectedLead) {
          setError("Lead information not found. Please select a lead again.");
          return;
        }
        
        console.log('Using lead data for sale:', selectedLead);
        
        // Extract lead details for the sale using the required schema fields
        saleData = {
          // Customer details from lead
          customerName: selectedLead.name || selectedLead.NAME || selectedLead.customerName || 'Unknown',
          country: selectedLead.country || selectedLead.COUNTRY || 'Unknown',
          course: newSale.product, // Use the product field as course
          countryCode: selectedLead.countryCode || selectedLead.CODE || '+1',
          contactNumber: selectedLead.phone || selectedLead.contactNumber || selectedLead.NUMBER || selectedLead.MOBILE || '0000000000',
          email: selectedLead.email || selectedLead['E-MAIL'] || selectedLead.EMAIL || '',
          
          // ID references
          salesPerson: user._id, // Current user is the sales person
          // Extract leadPerson from lead data if available
          leadPerson: extractId(selectedLead, 'leadPerson') || 
                     extractId(selectedLead, 'createdBy') || 
                     user._id, // Fallback to current user
          
          // Optional fields - new
          loginId: newSale.loginId || '',
          password: newSale.password || '',
          leadBy: newSale.leadBy || '',
          
          // Source info
          source: selectedLead.source || selectedLead.SOURSE || '',
          clientRemark: selectedLead.client || selectedLead['CLIENT REMARK'] || '',
          
          // Financial info - simplified without currency conversion
          totalCost: parseFloat(newSale.amount) || 0,
          tokenAmount: parseFloat(newSale.token) || 0,
          
          // Status info
          pending: newSale.status === 'Completed' ? false : parseFloat(newSale.pending) > 0, // Set to false if status is completed
          status: newSale.status || 'Pending',
          
          // Creation metadata
          createdBy: user._id,
          date: newSale.saleDate || new Date() // Use selected date or current date
        };
      } else {
        // Process reference sale with manually entered data
        saleData = {
          // Customer details from form
          customerName: newSale.customerName,
          country: newSale.country,
          course: newSale.product,
          countryCode: newSale.countryCode || '+1',
          contactNumber: newSale.contactNumber,
          email: newSale.email || '',
          
          // ID references
          salesPerson: user._id, // Current user is the sales person
          leadPerson: newSale.leadPerson || user._id, // Use selected lead person or current user
          
          // Optional fields - new
          loginId: newSale.loginId || '',
          password: newSale.password || '',
          leadBy: newSale.leadBy || '',
          
          // Source info
          source: 'Reference', // Mark as reference
          isReference: true,
          
          // Financial info
          totalCost: parseFloat(newSale.amount) || 0,
          tokenAmount: parseFloat(newSale.token) || 0,
          
          // Status info
          pending: newSale.status === 'Completed' ? false : parseFloat(newSale.pending) > 0, // Set to false if status is completed
          status: newSale.status || 'Pending',
          
          // Creation metadata
          createdBy: user._id,
          date: newSale.saleDate || new Date() // Use selected date or current date
        };
      }
      
      console.log("Submitting new sale with matching schema:", saleData);
      
      // Use the API service
      const response = await (newSale.isReference ? 
        salesAPI.createReferenceSale(saleData) : 
        salesAPI.create({ ...saleData, isLeadPersonSale: false }));
      
      if (response.data && response.data.success) {
        console.log("Sale created successfully:", response.data.data);
        
        // Add new sale to the list
        setSales(prev => [response.data.data, ...prev]);
        
        // Close modal and reset form
        setShowAddModal(false);
        setNewSale({
          leadId: "",
          amount: 0,
          token: 0,
          pending: 0,
          product: "",
          status: "Pending",
          isReference: false,
          customerName: "",
          email: "",
          contactNumber: "",
          country: "",
          leadPerson: "",
          countryCode: "+1",
          loginId: "",
          password: "",
          leadBy: "",
          saleDate: new Date()
        });
        
        // Show success message
        toast.success("Sale added successfully!");
        
        // Refresh data to ensure we have the latest
        refreshData();
      } else {
        setError(response.data?.message || "Failed to add sale");
      }
    } catch (err) {
      console.error("Error adding sale:", err);
      
      // Detailed error handling
      if (err.response) {
        console.error("Sale creation error details:", err.response.data);
        
        if (err.response.status === 400) {
          // Better handling for validation errors
          const errorMsg = err.response.data?.message || "Invalid data";
          if (errorMsg.includes('enum value for path `status`')) {
            toast.error(`Invalid status value. Allowed values are: ${statusOptions.join(', ')}`);
          } else {
            toast.error(`Bad request: ${errorMsg}`);
          }
        } else if (err.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(`Failed to add sale: ${err.response.data?.message || err.message}`);
        }
      } else {
        setError("Network error while adding sale");
      }
    }
  };

  // Improved helper function to safely extract IDs from possibly nested or string IDs
  const extractId = (obj, field) => {
    if (!obj) return null;
    
    // For debugging
    console.log(`Extracting ID for field ${field}:`, obj[field]);
    
    // If field is direct property and is a string already, return it
    if (typeof obj[field] === 'string') return obj[field];
    
    // If field is an object with _id, return that
    if (obj[field] && obj[field]._id) {
      // MongoDB ObjectId is stored as an object that can be converted to string
      if (typeof obj[field]._id === 'object' && obj[field]._id.toString) {
        return obj[field]._id.toString();
      }
      return obj[field]._id;
    }
    
    // If field itself is an object with an ID property, return that
    if (obj[field] && typeof obj[field].id === 'string') return obj[field].id;
    
    // If the field is an ObjectId that can be converted to string
    if (obj[field] && typeof obj[field] === 'object' && obj[field].toString) {
      return obj[field].toString();
    }
    
    // Return null if nothing found
    return null;
  };

  // Handle edit mode for a sale
  const handleEdit = (sale) => {
    // Check if sale object exists
    if (!sale) {
      console.error("Attempted to edit undefined sale");
      return;
    }
    
    // Always ensure all form values are defined with proper defaults
    setEditingSale(sale._id);
    
    // Create safe defaults for all fields
    const amount = parseFloat(sale.amount || sale.totalCost || 0);
    const token = parseFloat(sale.token || sale.tokenAmount || 0);
    const pending = parseFloat(sale.pending || (amount - token) || 0);
    
    setEditValues({
      amount: amount,
      token: token,
      pending: pending,
      status: sale.status || 'Pending',
      product: sale.product || sale.course || '',
      saleDate: sale.date || new Date(),
      loginId: sale.loginId || '',
      password: sale.password || '',
      leadBy: sale.leadBy || ''
    });
    
    console.log("Edit values initialized:", {
      amount,
      token,
      pending,
      status: sale.status || 'Pending',
      saleDate: sale.date || new Date()
    });
  };

  // Handle saving edits - simplified without currency fields
  const handleSave = async (saleId) => {
    try {
      // Find the original sale for data we don't want to change
      const originalSale = sales.find(sale => sale._id === saleId);
      if (!originalSale) {
        setError("Sale not found");
        return;
      }

      // Get fresh token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }
      
      // Special handling for Sales Person role
      if (user.role === 'Sales Person') {
        const salesPersonId = extractId(originalSale, 'salesPerson');
        const userId = user._id;
        const isOwnSale = salesPersonId && userId && salesPersonId.toString() === userId.toString();
        
        // If it's their own sale, they can edit everything
        if (isOwnSale) {
          console.log('Sales Person updating their own sale');
          
          // Extract IDs properly handling both object and string formats
          const salesPersonId = extractId(originalSale, 'salesPerson') || user._id;
          const leadPersonId = extractId(originalSale, 'leadPerson');
          
          // Create update data matching the schema
          const updateData = {
            // Keep original customer info
            customerName: originalSale.customerName,
            country: originalSale.country,
            course: originalSale.course || editValues.product || 'Unknown Course',
            countryCode: originalSale.countryCode,
            contactNumber: originalSale.contactNumber,
            email: originalSale.email,
            
            // Date field - allow selection of past dates
            date: editValues.saleDate || originalSale.date || new Date(),
            
            // IDs
            salesPerson: salesPersonId,
            leadPerson: leadPersonId,
            
            // Lead by field
            leadBy: editValues.leadBy || originalSale.leadBy || '',
            
            // Login credentials
            loginId: editValues.loginId || originalSale.loginId || '',
            password: editValues.password || originalSale.password || '',
            
            // Source info - keep original
            source: originalSale.source,
            clientRemark: originalSale.clientRemark,
            
            // Updated financial info
            totalCost: parseFloat(editValues.amount) || 0,
            tokenAmount: parseFloat(editValues.token) || 0,
            
            // Status info
            pending: editValues.status === 'Completed' ? false : parseFloat(editValues.pending) > 0, // Set to false if status is completed
            status: editValues.status || originalSale.status || 'Pending',
            
            // Flag to indicate if it's a reference sale or not
            isReference: originalSale.isReference || false,
            
            // Update metadata
            updatedBy: user._id,
            updatedAt: new Date()
          };
          
          console.log('Updating sale with full data:', updateData);
          
          // Use the API service
          const response = await salesAPI.update(saleId, updateData);
          
          if (response.data && response.data.success) {
            setSales(sales.map(sale => 
              sale._id === saleId ? response.data.data : sale
            ));
            toast.success("Sale updated successfully");
            setEditingSale(null);
            
            // Refresh data to ensure we have the latest
            refreshData();
          } else {
            setError("Failed to update sale: " + (response.data?.message || "Server error"));
          }
          return;
        } else {
          setError("You don't have permission to update this sale");
          return;
        }
      }
      
      // Regular flow for non-Sales Person roles
      
      // Extract IDs properly handling both object and string formats
      const salesPersonId = extractId(originalSale, 'salesPerson') || user._id;
      const leadPersonId = extractId(originalSale, 'leadPerson');
      
      if (!leadPersonId) {
        setError("Lead person ID is missing, cannot update sale");
        return;
      }
      
      // Create update data matching the schema
      const updateData = {
        // Keep original customer info
        customerName: originalSale.customerName,
        country: originalSale.country,
        course: originalSale.course || editValues.product || 'Unknown Course',
        countryCode: originalSale.countryCode,
        contactNumber: originalSale.contactNumber,
        email: originalSale.email,
        
        // Date field - allow selection of past dates
        date: editValues.saleDate || originalSale.date || new Date(),
        
        // IDs
        salesPerson: salesPersonId,
        leadPerson: leadPersonId,
        
        // Lead by field
        leadBy: editValues.leadBy || originalSale.leadBy || '',
        
        // Login credentials
        loginId: editValues.loginId || originalSale.loginId || '',
        password: editValues.password || originalSale.password || '',
        
        // Source info - keep original
        source: originalSale.source,
        clientRemark: originalSale.clientRemark,
        
        // Updated financial info
        totalCost: parseFloat(editValues.amount) || 0,
        tokenAmount: parseFloat(editValues.token) || 0,
        
        // Status info
        pending: editValues.status === 'Completed' ? false : parseFloat(editValues.pending) > 0, // Set to false if status is completed
        status: editValues.status || originalSale.status || 'Pending',
        
        // Flag to indicate if it's a reference sale or not
        isReference: originalSale.isReference || false,
        
        // Update metadata
        updatedBy: user._id,
        updatedAt: new Date()
      };
      
      console.log('Updating sale with schema data:', updateData);
      
      // Use the API service
      const response = await salesAPI.update(saleId, updateData);
      
      console.log('Update response:', response);
      
      if (response.data && response.data.success) {
        setSales(sales.map(sale => 
          sale._id === saleId ? response.data.data : sale
        ));
        toast.success("Sale updated successfully");
        setEditingSale(null);
        
        // Refresh data to ensure we have the latest
        refreshData();
      } else {
        setError("Failed to update sale: " + (response.data?.message || "Server error"));
      }
    } catch (err) {
      console.error("Error updating sale:", err);
      
      // Detailed error handling
      if (err.response) {
        console.error("Error details:", err.response.data);
        
        if (err.response.status === 403) {
          if (user.role === 'Sales Person' && err.response.data?.message?.includes('can only update the status field')) {
            setError("As a Sales Person, you can only update the status field");
          } else {
            setError("You don't have permission to update this sale. Only the creator or an admin can update it.");
          }
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response.status === 400) {
          // Better handling for validation errors
          const errorMsg = err.response.data?.message || "Invalid data";
          if (errorMsg.includes('enum value for path `status`')) {
            toast.error(`Invalid status value. Allowed values are: ${statusOptions.join(', ')}`);
          } else {
            toast.error(`Bad request: ${errorMsg}`);
          }
        } else {
          setError(`Failed to update sale: ${err.response.data?.message || err.message}`);
        }
      } else {
        setError("Network error while updating sale");
      }
    }
  };

  // Fixed handleInputChange to properly handle numeric values
  const handleInputChange = (field, value) => {
    setEditValues(prev => {
      // Create a copy with defaults for any missing values
      const current = { 
        amount: prev.amount ?? 0,
        token: prev.token ?? 0,
        pending: prev.pending ?? 0,
        status: prev.status || 'Pending',
        saleDate: prev.saleDate || new Date(),
        loginId: prev.loginId || '',
        password: prev.password || '',
        leadBy: prev.leadBy || '',
        ...prev 
      };
      
      let parsedValue = value;
      
      // Convert to number for numeric fields
      if (['amount', 'token', 'pending'].includes(field)) {
        // Handle empty string case
        parsedValue = value === '' ? 0 : parseFloat(value);
        // If NaN, use 0
        if (isNaN(parsedValue)) parsedValue = 0;
      }
      
      const updates = { ...current, [field]: parsedValue };
      
      // Automatically calculate pending amount when amount or token changes
      if (field === 'amount' || field === 'token') {
        const amount = field === 'amount' ? parsedValue : parseFloat(current.amount) || 0;
        const token = field === 'token' ? parsedValue : parseFloat(current.token) || 0;
        updates.pending = amount - token;
      }
      
      // If status is changed to "Completed", set pending to 0
      if (field === 'status' && parsedValue === 'Completed') {
        updates.pending = 0;
      }
      
      return updates;
    });
  };

  // Fixed function to determine if user can edit a sale
  const canEditSale = (sale) => {
    if (!sale || !user) return false;
    
    // Get sales person ID handling both object and string formats
    const salesPersonId = extractId(sale, 'salesPerson');
    const userId = user._id;
    
    console.log("Checking edit permission:", {
      salesPersonId,
      userId,
      role: user.role,
      userIdType: typeof userId,
      salesPersonIdType: typeof salesPersonId,
      compareResult: salesPersonId && userId && salesPersonId.toString() === userId.toString()
    });
    
    // Sales person can edit their own sales
    if (user.role === 'Sales Person') {
      const isOwnSale = salesPersonId && userId && salesPersonId.toString() === userId.toString();
      return isOwnSale;
    }
    
    // Lead person can edit sales they are the lead for
    if (user.role === 'Lead Person') {
      const leadPersonId = extractId(sale, 'leadPerson');
      return leadPersonId && userId && leadPersonId.toString() === userId.toString();
    }
    
    // Admins and managers can edit any sale
    return ['Admin', 'Manager'].includes(user.role);
  };
  
  // Fixed function to determine if user can delete a sale
  const canDeleteSale = (sale) => {
    if (!sale || !user) return false;
    
    // Get sales person ID handling both object and string formats
    const salesPersonId = extractId(sale, 'salesPerson');
    const userId = user._id;
    
    console.log("Checking delete permission:", {
      salesPersonId,
      userId,
      role: user.role,
      userIdType: typeof userId,
      salesPersonIdType: typeof salesPersonId,
      compareResult: salesPersonId && userId && salesPersonId.toString() === userId.toString()
    });
    
    // Sales person can delete their own sales
    if (user.role === 'Sales Person') {
      const isOwnSale = salesPersonId && userId && salesPersonId.toString() === userId.toString();
      return isOwnSale;
    }
    
    // Admins and managers can delete any sale
    return ['Admin', 'Manager'].includes(user.role);
  };

  // Handle delete sale - improved to fix 403 errors
  const handleDeleteSale = async (saleId) => {
    try {
      setDeletingSale(saleId);
      
      // Find the original sale to include necessary data
      const saleToDelete = sales.find(sale => sale._id === saleId);
      if (!saleToDelete) {
        toast.error("Sale not found");
        return;
      }
      
      // Debug the sale object we're trying to delete
      console.log('Sale being deleted:', saleToDelete);
      
      // Use the API service instead of direct Axios call
      const response = await salesAPI.delete(saleId);
      
      console.log('Delete response:', response);
      
      if (response.data && response.data.success) {
        // Remove the deleted sale from state
        setSales(prevSales => prevSales.filter(sale => sale._id !== saleId));
        toast.success("Sale deleted successfully!");
        
        // Refresh sales data to ensure we have the latest
        fetchSales();
      } else {
        toast.error(response.data?.message || "Failed to delete sale");
      }
    } catch (err) {
      console.error("Error deleting sale:", err);
      
      // Detailed error handling
      if (err.response) {
        console.error("Delete error details:", err.response.data);
        
        if (err.response.status === 403) {
          toast.error("You don't have permission to delete this sale. Only the creator or an admin can delete it.");
        } else if (err.response.status === 401) {
          toast.error("Your session has expired. Please log in again.");
        } else {
          toast.error(err.response.data?.message || "Server error while deleting sale");
        }
      } else {
        toast.error("Network error while deleting sale");
      }
    } finally {
      setDeletingSale(null);
      setConfirmDelete(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    const today = new Date();
    setFilterMonth(today.getMonth() + 1);
    setFilterYear(today.getFullYear());
    setShowCurrentMonth(true);
  };

  // Improve the status change handler to match schema
  const handleStatusChange = async (saleId, newStatus) => {
    try {
      // Only proceed if user can edit this sale
      const targetSale = sales.find(sale => sale._id === saleId);
      if (!targetSale) return;
      
      // For debugging
      console.log("Trying to update status:", {
        saleId,
        newStatus,
        userRole: user.role,
        userId: user._id,
        canEdit: canEditSale(targetSale)
      });
      
      if (!canEditSale(targetSale)) {
        toast.error("You don't have permission to update this sale");
        return;
      }
      
      setEditingSale(saleId);
      
      // Create update object with status and all existing fields
      const updatedSale = {
        status: newStatus,
        // Keep original login credentials
        loginId: targetSale.loginId || '',
        password: targetSale.password || '',
        leadBy: targetSale.leadBy || '',
        // Set pending to false (zero) if status is Completed
        pending: newStatus === 'Completed' ? false : targetSale.pending
      };
      
      console.log('Updating status to:', newStatus);
      
      // Update using the API service instead of direct Axios call
      const response = await salesAPI.update(saleId, updatedSale);
      
      if (response.data && response.data.success) {
        // Update sales state
        setSales(prevSales => prevSales.map(sale => 
          sale._id === saleId ? {
            ...sale, 
            status: newStatus,
            // Also update pending status in local state
            pending: newStatus === 'Completed' ? false : sale.pending
          } : sale
        ));
        
        // Also update filtered sales
        setFilteredSales(prevSales => prevSales.map(sale => 
          sale._id === saleId ? {
            ...sale, 
            status: newStatus,
            // Also update pending status in local state
            pending: newStatus === 'Completed' ? false : sale.pending
          } : sale
        ));
        
        toast.success("Sale status updated successfully!");
      } else {
        toast.error(response.data?.message || "Failed to update sale status");
      }
    } catch (err) {
      console.error("Error updating sale status:", err);
      
      if (err.response) {
        console.error("Error details:", err.response.data);
        
        if (err.response.status === 403) {
          if (user.role === 'Sales Person' && err.response.data?.message?.includes('can only update the status field')) {
            setError("As a Sales Person, you can only update the status field");
          } else {
            setError("You don't have permission to update this sale. Only the creator or an admin can update it.");
          }
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response.status === 400) {
          // Better handling for validation errors
          const errorMsg = err.response.data?.message || "Invalid data";
          if (errorMsg.includes('enum value for path `status`')) {
            toast.error(`Invalid status value. Allowed values are: ${statusOptions.join(', ')}`);
          } else {
            toast.error(`Bad request: ${errorMsg}`);
          }
        } else {
          toast.error("Failed to update sale status. Please try again.");
        }
      } else {
        toast.error("Network error while updating sale status");
      }
    } finally {
      setEditingSale(null);
    }
  };
  
  // Open WhatsApp with the phone number
  const openWhatsApp = (phone, countryCode) => {
    if (!phone) return;
    
    try {
      // Remove non-digit characters
      const cleanPhone = phone.toString().replace(/\D/g, '');
      
      // Format the phone number for WhatsApp without the + symbol
      // Make sure the country code doesn't have a + in the beginning
      const dialCode = countryCode ? countryCode.toString().replace(/^\+/, '') : '1';
      
      // Build the WhatsApp URL - format is: https://wa.me/[countrycode][number]
      // WhatsApp API doesn't use the + symbol
      const whatsappUrl = `https://wa.me/${dialCode}${cleanPhone}`;
      
      console.log('Opening WhatsApp URL:', whatsappUrl);
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast.error('Could not open WhatsApp. Please check the phone number format.');
    }
  };

  // Open email client with the email address
  const openEmail = (email) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  // Add function to refresh data after operations
  const refreshData = async () => {
    try {
      // Clear the state first to ensure update
      setSales([]);
      setFilteredSales([]);
      
      // Set loading state
      setLoading(true);
      
      // Use the API service
      const response = await salesAPI.getAll();
      
      if (response.data && response.data.success) {
        // Initialize sales with additional fields we want to track
        const processedSales = response.data.data.map(sale => {
          // Create a properly formatted sale object with consistent fields
          const formattedSale = {
            ...sale,
            _id: sale._id,
            // Convert ObjectId to string if needed 
            salesPerson: typeof sale.salesPerson === 'object' ? 
                         (sale.salesPerson._id || sale.salesPerson) : 
                         sale.salesPerson,
            // Ensure all financial fields exist
            amount: parseFloat(sale.totalCost || 0),
            token: parseFloat(sale.tokenAmount || 0),
            pending: sale.status === 'Completed' ? 0 : parseFloat(sale.totalCost || 0) - parseFloat(sale.tokenAmount || 0),
            // Ensure we have product info
            product: sale.course || sale.product || 'Unknown',
            // Ensure we have a status
            status: sale.status || 'Pending',
            // Ensure login credentials are preserved
            loginId: sale.loginId || '',
            password: sale.password || '',
            leadBy: sale.leadBy || ''
          };
          
          return formattedSale;
        });
        
        // Update the sales state
        setSales(processedSales);
        
        // Apply the current date filters
        const selectedMonth = filterMonth;
        const selectedYear = filterYear;
        
        if (showCurrentMonth) {
          // Filter for current month
          const now = new Date();
          const filtered = processedSales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return (
              saleDate.getMonth() + 1 === now.getMonth() + 1 && 
              saleDate.getFullYear() === now.getFullYear()
            );
          });
          setFilteredSales(filtered);
        } else {
          // Filter for selected month/year
          const filtered = processedSales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return (
              saleDate.getMonth() + 1 === selectedMonth && 
              saleDate.getFullYear() === selectedYear
            );
          });
          setFilteredSales(filtered);
        }
        
        toast.success("Data refreshed successfully");
      } else {
        console.error("Failed to refresh sales data:", response.data?.message || "Unknown error");
        toast.error("Failed to refresh sales data. Please try again.");
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast.error("Failed to refresh data. Please reload the page.");
    } finally {
      setLoading(false);
      
      // For new sales, refresh leads too
      if (showAddModal) {
        fetchAvailableLeads();
      }
    }
  };

  // Debug effect for editValues
  useEffect(() => {
    if (editingSale) {
      console.log("Current editValues:", editValues);
    }
  }, [editValues, editingSale]);
  
  // Set up a useEffect to log the current permissions state for each sale
  useEffect(() => {
    if (sales.length > 0 && user) {
      console.log("Current user permissions summary:", {
        userId: user._id,
        role: user.role,
        canEditCount: sales.filter(sale => canEditSale(sale)).length,
        canDeleteCount: sales.filter(sale => canDeleteSale(sale)).length,
        totalSales: sales.length
      });
    }
  }, [sales, user]);

  // Safely get a value from a possibly undefined property
  const safeGet = (obj, path, defaultValue = 'N/A') => {
    if (!obj) return defaultValue;
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result === null || result === undefined ? defaultValue : result;
  };

  // Add a formatter for customer name that handles different field formats
  const formatCustomerName = (sale) => {
    if (!sale) return 'N/A';
    
    // Try different possible locations for customer name
    return sale.customerName || 
           safeGet(sale, 'leadId.name') || 
           safeGet(sale, 'leadId.NAME') || 
           'Unknown Customer';
  };

  // Render a small tooltip with permission info, shown on hover
  const PermissionTooltip = ({ role }) => {
    let message = '';
    
    if (role === 'Sales Person') {
      message = 'As a Sales Person, you can only update the status of your own sales.';
    } else if (role === 'Lead Person') {
      message = 'As a Lead Person, you can only edit your own leads.';
    }
    
    return message ? (
      <div className="relative inline-block ml-1 text-gray-400">
        <span className="cursor-help text-sm">
          <i className="fas fa-info-circle"></i>
          <span className="tooltip absolute invisible group-hover:visible bg-gray-800 text-white p-2 rounded text-xs w-48 -mt-16 -ml-24 z-10">
            {message}
          </span>
        </span>
      </div>
    ) : null;
  };

  // Replace the 'You don't have permission' message with a more helpful one
  const getPermissionMessage = (sale, userRole) => {
    if (!sale) return "Invalid sale data";
    
    if (userRole === 'Sales Person') {
      const salesPersonId = extractId(sale, 'salesPerson');
      const userId = user?._id;
      
      if (salesPersonId && userId && salesPersonId.toString() === userId.toString()) {
        return "As a Sales Person, you can edit and delete your own sales";
      } else {
        return "You can only edit and delete sales you created as a Sales Person";
      }
    }
    
    // Default message
    return "You don't have permission to update this sale. Only the creator or an admin can update it.";
  };

  // Render a sale row
  const renderSaleRow = (sale) => (
    <tr key={sale._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        {editingSale === sale._id ? (
          <input
            type="date"
            value={editValues.saleDate ? new Date(editValues.saleDate).toISOString().split('T')[0] : new Date(sale.date || sale.createdAt).toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('saleDate', new Date(e.target.value))}
            className="w-full px-2 border border-gray-300 rounded"
          />
        ) : (
          <div className="text-sm text-gray-900">{formatDate(sale.date || sale.createdAt || new Date())}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatCustomerName(sale)}
        </div>
        <div className="text-xs text-gray-500">
          {sale.product || safeGet(sale, 'leadId.course') || 'No product'}
        </div>
        {editingSale === sale._id && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Lead By (Optional)"
              value={editValues.leadBy || ''}
              onChange={(e) => handleInputChange('leadBy', e.target.value)}
              className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
            />
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Name of person who led this sale</span>
            </div>
          </div>
        )}
        {editingSale !== sale._id && sale.leadBy && (
          <div className="text-xs text-gray-600 mt-1">
            Lead By: {sale.leadBy}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-1">
          {/* Show contact number - check both direct properties and leadId */}
          {(sale.contactNumber || safeGet(sale, 'leadId.phone')) && (
            <div className="flex items-center">
              <button 
                onClick={() => openWhatsApp(
                  sale.contactNumber || safeGet(sale, 'leadId.phone'), 
                  sale.countryCode || safeGet(sale, 'leadId.countryCode', '+91')
                )}
                className="text-sm text-gray-900 flex items-center hover:text-green-600"
                title="Open in WhatsApp"
              >
                <FaWhatsapp className="mr-1 text-green-500" /> 
                {sale.countryCode || safeGet(sale, 'leadId.countryCode', '+91')} {sale.contactNumber || safeGet(sale, 'leadId.phone')}
              </button>
            </div>
          )}
          {/* Show email - check both direct properties and leadId */}
          {(sale.email || safeGet(sale, 'leadId.email')) && (
            <div className="flex items-center">
              <button 
                onClick={() => openEmail(sale.email || safeGet(sale, 'leadId.email'))}
                className="text-sm text-gray-500 flex items-center hover:text-blue-600"
                title="Send email"
              >
                <FaEnvelope className="mr-1 text-blue-500" /> 
                {sale.email || safeGet(sale, 'leadId.email')}
              </button>
            </div>
          )}
          {/* Login Credentials */}
          {editingSale === sale._id && (
            <div className="mt-2 flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Login ID (Optional)"
                value={editValues.loginId || ''}
                onChange={(e) => handleInputChange('loginId', e.target.value)}
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Password (Optional)"
                value={editValues.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
              />
            </div>
          )}
          {editingSale !== sale._id && (sale.loginId || sale.password) && (
            <div className="mt-2 text-xs">
              {sale.loginId && <div>Login ID: {sale.loginId}</div>}
              {sale.password && <div>Password: {sale.password}</div>}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{sale.product || safeGet(sale, 'course') || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingSale === sale._id ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              id="amount"
              type="number"
              value={editValues.amount !== undefined ? editValues.amount.toString() : "0"}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-24 px-2 pl-7 border border-gray-300 rounded"
            />
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(sale.amount || sale.totalCost || 0)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingSale === sale._id ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              id="token"
              type="number"
              value={editValues.token !== undefined ? editValues.token.toString() : "0"}
              onChange={(e) => handleInputChange('token', e.target.value)}
              className="w-24 px-2 pl-7 border border-gray-300 rounded"
            />
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(sale.token || sale.tokenAmount || 0)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingSale === sale._id ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              id="pending"
              type="number"
              value={editValues.pending !== undefined ? editValues.pending.toString() : "0"}
              onChange={(e) => handleInputChange('pending', e.target.value)}
              className="w-24 px-2 pl-7 border border-gray-300 rounded"
              disabled={editValues.status === 'Completed'}
            />
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(
              sale.status === 'Completed' ? 0 : 
              sale.pending !== undefined ? sale.pending : 
              (sale.amount || sale.totalCost || 0) - (sale.token || sale.tokenAmount || 0)
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingSale === sale._id ? (
          <select
            value={editValues.status || sale.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className={`text-sm px-2 py-1 rounded cursor-pointer ${
              sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
              sale.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            disabled={!canEditSale(sale)}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <select
              value={sale.status || 'Pending'}
              onChange={(e) => handleStatusChange(sale._id, e.target.value)}
              className={`text-sm px-2 py-1 rounded cursor-pointer appearance-none w-auto pr-8 ${
                sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
                sale.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              disabled={!canEditSale(sale)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
            {!canEditSale(sale) && (
              <div className="absolute left-0 -bottom-5 w-full">
                <div className="text-xs text-gray-500 italic">
                  {user?.role === 'Sales Person' ? "Can only update your own sales" : "No edit permission"}
                </div>
              </div>
            )}
            {editingSale === sale._id && (
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
            {!canEditSale(sale) && editingSale === sale._id && (
              <div className="text-red-500 text-xs mt-1">
                {getPermissionMessage(sale, user?.role)}
              </div>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {editingSale === sale._id ? (
          <div className="flex space-x-2 justify-end">
            <button
              onClick={() => handleSave(sale._id)}
              className="text-green-600 hover:text-green-900 flex items-center"
            >
              <FaCheck className="mr-1" /> Save
            </button>
            <button
              onClick={() => setEditingSale(null)}
              className="text-red-600 hover:text-red-900 flex items-center"
            >
              <FaTimes className="mr-1" /> Cancel
            </button>
          </div>
        ) : (
          <div className="flex space-x-2 justify-end">
            {canEditSale(sale) ? (
              <button
                onClick={() => handleEdit(sale)}
                className="text-blue-600 hover:text-blue-900 flex items-center"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
            ) : (
              <div className="flex items-center text-gray-400 text-xs">
                <span className="italic">Not Editable</span>
                <PermissionTooltip role={user?.role} />
              </div>
            )}
            
            {canDeleteSale(sale) ? (
              deletingSale === sale._id && confirmDelete ? (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Confirm?</span>
                  <button
                    onClick={() => handleDeleteSale(sale._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      setDeletingSale(null);
                      setConfirmDelete(false);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDeletingSale(sale._id);
                    setConfirmDelete(true);
                  }}
                  className="text-red-600 hover:text-red-900 flex items-center"
                  disabled={deletingSale === sale._id}
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              )
            ) : (
              <div className="flex items-center text-gray-400 text-xs">
                <span className="italic">Not Deletable</span>
                <PermissionTooltip role={user?.role} />
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );

  // Format currency for display (simplified to remove conversion)
  const formatCurrency = (value) => {
    // Return plain number with 2 decimal places
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Sales Tracking</h2>
          <button
            onClick={handleAddSaleClick}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300"
          >
            Add New Sale
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading indicator */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading sales data...</p>
          </div>
        ) : (
          <>
            {/* Date Filter Controls */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Filter Sales by Date</h3>
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
                    onChange={() => setShowCurrentMonth(!showCurrentMonth)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="currentMonth" className="ml-2 block text-sm text-gray-700">
                    Show Current Month Only
                  </label>
                </div>
                
                <button
                  onClick={handleResetToCurrentMonth}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md ml-auto transition duration-300"
                >
                  Reset to Current Month
                </button>
              </div>
              
              <div className="mt-3 text-sm text-gray-500">
                {showCurrentMonth ? (
                  <p>Showing sales for current month: {months[new Date().getMonth()].label} {new Date().getFullYear()}</p>
                ) : (
                  <p>Showing sales for: {months[filterMonth - 1].label} {filterYear}</p>
                )}
                <p>Total: {filteredSales.length} sales</p>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact/Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.length > 0 ? (
                    filteredSales.map(sale => renderSaleRow(sale))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                        No sales found for the selected period. Try another date range or add a new sale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Debug Panel - only shown for Admin users */}
            {user && user.role === 'Admin' && (
              <div className="mt-8 p-4 bg-gray-800 text-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Debug Panel
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-gray-400">User ID:</span> {user._id}
                  </div>
                  <div>
                    <span className="text-gray-400">User Role:</span> {user.role}
                  </div>
                  <div>
                    <span className="text-gray-400">Auth Token:</span> {localStorage.getItem('token') ? 'Present' : 'Missing'}
                  </div>
                  <div>
                    <span className="text-gray-400">Token Length:</span> {localStorage.getItem('token')?.length || 0} characters
                  </div>
                  <div>
                    <span className="text-gray-400">API URL:</span> {api.defaults.baseURL || 'Not set (using default)'}
                  </div>
                  <div>
                    <span className="text-gray-400">Total Sales:</span> {sales.length}
                  </div>
                  <div>
                    <span className="text-gray-400">Filtered Sales:</span> {filteredSales.length}
                  </div>
                  <div>
                    <details>
                      <summary className="cursor-pointer text-blue-400 hover:text-blue-300">Show First Sale Data</summary>
                      <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto max-h-40">
                        {sales.length > 0 ? JSON.stringify(sales[0], null, 2) : 'No sales data'}
                      </pre>
                    </details>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={refreshData}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Add Sale Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">Add New Sale</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmitNewSale} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reference Sale Toggle */}
                  <div className="col-span-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Sale Type:</span>
                      <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium ${!newSale.isReference ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                          onClick={() => handleReferenceToggle(false)}
                        >
                          From Lead
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium ${newSale.isReference ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                          onClick={() => handleReferenceToggle(true)}
                        >
                          From Reference
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* FROM LEAD UI */}
                  {!newSale.isReference && (
                    <>
                      {/* Lead Selection */}
                      <div className="col-span-2">
                        <label htmlFor="leadId" className="block text-sm font-medium text-gray-700">Lead</label>
                        <select
                          id="leadId"
                          value={newSale.leadId}
                          onChange={handleLeadSelect}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a lead</option>
                          {availableLeads.map(lead => (
                            <option key={lead._id} value={lead._id}>{lead.name} - {lead.course}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Sale Date */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700">Sale Date</label>
                        <input
                          id="saleDate"
                          type="date"
                          value={newSale.saleDate ? new Date(newSale.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          onChange={(e) => handleNewSaleChange('saleDate', new Date(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Lead By (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="leadBy" className="block text-sm font-medium text-gray-700">
                          Lead By (Optional)
                          <span className="ml-1 inline-block relative group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block">
                              Name of the person who led this sale (can be different from the Lead Person assigned in the system)
                            </span>
                          </span>
                        </label>
                        <input
                          id="leadBy"
                          type="text"
                          value={newSale.leadBy}
                          onChange={(e) => handleNewSaleChange('leadBy', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Who led this sale?"
                        />
                      </div>
                      
                      {/* Product (pulled from lead but can be modified) */}
                      <div className="col-span-2">
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
                        <input
                          id="product"
                          type="text"
                          value={newSale.product}
                          onChange={(e) => handleNewSaleChange('product', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Product or course name"
                        />
                      </div>
                      
                      {/* Login Credentials (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">Login ID (Optional)</label>
                        <input
                          id="loginId"
                          type="text"
                          value={newSale.loginId}
                          onChange={(e) => handleNewSaleChange('loginId', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Customer login ID"
                        />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password (Optional)</label>
                        <input
                          id="password"
                          type="text"
                          value={newSale.password}
                          onChange={(e) => handleNewSaleChange('password', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Customer password"
                        />
                      </div>
                      
                      {/* Amount */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            id="amount"
                            type="number"
                            value={newSale.amount}
                            onChange={(e) => handleNewSaleChange('amount', e.target.value)}
                            className="block w-full pl-7 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      {/* Token */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700">Token</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            id="token"
                            type="number"
                            value={newSale.token}
                            onChange={(e) => handleNewSaleChange('token', e.target.value)}
                            className="block w-full pl-7 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      {/* Pending (calculated automatically) */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="pending" className="block text-sm font-medium text-gray-700">Pending</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            id="pending"
                            type="number"
                            value={newSale.pending}
                            onChange={(e) => handleNewSaleChange('pending', e.target.value)}
                            className="block w-full pl-7 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            disabled={newSale.status === 'Completed'}
                          />
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          id="status"
                          value={newSale.status}
                          onChange={(e) => handleNewSaleChange('status', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  
                  {/* REFERENCE SALE UI */}
                  {newSale.isReference && (
                    <>
                      {/* Customer Name */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                        <input
                          id="customerName"
                          type="text"
                          value={newSale.customerName}
                          onChange={(e) => handleNewSaleChange('customerName', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter customer name"
                        />
                      </div>

                      {/* Sale Date */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700">Sale Date</label>
                        <input
                          id="saleDate"
                          type="date"
                          value={newSale.saleDate ? new Date(newSale.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          onChange={(e) => handleNewSaleChange('saleDate', new Date(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Contact Number */}
                      <div className="col-span-2">
                        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <PhoneInput
                          country={'us'}
                          value={newSale.contactNumber}
                          onChange={(value, data) => {
                            // Update both the contact number and country code
                            handleNewSaleChange('contactNumber', value);
                            handleNewSaleChange('countryCode', `+${data.dialCode}`);
                          }}
                          inputProps={{
                            id: 'contactNumber',
                            name: 'contactNumber',
                            required: true,
                          }}
                          containerStyle={phoneInputStyle.container}
                          inputStyle={phoneInputStyle.inputStyle}
                          buttonStyle={phoneInputStyle.buttonStyle}
                          dropdownStyle={phoneInputStyle.dropdownStyle}
                          enableSearch={true}
                          searchPlaceholder="Search country..."
                        />
                      </div>
                      
                      {/* Email */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          id="email"
                          type="email"
                          value={newSale.email}
                          onChange={(e) => handleNewSaleChange('email', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="customer@example.com"
                        />
                      </div>
                      
                      {/* Country */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          id="country"
                          type="text"
                          value={newSale.country}
                          onChange={(e) => handleNewSaleChange('country', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter country"
                        />
                      </div>
                      
                      {/* Lead By (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="leadBy" className="block text-sm font-medium text-gray-700">
                          Lead By (Optional)
                          <span className="ml-1 inline-block relative group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block">
                              Name of the person who led this sale (can be different from the Lead Person assigned in the system)
                            </span>
                          </span>
                        </label>
                        <input
                          id="leadBy"
                          type="text"
                          value={newSale.leadBy}
                          onChange={(e) => handleNewSaleChange('leadBy', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Who led this sale?"
                        />
                      </div>
                      
                      {/* Product */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
                        <input
                          id="product"
                          type="text"
                          value={newSale.product}
                          onChange={(e) => handleNewSaleChange('product', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Product or course name"
                        />
                      </div>
                      
                      {/* Login Credentials (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">Login ID (Optional)</label>
                        <input
                          id="loginId"
                          type="text"
                          value={newSale.loginId}
                          onChange={(e) => handleNewSaleChange('loginId', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Customer login ID"
                        />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password (Optional)</label>
                        <input
                          id="password"
                          type="text"
                          value={newSale.password}
                          onChange={(e) => handleNewSaleChange('password', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Customer password"
                        />
                      </div>
                      
                      {/* Lead Person Selection */}
                      <div className="col-span-2">
                        <label htmlFor="leadPerson" className="block text-sm font-medium text-gray-700">Lead Person</label>
                        <select
                          id="leadPerson"
                          value={newSale.leadPerson}
                          onChange={(e) => handleNewSaleChange('leadPerson', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a lead person</option>
                          {leadPersonOptions.map(person => (
                            <option key={person.value} value={person.value}>{person.label}</option>
                          ))}
                        </select>
                        {loadingLeadPersons && (
                          <div className="mt-1 text-sm text-gray-500">Loading lead persons...</div>
                        )}
                      </div>
                      
                      {/* Amount */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            id="amount"
                            type="number"
                            value={newSale.amount}
                            onChange={(e) => handleNewSaleChange('amount', e.target.value)}
                            className="block w-full pl-7 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      {/* Token */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700">Token</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            id="token"
                            type="number"
                            value={newSale.token}
                            onChange={(e) => handleNewSaleChange('token', e.target.value)}
                            className="block w-full pl-7 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      {/* Pending (calculated automatically) */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="pending" className="block text-sm font-medium text-gray-700">Pending</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            id="pending"
                            type="number"
                            value={newSale.pending}
                            onChange={(e) => handleNewSaleChange('pending', e.target.value)}
                            className="block w-full pl-7 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            disabled={newSale.status === 'Completed'}
                          />
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          id="status"
                          value={newSale.status}
                          onChange={(e) => handleNewSaleChange('status', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Add Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SalesTrackingPage;