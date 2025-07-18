import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import LoggingService from '../../services/loggingService'; // Add LoggingService import

const LeadForm = ({ lead = null, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesPersons, setSalesPersons] = useState([]);
  const [leadPersons, setLeadPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    countryCode: '',
    phone: '',
    country: '',
    pseudoId: '',
    company: '',
    client: '',
    status: 'Introduction',
    source: '',
    sourceLink: '',
    assignedTo: '',
    leadPerson: '',
    remarks: '',
    feedback: '',
    customCreatedAt: new Date().toISOString().split('T')[0] // Add default date as today
  });

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users for dropdowns');
        
        // Fetch sales persons
        const salesRes = await authAPI.getUsers('Sales Person');
        console.log('Sales persons fetched:', salesRes.data.data);
        setSalesPersons(salesRes.data.data || []);
        
        // Fetch lead persons
        const leadRes = await authAPI.getUsers('Lead Person');
        console.log('Lead persons fetched:', leadRes.data.data);
        setLeadPersons(leadRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    
    fetchUsers();
  }, []);

  // If editing, populate form with lead data
  useEffect(() => {
    console.log('========= FORM DATA INITIALIZATION =========');
    console.log('Current user:', user);
    console.log('User ID formats:', {
      _id: user?._id,
      id: user?.id
    });
    console.log('Lead data:', lead);
    
    if (lead) {
      // Editing an existing lead
      console.log('Editing existing lead, populating form with lead data');
      
      // Format the created date to YYYY-MM-DD format for date input
      const createdDate = lead.createdAt 
        ? new Date(lead.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      // Ensure country code doesn't have a plus sign to match server expectations
      let countryCode = lead.countryCode || lead.CODE || '';
      countryCode = countryCode.replace(/^\+/, '');
      
      const formValues = {
        name: lead.name || lead.NAME || '',
        email: lead.email || lead['E-MAIL'] || '',
        course: lead.course || lead.COURSE || '',
        countryCode: countryCode,
        phone: lead.phone || lead.NUMBER || '',
        country: lead.country || lead.COUNTRY || '',
        pseudoId: lead.pseudoId || lead['PSUDO ID'] || '',
        company: lead.company || lead.COMPANY || '',
        client: lead.client || lead['CLIENT REMARK'] || '',
        status: lead.status || 'Introduction',
        source: lead.source || lead.SOURSE || '',
        sourceLink: lead.sourceLink || lead['SOURCE LINK'] || '',
        assignedTo: lead.assignedTo?._id || lead['SALE PERSON']?._id || lead['SALE PERSON'] || '',
        leadPerson: lead.leadPerson?._id || lead['LEAD PERSON']?._id || lead['LEAD PERSON'] || '',
        remarks: lead.remarks || '',
        feedback: lead.feedback || lead.FEEDBACK || '',
        customCreatedAt: createdDate
      };
      
      setFormData(formValues);
      console.log('Populated form data:', formValues);
    } else {
      // Creating a new lead
      console.log('Creating new lead, setting default values');
      
      // For consistent ID handling, use both _id and id fields from user object
      const userId = (user?._id || user?.id || '').toString();
      console.log('Using user ID for defaults:', userId);
      
      // Set defaults for new leads including the current date
      const today = new Date().toISOString().split('T')[0];
      
      const formValues = {
        name: '',
        email: '',
        course: '',
        countryCode: '1',  // Default country code without + sign to match server expectations
        phone: '',
        country: '',
        pseudoId: '',
        company: '',
        client: '',
        status: 'Introduction',
        source: '',
        sourceLink: '',
        assignedTo: userId,
        leadPerson: user?.role === 'Lead Person' ? userId : '',
        remarks: '',
        feedback: '',
        customCreatedAt: today
      };
      
      setFormData(formValues);
      console.log('Default form data:', formValues);
    }
    console.log('==========================================');
  }, [lead, user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, value: ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('============= LEAD FORM SUBMIT =============');
    console.log('Form submission started');
    console.log('Is updating existing lead:', !!lead);
    console.log('Lead ID:', lead?._id);
    console.log('Form data:', formData);

    try {
      let response;
      
      // Prepare data for submission with proper field mapping
      const dataToSubmit = {
        NAME: formData.name,
        'E-MAIL': formData.email || '',
        COURSE: formData.course,
        CODE: formData.countryCode,
        NUMBER: formData.phone,
        COUNTRY: formData.country,
        'PSUDO ID': formData.pseudoId || '',
        'CLIENT REMARK': formData.client || '',
        status: formData.status || 'Introduction',
        SOURSE: formData.source || '',
        'SOURCE LINK': formData.sourceLink || '',
        'SALE PERSON': formData.assignedTo,
        leadPerson: formData.leadPerson || '',
        'LEAD PERSON': formData.leadPerson || '',
        feedback: formData.feedback || '',
        FEEDBACK: formData.feedback || '',
        ...(lead ? {
          // For existing leads, preserve the original createdAt date
          // Don't send DATE or createdAt fields to avoid changing the lead's month/year
        } : {
          // For new leads, use the custom date or current date
          DATE: formData.customCreatedAt ? new Date(formData.customCreatedAt).toISOString() : new Date().toISOString(),
          createdAt: formData.customCreatedAt ? new Date(formData.customCreatedAt).toISOString() : new Date().toISOString()
        })
      };
      
      // Double-check all required fields are present and valid
      const requiredFields = ['name', 'course', 'phone', 'country', 'assignedTo'];
      const missingFields = requiredFields.filter(field => 
        !formData[field] || formData[field].trim() === ''
      );
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
      
      // Validate email only if provided and not empty (email is optional)
      if (formData.email && formData.email.trim() !== '') {
        // Simple check for @ symbol - don't be too strict on format to allow international emails
        if (!formData.email.includes('@')) {
          console.error('Invalid email format:', formData.email);
          setError('Please enter a valid email address or leave it blank');
          setLoading(false);
          return;
        }
      } else {
        // Ensure empty email is properly handled by setting to empty string
        dataToSubmit.email = '';
        dataToSubmit['E-MAIL'] = '';
        console.log('Email field is blank, setting to empty string');
      }
      
      // Log the final data being sent for debugging
      console.log('Final data being sent to API:', dataToSubmit);
      
      if (lead) {
        // Update existing lead
        console.log('Calling API to update existing lead:', lead._id);
        response = await leadsAPI.update(lead._id, dataToSubmit);
        console.log('Update API response received:', response);
        
        // Log the lead update
        try {
          await LoggingService.logLeadUpdate(lead._id, dataToSubmit);
        } catch (logError) {
          console.error('Error logging lead update:', logError);
        }
      } else {
        // Create new lead
        console.log('Calling API to create new lead');
        response = await leadsAPI.create(dataToSubmit);
        console.log('Create API response received:', response);
        
        // Log the lead creation
        try {
          await LoggingService.logLeadCreate(response.data.data);
        } catch (logError) {
          console.error('Error logging lead creation:', logError);
        }
      }
      
      console.log('Full API response data:', response.data);
      console.log('API response success:', response.data?.success);
      console.log('API response lead data:', response.data?.data);
      
      if (response.data && response.data.success) {
        console.log('Lead saved successfully, calling onSuccess callback');
        console.log('Lead data being passed to onSuccess:', response.data.data);
        onSuccess(response.data.data);
        console.log('onSuccess callback completed');
      } else {
        console.error('API returned success: false', response);
        setError('Failed to save lead. Please check your input and try again.');
      }
    } catch (err) {
      console.error('Error saving lead:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to save lead. Please try again later.');
    } finally {
      setLoading(false);
      console.log('============= LEAD FORM SUBMIT END =============');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm dark:shadow-black/25">
              <div className="flex-shrink-0">
                <input
                  type="text"
                  name="countryCode"
                  id="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  placeholder="Code"
                  className="block w-16 border border-gray-300 dark:border-slate-600 rounded-md rounded-r-none shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                />
              </div>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="flex-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md rounded-l-none shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              id="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Course Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Course Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Course <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="course"
              id="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Source
            </label>
            <input
              type="text"
              name="source"
              id="source"
              value={formData.source}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="sourceLink" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Source Link
            </label>
            <input
              type="text"
              name="sourceLink"
              id="sourceLink"
              value={formData.sourceLink}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="pseudoId" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Pseudo ID
            </label>
            <input
              type="text"
              name="pseudoId"
              id="pseudoId"
              value={formData.pseudoId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Assignment & Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignment & Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Assigned Sales Person <span className="text-red-500">*</span>
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            >
              <option value="">Select Sales Person</option>
              {salesPersons.map(person => (
                <option key={person._id} value={person._id}>
                  {person.fullName || person.email}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="leadPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Lead Person
            </label>
            <select
              id="leadPerson"
              name="leadPerson"
              value={formData.leadPerson}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            >
              <option value="">Select Lead Person</option>
              {leadPersons.map(person => (
                <option key={person._id} value={person._id}>
                  {person.fullName || person.email}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            >
              <option value="Introduction">Introduction</option>
              <option value="Acknowledgement">Acknowledgement</option>
              <option value="Question">Question</option>
              <option value="Future Promise">Future Promise</option>
              <option value="Payment">Payment</option>
              <option value="Analysis">Analysis</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Feedback
            </label>
            <select
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            >
              <option value="">Select Feedback</option>
              <option value="Pending">Pending</option>
              <option value="Converted">Converted</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Follow Up">Follow Up</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Client Remarks
            </label>
            <textarea
              id="client"
              name="client"
              rows="3"
              value={formData.client}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="customCreatedAt" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Date Added
            </label>
            <input
              type="date"
              name="customCreatedAt"
              id="customCreatedAt"
              value={formData.customCreatedAt}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-black/25 py-2 px-3 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-5 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm dark:shadow-black/25 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          {loading ? 'Saving...' : lead ? 'Update Lead' : 'Add Lead'}
        </button>
      </div>
    </form>
  );
};

export default LeadForm; 