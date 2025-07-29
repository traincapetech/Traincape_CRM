import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { stripeInvoiceAPI } from '../services/stripeInvoiceAPI';
import { invoiceAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const StripeInvoicePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stripeInvoices, setStripeInvoices] = useState([]);
  const [crmInvoices, setCrmInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    customerEmail: '',
    page: 1
  });

  // Form state for creating Stripe invoice
  const [formData, setFormData] = useState({
    crmInvoiceId: '',
    customerData: {
      email: '',
      name: '',
      company: ''
    },
    items: [],
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stripeData, crmData, statsData] = await Promise.all([
        stripeInvoiceAPI.getAll(filters),
        invoiceAPI.getAll(),
        stripeInvoiceAPI.getStats()
      ]);

      setStripeInvoices(stripeData.invoices || []);
      setCrmInvoices(crmData.invoices || []);
      setStats(statsData);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStripeInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await stripeInvoiceAPI.create(formData);
      toast.success('Stripe invoice created and sent successfully!');
      setShowCreateForm(false);
      setFormData({
        crmInvoiceId: '',
        customerData: { email: '', name: '', company: '' },
        items: [],
        dueDate: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating Stripe invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (id) => {
    try {
      await stripeInvoiceAPI.sendReminder(id);
      toast.success('Invoice reminder sent successfully!');
    } catch (error) {
      toast.error('Error sending reminder');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      uncollectible: 'bg-red-100 text-red-800',
      void: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Invoice Management</h1>
          <p className="text-gray-600">Create and manage Stripe invoices with payment processing</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Invoices</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalInvoices || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Amount</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount || 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Paid Invoices</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.stats?.find(s => s._id === 'paid')?.count || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-3xl font-bold text-orange-600">
              {stats.stats?.find(s => s._id === 'open')?.count || 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="paid">Paid</option>
              <option value="uncollectible">Uncollectible</option>
              <option value="void">Void</option>
            </select>
            <input
              type="text"
              placeholder="Search by email..."
              value={filters.customerEmail}
              onChange={(e) => setFilters({ ...filters, customerEmail: e.target.value, page: 1 })}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Stripe Invoice
          </button>
        </div>

        {/* Stripe Invoices List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Stripe Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stripeInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                        <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <a
                          href={invoice.stripeInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                        {invoice.status === 'open' && (
                          <button
                            onClick={() => handleSendReminder(invoice._id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Remind
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Stripe Invoice Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Create Stripe Invoice</h2>
              
              <form onSubmit={handleCreateStripeInvoice}>
                <div className="space-y-4">
                  {/* Select CRM Invoice */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CRM Invoice
                    </label>
                    <select
                      value={formData.crmInvoiceId}
                      onChange={(e) => {
                        const selected = crmInvoices.find(inv => inv._id === e.target.value);
                        setFormData({
                          ...formData,
                          crmInvoiceId: e.target.value,
                          customerData: selected ? {
                            email: selected.clientInfo.email || '',
                            name: selected.clientInfo.name || '',
                            company: selected.clientInfo.company || ''
                          } : { email: '', name: '', company: '' },
                          items: selected ? selected.items : []
                        });
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select an invoice...</option>
                      {crmInvoices.map((invoice) => (
                        <option key={invoice._id} value={invoice._id}>
                          {invoice.invoiceNumber} - {invoice.clientInfo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Email
                      </label>
                      <input
                        type="email"
                        value={formData.customerData.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerData: { ...formData.customerData, email: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={formData.customerData.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerData: { ...formData.customerData, name: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create & Send Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeInvoicePage; 