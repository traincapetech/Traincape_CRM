import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { prospectsAPI, authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiArrowRight,
  FiPhone,
  FiMail,
  FiUser,
  FiEye,
  FiX
} from 'react-icons/fi';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Interested': 'bg-green-100 text-green-800',
    'Not Interested': 'bg-red-100 text-red-800',
    'Follow Up': 'bg-purple-100 text-purple-800',
    'Qualified': 'bg-indigo-100 text-indigo-800',
    'Converted to Lead': 'bg-emerald-100 text-emerald-800',
    'Lost': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Priority badge component
const PriorityBadge = ({ priority }) => {
  const priorityColors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority}
    </span>
  );
};

const ProspectsPage = () => {
  const { user, token } = useAuth();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [stats, setStats] = useState({});
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    priority: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({});

  // Fetch prospects
  const fetchProspects = async () => {
    try {
      setLoading(true);
      const response = await prospectsAPI.getAll(filters);

      if (response.data.success) {
        setProspects(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast.error('Failed to fetch prospects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await prospectsAPI.getStats();

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchProspects();
    fetchStats();
  }, [filters]);

  // Handle search
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prospect?')) return;

    try {
      const response = await prospectsAPI.delete(id);

      if (response.data.success) {
        toast.success('Prospect deleted successfully');
        fetchProspects();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting prospect:', error);
      toast.error(error.response?.data?.message || 'Failed to delete prospect');
    }
  };

  // Handle convert to lead
  const handleConvertToLead = async (id) => {
    if (!window.confirm('Convert this prospect to a lead?')) return;

    try {
      const response = await prospectsAPI.convertToLead(id);

      if (response.data.success) {
        toast.success('Prospect converted to lead successfully');
        fetchProspects();
        fetchStats();
      }
    } catch (error) {
      console.error('Error converting prospect:', error);
      toast.error(error.response?.data?.message || 'Failed to convert prospect');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
            <p className="text-gray-600">Manage your potential customers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus /> Add Prospect
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.overview?.total || 0}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-500">{stats.overview?.new || 0}</div>
            <div className="text-sm text-gray-600">New</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-500">{stats.overview?.contacted || 0}</div>
            <div className="text-sm text-gray-600">Contacted</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-500">{stats.overview?.interested || 0}</div>
            <div className="text-sm text-gray-600">Interested</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-indigo-500">{stats.overview?.qualified || 0}</div>
            <div className="text-sm text-gray-600">Qualified</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-emerald-500">{stats.overview?.converted || 0}</div>
            <div className="text-sm text-gray-600">Converted</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-500">{stats.overview?.lost || 0}</div>
            <div className="text-sm text-gray-600">Lost</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search prospects..."
                value={filters.search}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted to Lead">Converted to Lead</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Source Filter */}
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Social Media">Social Media</option>
              <option value="Event">Event</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prospects Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading prospects...</p>
          </div>
        ) : prospects.length === 0 ? (
          <div className="p-8 text-center">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No prospects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new prospect.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <FiPlus /> Add Prospect
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prospects.map((prospect) => (
                    <tr key={prospect._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {prospect.name || 'No Name'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {prospect.email && (
                              <div className="flex items-center gap-1 truncate">
                                <FiMail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{prospect.email}</span>
                              </div>
                            )}
                            {prospect.phone && (
                              <div className="flex items-center gap-1 truncate">
                                <FiPhone className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{prospect.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-900 truncate">{prospect.company || '-'}</div>
                          <div className="text-xs text-gray-500 truncate">{prospect.designation || '-'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{prospect.source}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={prospect.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={prospect.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {prospect.assignedTo?.fullName || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(prospect.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          
                          {prospect.status !== 'Converted to Lead' && (
                            <button
                              onClick={() => handleConvertToLead(prospect._id)}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                              title="Convert to Lead"
                            >
                              <FiArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          
                          {['Admin', 'Manager'].includes(user?.role) && (
                            <button
                              onClick={() => handleDelete(prospect._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {prospects.map((prospect) => (
                <div key={prospect._id} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {prospect.name || 'No Name'}
                      </h3>
                      <p className="text-xs text-gray-500">{prospect.company || 'No Company'}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedProspect(prospect);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedProspect(prospect);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="mt-1">
                        <StatusBadge status={prospect.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <div className="mt-1">
                        <PriorityBadge priority={prospect.priority} />
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Source:</span>
                      <div className="mt-1 text-gray-900">{prospect.source}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Assigned:</span>
                      <div className="mt-1 text-gray-900 truncate">
                        {prospect.assignedTo?.fullName || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                  
                  {(prospect.email || prospect.phone) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {prospect.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <FiMail className="w-3 h-3" />
                          <span className="truncate">{prospect.email}</span>
                        </div>
                      )}
                      {prospect.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FiPhone className="w-3 h-3" />
                          <span>{prospect.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', Math.min(pagination.pages, filters.page + 1))}
                    disabled={filters.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handleFilterChange('page', page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === filters.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <ProspectModal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedProspect(null);
          }}
          prospect={selectedProspect}
          onSuccess={() => {
            fetchProspects();
            fetchStats();
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedProspect(null);
          }}
        />
      )}

      {/* View Details Modal */}
      {showViewModal && selectedProspect && (
        <ViewProspectModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProspect(null);
          }}
          prospect={selectedProspect}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onConvert={() => {
            setShowViewModal(false);
            handleConvertToLead(selectedProspect._id);
          }}
          onDelete={() => {
            setShowViewModal(false);
            handleDelete(selectedProspect._id);
          }}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

// Prospect Modal Component
const ProspectModal = ({ isOpen, onClose, prospect, onSuccess }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    source: 'Other',
    sourceDetails: '',
    industry: '',
    companySize: 'Unknown',
    budget: '',
    budgetCurrency: 'USD',
    serviceInterest: '',
    requirements: '',
    timeline: 'Not specified',
    status: 'New',
    priority: 'Medium',
    assignedTo: '',
    lastContactDate: '',
    nextFollowUpDate: '',
    contactMethod: '',
    notes: '',
    tags: '',
    linkedinProfile: '',
    websiteUrl: ''
  });

  useEffect(() => {
    if (prospect) {
      setFormData({
        name: prospect.name || '',
        email: prospect.email || '',
        phone: prospect.phone || '',
        company: prospect.company || '',
        designation: prospect.designation || '',
        source: prospect.source || 'Other',
        sourceDetails: prospect.sourceDetails || '',
        industry: prospect.industry || '',
        companySize: prospect.companySize || 'Unknown',
        budget: prospect.budget || '',
        budgetCurrency: prospect.budgetCurrency || 'USD',
        serviceInterest: prospect.serviceInterest || '',
        requirements: prospect.requirements || '',
        timeline: prospect.timeline || 'Not specified',
        status: prospect.status || 'New',
        priority: prospect.priority || 'Medium',
        assignedTo: prospect.assignedTo?._id || '',
        lastContactDate: prospect.lastContactDate ? prospect.lastContactDate.split('T')[0] : '',
        nextFollowUpDate: prospect.nextFollowUpDate ? prospect.nextFollowUpDate.split('T')[0] : '',
        contactMethod: prospect.contactMethod || '',
        notes: prospect.notes || '',
        tags: prospect.tags?.join(', ') || '',
        linkedinProfile: prospect.linkedinProfile || '',
        websiteUrl: prospect.websiteUrl || ''
      });
    }
  }, [prospect]);

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAPI.getUsers();
        if (response.data.success) {
          setUsers(response.data.data.filter(u => 
            ['Sales Person', 'Manager', 'Admin'].includes(u.role)
          ));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        lastContactDate: formData.lastContactDate || undefined,
        nextFollowUpDate: formData.nextFollowUpDate || undefined
      };

      // Remove empty strings
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key];
        }
      });

      const response = prospect 
        ? await prospectsAPI.update(prospect._id, submitData)
        : await prospectsAPI.create(submitData);

      if (response.data.success) {
        toast.success(prospect ? 'Prospect updated successfully' : 'Prospect created successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving prospect:', error);
      toast.error(error.response?.data?.message || 'Failed to save prospect');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {prospect ? 'Edit Prospect' : 'Add New Prospect'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Technology, Healthcare, etc."
                  />
                </div>
              </div>
            </div>

            {/* Source & Business Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Source & Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Details
                  </label>
                  <input
                    type="text"
                    name="sourceDetails"
                    value={formData.sourceDetails}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional source information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <div className="flex">
                    <select
                      name="budgetCurrency"
                      value={formData.budgetCurrency}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Interest & Requirements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Interest & Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Interest
                  </label>
                  <input
                    type="text"
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What services are they interested in?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed requirements and needs"
                  />
                </div>
              </div>
            </div>

            {/* Status & Assignment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.fullName} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Follow-up Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Follow-up Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Contact Date
                  </label>
                  <input
                    type="date"
                    name="lastContactDate"
                    value={formData.lastContactDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="nextFollowUpDate"
                    value={formData.nextFollowUpDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select method</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes and observations"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {prospect ? 'Update Prospect' : 'Create Prospect'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// View Prospect Modal Component
const ViewProspectModal = ({ isOpen, onClose, prospect, onEdit, onConvert, onDelete, userRole }) => {
  // Local badge components for this modal
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Interested': 'bg-green-100 text-green-800',
      'Not Interested': 'bg-red-100 text-red-800',
      'Follow Up': 'bg-purple-100 text-purple-800',
      'Qualified': 'bg-indigo-100 text-indigo-800',
      'Converted to Lead': 'bg-emerald-100 text-emerald-800',
      'Lost': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const priorityColors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              View Prospect Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Prospect Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Prospect Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="text-sm text-gray-900">{prospect.name || 'No Name'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="text-sm text-gray-900">{prospect.email || 'No Email'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="text-sm text-gray-900">{prospect.phone || 'No Phone'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <div className="text-sm text-gray-900">{prospect.company || 'No Company'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <div className="text-sm text-gray-900">{prospect.designation || 'No Designation'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <div className="text-sm text-gray-900">{prospect.industry || 'No Industry'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <div className="text-sm text-gray-900">{prospect.source || 'No Source'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="text-sm text-gray-900">
                    <StatusBadge status={prospect.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <div className="text-sm text-gray-900">
                    <PriorityBadge priority={prospect.priority} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <div className="text-sm text-gray-900">{prospect.assignedTo?.fullName || 'Unassigned'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <div className="text-sm text-gray-900">{new Date(prospect.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Details
                  </label>
                  <div className="text-sm text-gray-900">{prospect.sourceDetails || 'No source details'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <div className="text-sm text-gray-900">{prospect.companySize || 'Unknown'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <div className="text-sm text-gray-900">{prospect.budget ? `${prospect.budget} ${prospect.budgetCurrency}` : 'No budget'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Interest
                  </label>
                  <div className="text-sm text-gray-900">{prospect.serviceInterest || 'No service interest'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline
                  </label>
                  <div className="text-sm text-gray-900">{prospect.timeline || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <div className="text-sm text-gray-900">{prospect.requirements || 'No requirements'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Contact Date
                  </label>
                  <div className="text-sm text-gray-900">{prospect.lastContactDate ? new Date(prospect.lastContactDate).toLocaleDateString() : 'No last contact date'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Follow-up Date
                  </label>
                  <div className="text-sm text-gray-900">{prospect.nextFollowUpDate ? new Date(prospect.nextFollowUpDate).toLocaleDateString() : 'No next follow-up date'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Method
                  </label>
                  <div className="text-sm text-gray-900">{prospect.contactMethod || 'No contact method'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <div className="text-sm text-gray-900">{prospect.linkedinProfile || 'No LinkedIn profile'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <div className="text-sm text-gray-900">{prospect.websiteUrl || 'No website URL'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="text-sm text-gray-900">{prospect.tags?.join(', ') || 'No tags'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <div className="text-sm text-gray-900">{prospect.notes || 'No notes'}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              
              {prospect.status !== 'Converted to Lead' && (
                <button
                  onClick={onConvert}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Convert to Lead
                </button>
              )}
              
              {['Admin', 'Manager'].includes(userRole) && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectsPage; 