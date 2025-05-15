import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

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
      let countryCode = lead.countryCode || '';
      countryCode = countryCode.replace(/^\+/, '');
      
      const formValues = {
        name: lead.name || '',
        email: lead.email || '',
        course: lead.course || '',
        countryCode: countryCode,
        phone: lead.phone || '',
        country: lead.country || '',
        pseudoId: lead.pseudoId || '',
        company: lead.company || '',
        client: lead.client || '',
        status: lead.status || 'Introduction',
        source: lead.source || '',
        sourceLink: lead.sourceLink || '',
        assignedTo: lead.assignedTo?._id || '',
        leadPerson: lead.leadPerson?._id || '',
        remarks: lead.remarks || '',
        feedback: lead.feedback || '',
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
    
    console.log('========= FORM SUBMISSION =========');
    console.log('Form data being submitted:', formData);
    console.log('assignedTo value:', formData.assignedTo);
    console.log('Custom creation date:', formData.customCreatedAt);
    
    // Validate that assignedTo is set
    if (!formData.assignedTo) {
      console.error('assignedTo is required but not set');
      setError('Please select a sales person to assign this lead to');
      setLoading(false);
      return;
    }
    
    // Validate country code format - ensure it starts with +
    let countryCode = formData.countryCode || '';
    // Remove any plus sign that might already be there, then conditionally add it back
    countryCode = countryCode.replace(/^\+/, '');
    
    try {
      let response;
      // Create the data to submit
      const dataToSubmit = {
        NAME: formData.name,
        'E-MAIL': formData.email,
        COURSE: formData.course,
        CODE: countryCode, // Use the country code without + since server accepts it that way
        NUMBER: formData.phone,
        COUNTRY: formData.country,
        'PSUDO ID': formData.pseudoId || '',
        'CLIENT REMARK': formData.client || '',
        status: formData.status || 'Introduction', // Ensure status has a default
        SOURSE: formData.source || '', // Ensure source has a default
        'SOURCE LINK': formData.sourceLink || '',
        'SALE PERSON': formData.assignedTo,
        'LEAD PERSON': formData.leadPerson || '', // Ensure lead person has a default
        FEEDBACK: formData.feedback || '',
        DATE: formData.customCreatedAt ? new Date(formData.customCreatedAt).toISOString() : new Date().toISOString()
      };
      
      // Double-check all required fields are present and valid
      const requiredFields = ['NAME', 'COURSE', 'CODE', 'NUMBER', 'COUNTRY', 'SALE PERSON'];
      const missingFields = requiredFields.filter(field => 
        !dataToSubmit[field] || dataToSubmit[field].trim() === ''
      );
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
      
      // Validate email only if provided (email is optional)
      if (dataToSubmit['E-MAIL'] && dataToSubmit['E-MAIL'].trim() !== '') {
        // Simple check for @ symbol - don't be too strict on format to allow international emails
        if (!dataToSubmit['E-MAIL'].includes('@')) {
          console.error('Invalid email format:', dataToSubmit['E-MAIL']);
          setError('Please enter a valid email address or leave it blank');
          setLoading(false);
          return;
        }
      }
      
      // Log the final data being sent for debugging
      console.log('Final data being sent:', dataToSubmit);
      console.log('Required fields check:', {
        NAME: !!dataToSubmit.NAME && dataToSubmit.NAME.trim() !== '',
        COURSE: !!dataToSubmit.COURSE && dataToSubmit.COURSE.trim() !== '',
        CODE: !!dataToSubmit.CODE && dataToSubmit.CODE.trim() !== '',
        NUMBER: !!dataToSubmit.NUMBER && dataToSubmit.NUMBER.trim() !== '',
        COUNTRY: !!dataToSubmit.COUNTRY && dataToSubmit.COUNTRY.trim() !== '',
        'SALE PERSON': !!dataToSubmit['SALE PERSON'] && dataToSubmit['SALE PERSON'].trim() !== ''
      });
      
      // Check if we're in development mode (Vite exposes import.meta.env)
      const isDevelopment = import.meta.env.DEV;
      console.log('Environment check:', {
        isDevelopment,
        'import.meta.env.DEV': import.meta.env.DEV
      });
      
      if (lead) {
        // Update existing lead
        console.log('Updating existing lead:', lead._id);
        response = await leadsAPI.update(lead._id, dataToSubmit);
      } else {
        // Create new lead
        console.log('Creating new lead');
        response = await leadsAPI.create(dataToSubmit);
      }
      
      console.log('API response:', response.data);
      
      if (response.data.success) {
        console.log('Lead saved successfully with ID:', response.data.data._id);
        
        if (onSuccess) {
          onSuccess(response.data.data);
        } else {
          navigate('/leads');
        }
      } else {
        setError('Server returned an error: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      
      // More detailed error handling
      if (err.response) {
        console.error('API Error:', {
          status: err.response.status,
          data: err.response.data,
          url: err.response.config?.url,
          method: err.response.config?.method,
          message: err.response.data?.message || err.message,
          config: err.response.config
        });
        
        // If we have detailed error data, log it
        if (err.response.data?.missingFields) {
          console.error('Missing fields reported by server:', err.response.data.missingFields);
        }
        
        // Check for duplicate email error
        const errorMessage = err.response.data?.message || '';
        if (errorMessage.includes('duplicate key') && errorMessage.includes('email')) {
          setError(`This email (${formData.email}) is already in use for another lead. Please use a different email or leave it blank.`);
          return;
        }
        
        // Show more specific error message based on status code
        if (err.response.status === 400) {
          setError('Validation error: ' + (err.response.data?.message || 'Please check all required fields'));
        } else if (err.response.status === 401) {
          setError('Authentication error: Please log in again');
        } else if (err.response.status === 403) {
          setError('Permission error: You do not have permission to perform this action');
        } else {
          setError('Server error: ' + (err.response.data?.message || 'Failed to save lead'));
        }
      } else {
        setError('Network error: Unable to connect to server');
      }
    } finally {
      setLoading(false);
      console.log('===================================');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {lead ? 'Edit Lead' : 'Add New Lead'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DATE*
            </label>
            <input
              type="date"
              name="customCreatedAt"
              value={formData.customCreatedAt}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NAME*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* COUNTRY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COUNTRY*
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* COURSE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COURSE*
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* CODE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CODE*
            </label>
            <input
              type="text"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* NUMBER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NUMBER*
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* E-MAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-MAIL
              <span className="text-xs ml-1 text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@domain.com (optional)"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* PSUDO ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PSUDO ID
            </label>
            <input
              type="text"
              name="pseudoId"
              value={formData.pseudoId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* SALE PERSON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SALE PERSON*
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Sales Person</option>
              {salesPersons.map(person => (
                <option key={person._id} value={person._id}>
                  {person.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* LEAD PERSON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LEAD PERSON
            </label>
            <select
              name="leadPerson"
              value={formData.leadPerson}
              onChange={handleChange}
              disabled={user?.role !== 'Admin' && user?.role !== 'Manager'}
              className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                user?.role !== 'Admin' && user?.role !== 'Manager' ? 'bg-gray-100' : ''
              }`}
            >
              <option value="">Select Lead Person</option>
              {leadPersons.map(person => (
                <option key={person._id} value={person._id}>
                  {person.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* SOURSE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SOURSE
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* SOURCE LINK (LinkedIn URL) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="sourceLink"
              value={formData.sourceLink}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/profile"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* CLIENT REMARK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CLIENT REMARK
            </label>
            <input
              type="text"
              name="client"
              value={formData.client}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* FEEDBACK */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FEEDBACK
            </label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Lead'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm; 