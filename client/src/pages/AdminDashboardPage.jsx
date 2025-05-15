import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { leadsAPI, salesAPI, authAPI } from "../services/api";
import { formatCurrency } from "../utils/helpers";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentLeads: [],
    recentSales: [],
    userCounts: {
      salesPerson: 0,
      leadPerson: 0,
      manager: 0,
      admin: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads data
      const leadsResponse = await leadsAPI.getAll();
      const leads = leadsResponse.data.success ? leadsResponse.data.data : [];
      
      // Fetch sales data
      const salesResponse = await salesAPI.getAll();
      const sales = salesResponse.data.success ? salesResponse.data.data : [];
      
      // Fetch users data
      const usersResponse = await authAPI.getUsers();
      const users = usersResponse.data.success ? usersResponse.data.data : [];
      
      // Calculate statistics
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      
      // Get recent leads (last 5)
      const recentLeads = [...leads]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      // Get recent sales (last 5)
      const recentSales = [...sales]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      // Count users by role
      const userCounts = {
        salesPerson: users.filter(u => u.role === "Sales Person").length,
        leadPerson: users.filter(u => u.role === "Lead Person").length,
        manager: users.filter(u => u.role === "Manager").length,
        admin: users.filter(u => u.role === "Admin").length
      };
      
      setStats({
        totalLeads: leads.length,
        totalSales: sales.length,
        totalRevenue,
        totalUsers: users.length,
        recentLeads,
        recentSales,
        userCounts
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="text-sm text-gray-600">Last updated: {new Date().toLocaleString()}</div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Leads</h3>
                    <p className="text-3xl font-bold mt-1">{stats.totalLeads}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/leads" className="text-sm text-blue-600 hover:underline">View all leads</Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
                    <p className="text-3xl font-bold mt-1">{stats.totalSales}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/sales-tracking" className="text-sm text-blue-600 hover:underline">View all sales</Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/admin/reports" className="text-sm text-blue-600 hover:underline">View reports</Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Team Members</h3>
                    <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/admin/users" className="text-sm text-blue-600 hover:underline">Manage users</Link>
                </div>
              </div>
            </div>

            {/* Users Overview */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Team Overview</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <h3 className="text-sm text-gray-500">Sales Team</h3>
                    <p className="text-2xl font-bold mt-1">{stats.userCounts.salesPerson}</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <h3 className="text-sm text-gray-500">Lead Team</h3>
                    <p className="text-2xl font-bold mt-1">{stats.userCounts.leadPerson}</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <h3 className="text-sm text-gray-500">Managers</h3>
                    <p className="text-2xl font-bold mt-1">{stats.userCounts.manager}</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <h3 className="text-sm text-gray-500">Admins</h3>
                    <p className="text-2xl font-bold mt-1">{stats.userCounts.admin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Leads */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Recent Leads</h2>
                </div>
                <div className="p-6">
                  {stats.recentLeads.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent leads found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentLeads.map((lead) => (
                            <tr key={lead._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">{lead.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{lead.course}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-4 text-right">
                    <Link to="/leads" className="text-sm text-blue-600 hover:underline">
                      View all leads
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Sales */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Recent Sales</h2>
                </div>
                <div className="p-6">
                  {stats.recentSales.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent sales found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentSales.map((sale) => (
                            <tr key={sale._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">{sale.leadId?.name || 'N/A'}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{sale.product}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(sale.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-4 text-right">
                    <Link to="/sales-tracking" className="text-sm text-blue-600 hover:underline">
                      View all sales
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/admin/users" className="bg-blue-50 hover:bg-blue-100 transition p-4 rounded-lg text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-gray-800 font-medium">Manage Users</span>
                    </div>
                  </Link>
                  <Link to="/admin/leads" className="bg-green-50 hover:bg-green-100 transition p-4 rounded-lg text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-800 font-medium">Manage Leads</span>
                    </div>
                  </Link>
                  <Link to="/admin/reports" className="bg-purple-50 hover:bg-purple-100 transition p-4 rounded-lg text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-gray-800 font-medium">View Reports</span>
                    </div>
                  </Link>
                  <Link to="/sales-tracking" className="bg-yellow-50 hover:bg-yellow-100 transition p-4 rounded-lg text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-800 font-medium">Sales Tracking</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboardPage; 