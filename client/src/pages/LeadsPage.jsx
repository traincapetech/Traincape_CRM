import React, { useState, useEffect, useCallback } from "react";
import { leadsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LeadForm from "../components/Leads/LeadForm";
import Layout from "../components/Layout/Layout";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoggingService from '../services/loggingService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LeadsPage = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const currentDate = new Date();
    const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1);
    const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
    const [showCurrentMonth, setShowCurrentMonth] = useState(true);

    const months = [
        { value: 1, label: "January" }, { value: 2, label: "February" },
        { value: 3, label: "March" }, { value: 4, label: "April" },
        { value: 5, label: "May" }, { value: 6, label: "June" },
        { value: 7, label: "July" }, { value: 8, label: "August" },
        { value: 9, label: "September" }, { value: 10, label: "October" },
        { value: 11, label: "November" }, { value: 12, label: "December" }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i);

    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const response = await leadsAPI.getAll({ populate: 'createdBy assignedTo leadPerson' });
            setLeads(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching leads:", err);
            setError("Failed to load leads. Please try again.");
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    useEffect(() => {
        if (leads.length === 0) {
            setFilteredLeads([]);
            return;
        }

        let tempFiltered;
        if (showCurrentMonth) {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            tempFiltered = leads.filter(lead => {
                const d = new Date(lead.createdAt);
                return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
            });
        } else {
            tempFiltered = leads.filter(lead => {
                const d = new Date(lead.createdAt);
                return (d.getMonth() + 1) === filterMonth && d.getFullYear() === filterYear;
            });
        }
        setFilteredLeads(tempFiltered);
    }, [leads, filterMonth, filterYear, showCurrentMonth]);

    const handleLeadSuccess = useCallback(async (lead) => {
        if (selectedLead) {
            try { await LoggingService.logLeadUpdate(lead._id, lead); }
            catch (err) { console.error('Error logging update:', err); }
            setSelectedLead(null);
            toast.success('Lead updated successfully!');
        } else {
            try { await LoggingService.logLeadCreate(lead); }
            catch (err) { console.error('Error logging create:', err); }
            setShowAddForm(false);
            toast.success('Lead created successfully!');
        }
        fetchLeads();
    }, [selectedLead, fetchLeads]);

    const handleMonthChange = (e) => { setFilterMonth(+e.target.value); setShowCurrentMonth(false); };
    const handleYearChange = (e) => { setFilterYear(+e.target.value); setShowCurrentMonth(false); };
    const handleResetToCurrentMonth = () => {
        setFilterMonth(new Date().getMonth() + 1);
        setFilterYear(new Date().getFullYear());
        setShowCurrentMonth(true);
    };

    const formatDate = (d) => new Date(d).toLocaleDateString();
    useEffect(() => { AOS.init({ duration: 600, easing: 'ease-in-out', once: true }); }, []);

    const handleEditClick = (lead) => {
        setSelectedLead(lead);
        setShowAddForm(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) return;
        try {
            await leadsAPI.remove(id);
            await LoggingService.logLeadDelete(id);
            toast.success("Lead deleted successfully!");
            fetchLeads();
        } catch (err) {
            console.error("Failed to delete:", err);
            toast.error("Failed to delete lead.");
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'Converted': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
            case 'Not Interested': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
            case 'Follow Up': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
        }
    };

    return (
        <Layout>
            <div className="bg-gray-50 dark:bg-slate-800 min-h-screen pb-12">
                {/* Header and Add Button */}
                <div className="bg-hero-light dark:bg-hero-dark p-6 pb-4 md:px-8 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Leads Management</h1>
                            <p className="text-blue-100 text-sm md:text-base">
                                {filteredLeads.length} leads • {showCurrentMonth ? 'Current Month' : `${months.find(m => m.value === filterMonth)?.label} ${filterYear}`}
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowAddForm(true); setSelectedLead(null); }}
                            className="mt-4 md:mt-0 px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg flex items-center font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                        >
                            <FaPlus className="h-4 w-4 mr-2" /> Add New Lead
                        </button>
                    </div>
                </div>

                {/* Filters - Now part of the main page flow */}
                <div className="bg-white dark:bg-slate-900 shadow-md border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 md:px-8 py-3 flex flex-wrap gap-3 items-center">
                        <select value={filterMonth} onChange={handleMonthChange} className="px-3 py-2 rounded-md border text-sm bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select value={filterYear} onChange={handleYearChange} className="px-3 py-2 rounded-md border text-sm bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <button onClick={handleResetToCurrentMonth} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                            Current Month
                        </button>
                    </div>
                </div>
                
                {/* Leads Table - Full width with standard padding */}
                <div className="px-4 md:px-8 mt-6">
                    {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
                    {loading ? (
                        <div className="p-6 flex justify-center"><LoadingSpinner /></div>
                    ) : (showAddForm || selectedLead) ? (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden p-6">
                            <LeadForm
                                lead={selectedLead}
                                onSuccess={handleLeadSuccess}
                            />
                            <button
                                onClick={() => { setShowAddForm(false); setSelectedLead(null); }}
                                className="mt-6 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Leads List
                            </button>
                        </div>
                    ) : (
                        filteredLeads.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 bg-white dark:bg-slate-900 rounded-lg shadow-md">No leads found for this period.</div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto border-collapse text-sm">
                                        <thead className="bg-black text-white uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Date</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Name</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Course</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Contact</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Country</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Status</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Lead Person</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Assigned To</th>
                                                <th className="px-4 py-3 text-center font-semibold border border-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLeads.map((lead) => (
                                                <tr key={lead._id} className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">{formatDate(lead.createdAt)}</td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">{lead.name}</td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">{lead.course}</td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                                                        <span className="block font-semibold text-gray-900 dark:text-white">{lead.phone || "N/A"}</span>
                                                        {lead.email && <span className="text-xs text-gray-500 dark:text-gray-400">{lead.email}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">{lead.country || "N/A"}</td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.feedback)}`}>
                                                            {lead.feedback || "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 whitespace-nowrap truncate max-w-[150px] text-gray-700 dark:text-gray-300">
                                                        {lead.leadPerson?.fullName || lead.leadPerson?.name || lead.createdBy?.fullName || lead.createdBy?.name || "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 whitespace-nowrap truncate max-w-[150px] text-blue-600 dark:text-blue-400">
                                                        {lead.assignedTo?.fullName || lead.assignedTo?.name || "Unassigned"}
                                                    </td>
                                                    <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                                                        <div className="flex justify-center space-x-2">
                                                            <button onClick={() => handleEditClick(lead)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors p-1">
                                                                <FaEdit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteClick(lead._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors p-1">
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default LeadsPage;