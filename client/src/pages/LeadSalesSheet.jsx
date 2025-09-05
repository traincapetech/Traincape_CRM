import React, { useState, useEffect } from "react";
import { salesAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout/Layout";
import {
  FaDownload,
  FaEdit,
  FaSave,
  FaTimesCircle,
  FaFilter,
  FaCalendar,
  FaSync,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import axios from "axios";
import LoggingService from "../services/loggingService";

const LeadSalesSheet = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesPersons, setSalesPersons] = useState([]);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editData, setEditData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth(); // Date filtering state

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
  const [showCurrentMonth, setShowCurrentMonth] = useState(false);
  const [showAllSales, setShowAllSales] = useState(true); // Generate month options

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
    { value: 12, label: "December" },
  ]; // Generate year options (5 years back from current year)

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadSalesData();
    loadUsers(); // Set up automatic refresh every 2 minutes

    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing sales data...");
      loadSalesData(true);
    }, 120000); // 2 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, []); // Apply date filters when sales data changes

  useEffect(() => {
    if (sales.length > 0) {
      applyDateFilters();
    }
  }, [sales, filterMonth, filterYear, showCurrentMonth, showAllSales]);

  const applyDateFilters = () => {
    if (showAllSales) {
      setFilteredSales(sales);
      return;
    }

    if (showCurrentMonth) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const filtered = sales.filter((sale) => {
        if (!sale.date && !sale.createdAt) {
          console.log("Sale has no date:", sale);
          return false;
        }

        const saleDate = new Date(sale.date || sale.createdAt);
        const saleMonth = saleDate.getMonth() + 1;
        const saleYear = saleDate.getFullYear();

        return saleMonth === currentMonth && saleYear === currentYear;
      });

      setFilteredSales(filtered);
    } else {
      const filtered = sales.filter((sale) => {
        if (!sale.date && !sale.createdAt) {
          console.log("Sale has no date:", sale);
          return false;
        }

        const saleDate = new Date(sale.date || sale.createdAt);
        const saleMonth = saleDate.getMonth() + 1;
        const saleYear = saleDate.getFullYear();

        return saleMonth === filterMonth && saleYear === filterYear;
      });

      setFilteredSales(filtered);
    }
  };

  const loadSalesData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const res = await salesAPI.getAllForced();

        if (res.data && res.data.success) {
          const leadPersonSales = res.data.data.filter(
            (sale) =>
              sale.leadPerson === user._id ||
              (sale.leadPerson && sale.leadPerson._id === user._id)
          );

          setSales(leadPersonSales);

          if (!isAutoRefresh) {
            setFilteredSales(leadPersonSales);
          } else {
            applyDateFilters();
          }

          if (isAutoRefresh) {
            toast.info("Sales data refreshed automatically");
          }
        } else {
          setError(
            "Failed to load sales data: " +
              (res.data?.message || "Unknown error")
          );
        }
      } catch (apiError) {
        setError("Failed to load sales data. Please try again.");
      }
    } catch (err) {
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMonthChange = (e) => {
    setFilterMonth(parseInt(e.target.value));
    setShowCurrentMonth(false);
    setShowAllSales(false);
  };

  const handleYearChange = (e) => {
    setFilterYear(parseInt(e.target.value));
    setShowCurrentMonth(false);
    setShowAllSales(false);
  };

  const handleResetToCurrentMonth = () => {
    const today = new Date();
    setFilterMonth(today.getMonth() + 1);
    setFilterYear(today.getFullYear());
    setShowCurrentMonth(true);
    setShowAllSales(false);
  };

  const loadUsers = async () => {
    try {
      const salesRes = await authAPI.getUsers("Sales Person");
      setSalesPersons(salesRes.data.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleEdit = (sale) => {
    setEditingSaleId(sale._id);
    setEditData({
      DATE: sale.date || new Date().toISOString(),
      NAME: sale.customerName || "",
      COUNTRY: sale.country || "",
      COURSE: sale.course || "",
      CODE: sale.countryCode || "+1",
      NUMBER: sale.contactNumber || "",
      "E-MAIL": sale.email || "",
      "PSUDO ID": sale.pseudoId || "",
      "SALE PERSON":
        (sale.salesPerson && (sale.salesPerson._id || sale.salesPerson)) || "",
      "LEAD PERSON":
        (sale.leadPerson && (sale.leadPerson._id || sale.leadPerson)) ||
        user.id ||
        "",
      SOURSE: sale.source || "",
      "CLIENT REMARK": sale.clientRemark || "",
      FEEDBACK: sale.feedback || "",
      TOTAL_COST: sale.totalCost || 0,
      TOTAL_COST_CURRENCY: sale.totalCostCurrency || "USD",
      TOKEN_AMOUNT: sale.tokenAmount || 0,
      TOKEN_AMOUNT_CURRENCY: sale.tokenAmountCurrency || "USD",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const saleData = {
        date: editData.DATE,
        customerName: editData.NAME,
        country: editData.COUNTRY,
        course: editData.COURSE,
        countryCode: editData.CODE,
        contactNumber: editData.NUMBER,
        email: editData["E-MAIL"],
        pseudoId: editData["PSUDO ID"],
        salesPerson: editData["SALE PERSON"],
        leadPerson: editData["LEAD PERSON"],
        source: editData.SOURSE,
        clientRemark: editData["CLIENT REMARK"],
        feedback: editData.FEEDBACK,
        totalCost: parseFloat(editData.TOTAL_COST) || 0,
        totalCostCurrency: editData.TOTAL_COST_CURRENCY,
        tokenAmount: parseFloat(editData.TOKEN_AMOUNT) || 0,
        tokenAmountCurrency: editData.TOKEN_AMOUNT_CURRENCY,
      };

      const response = await salesAPI.update(editingSaleId, saleData);
      if (response.data && response.data.success) {
        try {
          await LoggingService.logSaleUpdate(editingSaleId, saleData);
        } catch (logError) {
          console.error("Error logging sale update:", logError);
        }

        toast.success("Sale updated successfully");

        setSales((prevSales) =>
          prevSales.map((sale) => {
            if (sale._id === editingSaleId) {
              return response.data.data;
            }
            return sale;
          })
        );

        const wasShowingAllSales = showAllSales;
        if (!wasShowingAllSales) {
          setShowAllSales(true);
          toast.info(
            "Showing all sales to display your changes. Use filters to narrow down if needed."
          );
        }
      } else {
        setError(
          "Failed to update sale: " +
            (response.data?.message || "Unknown error")
        );
      }

      setEditingSaleId(null);

      if (!response.data || !response.data.success) {
        loadSalesData();
      }
    } catch (err) {
      setError("Failed to update sale. Please try again.");
      setEditingSaleId(null);
      loadSalesData();
    }
  };

  const handleCancel = () => {
    setEditingSaleId(null);
  };

  const exportToExcel = () => {
    const fileName = `Lead-Sales-Sheet-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    const exportData = filteredSales.map((sale) => ({
      DATE: new Date(sale.date).toLocaleDateString(),
      NAME: sale.customerName,
      COUNTRY: sale.country,
      COURSE: sale.course,
      CODE: sale.countryCode || "",
      NUMBER: sale.contactNumber,
      "E-MAIL": sale.email || "",
      "PSUDO ID": sale.pseudoId || "",
      "SALE PERSON": sale.salesPerson?.fullName || "",
      "LEAD PERSON": sale.leadPerson?.fullName || "",
      SOURSE: sale.source || "",
      "CLIENT REMARK": sale.clientRemark || "",
      FEEDBACK: sale.feedback || "",
      "TOTAL COST": `${sale.totalCost?.toFixed(2) || "0.00"} ${
        sale.totalCostCurrency || "USD"
      }`,
      "TOKEN AMOUNT": `${sale.tokenAmount?.toFixed(2) || "0.00"} ${
        sale.tokenAmountCurrency || "USD"
      }`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lead Sales");

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Layout>
           {" "}
      <div className="container mx-auto px-4 py-8">
               {" "}
        <div className="flex justify-between items-center mb-6">
                   {" "}
          <div>
                       {" "}
            <h1 className="text-2xl text-start font-bold text-gray-800 dark:text-gray-200">
              Lead Sales Sheet
            </h1>
                       {" "}
            <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">
                            This page shows sales where you are the Lead Person.
                            Sales created by Sales Persons who select you as the
              Lead Person will appear here.            {" "}
            </p>
                     {" "}
          </div>
                   {" "}
          <div className="flex space-x-2">
                       {" "}
            <button
              onClick={() => loadSalesData(false)}
              disabled={refreshing}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${
                refreshing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
                           {" "}
              {refreshing ? (
                <>
                                    <FaSync className="mr-2 animate-spin" />{" "}
                  Refreshing...                {" "}
                </>
              ) : (
                <>
                                    <FaSync className="mr-2" /> Refresh        
                         {" "}
                </>
              )}
                         {" "}
            </button>
                       {" "}
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
                            <FaDownload className="mr-2" /> Export            {" "}
            </button>
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl shadow-sm">
                   {" "}
          <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <FaFilter className="mr-2 text-blue-500" /> Filter Sales
            by Date          {" "}
          </h3>
                   {" "}
          <div className="flex flex-wrap items-center gap-4">
                       {" "}
            <div>
                           {" "}
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-600 dark:text-gray-500 mb-1"
              >
                Month
              </label>
                           {" "}
              <select
                id="month"
                value={filterMonth}
                onChange={handleMonthChange}
                className="border border-slate-300 dark:border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                disabled={showCurrentMonth}
              >
                               {" "}
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                                        {month.label}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-600 dark:text-gray-500 mb-1"
              >
                Year
              </label>
                           {" "}
              <select
                id="year"
                value={filterYear}
                onChange={handleYearChange}
                className="border border-slate-300 dark:border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                disabled={showCurrentMonth}
              >
                               {" "}
                {years.map((year) => (
                  <option key={year} value={year}>
                                        {year}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                       {" "}
            <div className="flex items-center ml-4">
                           {" "}
              <input
                id="currentMonth"
                type="checkbox"
                checked={showCurrentMonth}
                onChange={() => {
                  setShowCurrentMonth(!showCurrentMonth);
                  if (!showCurrentMonth) {
                    setShowAllSales(false);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 border-slate-300 dark:border-slate-600 rounded"
              />
                           {" "}
              <label
                htmlFor="currentMonth"
                className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
              >
                                Show Current Month Only              {" "}
              </label>
                         {" "}
            </div>
                       {" "}
            <div className="flex items-center ml-4">
                           {" "}
              <input
                id="showAllSales"
                type="checkbox"
                checked={showAllSales}
                onChange={() => {
                  setShowAllSales(!showAllSales);
                  if (!showAllSales) {
                    setShowCurrentMonth(false);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 border-slate-300 dark:border-slate-600 rounded"
              />
                           {" "}
              <label
                htmlFor="showAllSales"
                className="ml-2 block text-sm text-slate-700 dark:text-slate-300 font-semibold text-blue-600"
              >
                                Show All Sales (No Date Filter)              {" "}
              </label>
                         {" "}
            </div>
                       {" "}
            <button
              onClick={handleResetToCurrentMonth}
              className="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md ml-auto transition duration-300 flex items-center"
            >
                            <FaCalendar className="mr-2" /> Reset to Current
              Month            {" "}
            </button>
                     {" "}
          </div>
                   {" "}
          <div className="mt-3 text-sm text-black dark:text-gray-400">
                       {" "}
            {showAllSales ? (
              <p>
                Showing all sales regardless of date: {sales.length} total
                records
              </p>
            ) : showCurrentMonth ? (
              <p>
                Showing sales for current month:{" "}
                {months[new Date().getMonth()].label} {new Date().getFullYear()}
              </p>
            ) : (
              <p>
                Showing sales for: {months[filterMonth - 1].label} {filterYear}
              </p>
            )}
                        <p>Total: {filteredSales.length} records</p>         {" "}
          </div>
                 {" "}
        </div>
               {" "}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                        <p>{error}</p>         {" "}
          </div>
        )}
               {" "}
        {loading ? (
          <div className="flex justify-center items-center h-64">
                       {" "}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                     {" "}
          </div>
        ) : (
          <div className="overflow-x-auto">
                       {" "}
            <table className="min-w-full bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 table-fixed">
                           {" "}
              <thead>
                               {" "}
                <tr className="bg-gray-100 dark:bg-slate-700">
                                                     {" "}
                  <th className="border px-4 py-2 w-28">Date</th>               
                    <th className="border px-4 py-2 w-48">Name</th>             
                      <th className="border px-4 py-2 w-40">Course</th>         
                         {" "}
                  <th className="border px-4 py-2 w-40">Sales Person</th>       
                           {" "}
                  <th className="border px-4 py-2 w-40">Total Cost</th>         
                         {" "}
                  <th className="border px-4 py-2 w-40">Token Amount</th>       
                            <th className="border px-4 py-2 w-48">Number</th>   
                                <th className="border px-4 py-2 w-48">Email</th>
                                   {" "}
                  <th className="border px-4 py-2 w-32">Country</th>           
                        <th className="border px-4 py-2 w-40">Lead Person</th>
                  <th className="border px-4 py-2 w-24">Actions</th>           
                     {" "}
                </tr>
                             {" "}
              </thead>
                           {" "}
              <tbody>
  {filteredSales.map((sale) => (
    editingSaleId === sale._id ? (
      // 🔹 Editable Row
      <tr key={sale._id} className="bg-yellow-50 dark:bg-slate-800">
        <td className="border px-3 py-2">
          <input
            type="date"
            name="DATE"
            value={editData.DATE?.split("T")[0] || ""}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="text"
            name="NAME"
            value={editData.NAME}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="text"
            name="COURSE"
            value={editData.COURSE}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">{sale.salesPerson?.fullName || "N/A"}</td>
        <td className="border px-3 py-2">
          <input
            type="number"
            name="TOTAL_COST"
            value={editData.TOTAL_COST}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="number"
            name="TOKEN_AMOUNT"
            value={editData.TOKEN_AMOUNT}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="text"
            name="NUMBER"
            value={editData.NUMBER}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="email"
            name="E-MAIL"
            value={editData["E-MAIL"]}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="text"
            name="COUNTRY"
            value={editData.COUNTRY}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        </td>
        <td className="border px-3 py-2">{sale.leadPerson?.fullName || "N/A"}</td>
        <td className="border px-3 py-2 text-center">
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2 mb-1"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </td>
      </tr>
    ) : (
      // 🔹 Normal Row
      <tr key={sale._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
        <td className="border px-3 py-2">
          {new Date(sale.date).toLocaleDateString()}
        </td>
        <td className="border px-3 py-2">{sale.customerName}</td>
        <td className="border px-3 py-2">{sale.course}</td>
        <td className="border px-3 py-2">{sale.salesPerson?.fullName || "N/A"}</td>
        <td className="border px-3 py-2">
          {sale.totalCost?.toFixed(2)} {sale.totalCostCurrency}
        </td>
        <td className="border px-3 py-2">
          {sale.tokenAmount?.toFixed(2)} {sale.tokenAmountCurrency}
        </td>
        <td className="border px-3 py-2">{sale.contactNumber || "N/A"}</td>
        <td className="border px-3 py-2">{sale.email || "N/A"}</td>
        <td className="border px-3 py-2">{sale.country || "N/A"}</td>
        <td className="border px-3 py-2">{sale.leadPerson?.fullName || "N/A"}</td>
        <td className="border px-3 py-2 text-center">
          <button
            onClick={() => handleEdit(sale)}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
        </td>
      </tr>
    )
  ))}
</tbody>

                         {" "}
            </table>
                     {" "}
          </div>
        )}
             {" "}
      </div>
         {" "}
    </Layout>
  );
};

export default LeadSalesSheet;
