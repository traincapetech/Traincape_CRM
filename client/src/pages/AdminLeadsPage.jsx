import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { leadsAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const AdminLeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collapsible filters
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    country: "",
    course: "",
    source: "",
    dateFrom: "",
    dateTo: "",
    assignedTo: "",
    leadPerson: ""
  });

  // Options for filters
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    courses: [],
    sources: [],
    salesPersons: [],
    leadPersons: []
  });

  // Lead statuses
  const statusOptions = [
    "New",
    "Contacted",
    "Qualified",
    "Lost",
    "Converted",
    "Introduction",
    "Acknowledgement",
    "Question",
    "Future Promise",
    "Payment",
    "Analysis"
  ];

  useEffect(() => {
    fetchLeads();
    fetchUserOptions();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      applyFilters();
      extractFilterOptions();
    }
  }, [leads, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll();

      if (response.data.success) {
        setLeads(response.data.data);
        setFilteredLeads(response.data.data);
        setError(null);
      } else {
        setError("Failed to load leads");
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOptions = async () => {
    try {
      const salesPersonsResponse = await authAPI.getUsers("Sales Person");
      const leadPersonsResponse = await authAPI.getUsers("Lead Person");

      setFilterOptions((prev) => ({
        ...prev,
        salesPersons: salesPersonsResponse.data.data || [],
        leadPersons: leadPersonsResponse.data.data || []
      }));
    } catch (err) {
      console.error("Error fetching user options:", err);
    }
  };

  const extractFilterOptions = () => {
    const countries = [
      ...new Set(leads.map((lead) => lead.country).filter(Boolean))
    ];
    const courses = [
      ...new Set(leads.map((lead) => lead.course).filter(Boolean))
    ];
    const sources = [
      ...new Set(leads.map((lead) => lead.source).filter(Boolean))
    ];

    setFilterOptions((prev) => ({
      ...prev,
      countries,
      courses,
      sources
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      country: "",
      course: "",
      source: "",
      dateFrom: "",
      dateTo: "",
      assignedTo: "",
      leadPerson: ""
    });
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
          (lead.phone && lead.phone.includes(searchTerm)) ||
          (lead.pseudoId && lead.pseudoId.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }
    if (filters.country) {
      filtered = filtered.filter((lead) => lead.country === filters.country);
    }
    if (filters.course) {
      filtered = filtered.filter((lead) => lead.course === filters.course);
    }
    if (filters.source) {
      filtered = filtered.filter((lead) => lead.source === filters.source);
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((lead) => new Date(lead.createdAt) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((lead) => new Date(lead.createdAt) <= toDate);
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(
        (lead) => lead.assignedTo && lead.assignedTo._id === filters.assignedTo
      );
    }
    if (filters.leadPerson) {
      filtered = filtered.filter(
        (lead) => lead.leadPerson && lead.leadPerson._id === filters.leadPerson
      );
    }

    setFilteredLeads(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Status pill colors
  const statusPill = (status) => {
    const base =
      "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    const map = {
      Introduction: "bg-blue-100 text-blue-800",
      Acknowledgement: "bg-yellow-100 text-yellow-800",
      Question: "bg-purple-100 text-purple-800",
      "Future Promise": "bg-red-100 text-red-800",
      Payment: "bg-green-100 text-green-800",
      Analysis: "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
    };
    return <span className={`${base} ${map[status] ?? "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"}`}>{status}</span>;
  };

  return (
    <Layout>
      {/* Full-width content area */}
      <div className="mx-auto w-full max-w-[100vw] px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Leads Management</h1>
          <Link
            to="/leads"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md"
          >
            Standard Leads View
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Collapsible Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-2xl mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title={filtersOpen ? "Collapse filters" : "Expand filters"}
              >
                {/* simple chevron */}
                <span
                  className={`block transition-transform duration-200 ${
                    filtersOpen ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
              </button>
              <h2 className="text-lg font-medium">Advanced Filters</h2>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>

          {filtersOpen && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder="Search name, email, phone..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Countries</option>
                    {filterOptions.countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={filters.course}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Courses</option>
                    {filterOptions.courses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={filters.source}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Sources</option>
                    {filterOptions.sources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label htmlFor="dateTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned To
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={filters.assignedTo}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Sales Persons</option>
                    {filterOptions.salesPersons.map((sp) => (
                      <option key={sp._id} value={sp._id}>
                        {sp.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lead Person */}
                <div>
                  <label htmlFor="leadPerson" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Lead Person
                  </label>
                  <select
                    id="leadPerson"
                    name="leadPerson"
                    value={filters.leadPerson}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Lead Persons</option>
                    {filterOptions.leadPersons.map((lp) => (
                      <option key={lp._id} value={lp._id}>
                        {lp.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-2xl w-full">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {filteredLeads.length} Leads Found
              </h3>
              <div className="text-sm text-slate-500 dark:text-gray-400">
                Showing filtered results from a total of {leads.length} leads
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-gray-400">
                No leads found matching your filters. Try adjusting your criteria.
              </div>
            ) : (
              <div className="w-full">
<table className="w-full border-collapse table-auto">
  {/* ===== HEADERS ===== */}
  <thead className="bg-gray-50 dark:bg-slate-800">
    <tr>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[4%]">
        #
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[18%]">
        Name
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[18%]">
        Contact
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[12%]">
        Course
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[10%]">
        Status
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[10%]">
        Country
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[12%]">
        Assigned To
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[12%]">
        Lead By
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[8%]">
        Date
      </th>
      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase w-[8%]">
        Actions
      </th>
    </tr>
  </thead>

  {/* ===== ROWS ===== */}
  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
    {filteredLeads.map((lead, index) => (
      <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">

        {/* # */}
        <td className="px-3 py-3 text-sm text-slate-700 text-center align-middle">
          {index + 1}
        </td>

        {/* NAME */}
        <td className="px-3 py-3 text-sm text-slate-800 align-middle">
          <div className="font-medium">{lead.name}</div>
          {lead.altName && (
            <div className="text-xs text-slate-500">{lead.altName}</div>
          )}
        </td>

        {/* CONTACT */}
        <td className="px-3 py-3 text-sm text-slate-700 align-middle break-words">
          {lead.email && <div>{lead.email}</div>}
          <div>{lead.countryCode} {lead.phone}</div>
        </td>

        {/* COURSE */}
        <td className="px-3 py-3 text-sm text-slate-700 align-middle">
          {lead.course}
        </td>

        {/* STATUS */}
        <td className="px-3 py-3 text-sm text-center align-middle">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
            {lead.status}
          </span>
        </td>

        {/* COUNTRY */}
        <td className="px-3 py-3 text-sm text-slate-700 align-middle">
          {lead.country}
        </td>

        {/* ASSIGNED TO */}
        <td className="px-3 py-3 text-sm text-slate-700 align-middle">
          {lead.assignedTo ? lead.assignedTo.fullName : "N/A"}
        </td>

        {/* LEAD BY */}
        <td className="px-3 py-3 text-sm text-slate-700 align-middle">
          {lead.leadPerson ? lead.leadPerson.fullName : "N/A"}
        </td>

        {/* DATE */}
        <td className="px-3 py-3 text-sm text-slate-700 text-center align-middle">
          {formatDate(lead.createdAt)}
        </td>

        {/* ACTION */}
        <td className="px-3 py-3 text-sm text-center align-middle">
          <Link
            to={`/leads#${lead._id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            View
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
</table>





              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminLeadsPage;
