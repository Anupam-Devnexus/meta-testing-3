import { useEffect, useState } from "react";
import {
  FaRegEdit,
  FaSearch,
  FaTag,
  FaFilter,
  FaWhatsapp,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiCheck } from "react-icons/fi";
import { SiGmail } from "react-icons/si";

import useMetaLeads from "../../../Zustand/MetaLeadsGet";
import metainsights from "../../../Zustand/MetaIns";
import useNewMetaLeads from "../../../Zustand/NewMetaLeads";

// 🔹 field variations
const phoneFieldVariants = ["phone", "mobile", "contact_number", "PHONE_NUMBER", "number"];
const emailFieldVariants = ["email", "EMAIL_ID", "contact_email", "mail"];

export default function Meta() {
  const { metaleads, fetchMetaLeads } = useMetaLeads();
  const { fetchinsights } = metainsights();
  const { fetchNewMeta } = useNewMetaLeads();

  const [leads, setLeads] = useState([]);
  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, setRemarks] = useState({});
  const [globalRemark1, setGlobalRemark1] = useState("");
  const [globalRemark2, setGlobalRemark2] = useState("");
  const [customRemark1, setCustomRemark1] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [remarkOptions1, setRemarkOptions1] = useState([
    "New Lead",
    "Appointment Scheduled",
    "Called",
    "Hot Leads",
    "Converted",
    "Other",
  ]);
  const [showGlobalRemarks, setShowGlobalRemarks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const itemsPerPage = 7;
  const leadFields = ["created_time", "created_at"];

  // 🔹 helper: detect key from field variations
  const getFieldKey = (allFields, variants) => {
    if (!allFields) return null;
    const keys = Object.keys(allFields);
    const lowerKeys = keys.map((k) => k.toLowerCase());
    for (let variant of variants) {
      const idx = lowerKeys.indexOf(variant.toLowerCase());
      if (idx !== -1) return keys[idx];
    }
    return null;
  };

  useEffect(() => {
    fetchMetaLeads();
    fetchinsights();
    fetchNewMeta();
  }, []);

  useEffect(() => {
    if (metaleads?.leads) {
      setLeads(metaleads.leads);
      const initEnabled = {};
      const initRemarks = {};
      metaleads.leads.forEach((lead) => {
        initEnabled[lead._id] = false;
        initRemarks[lead._id] = { remark1: "", remark2: "" };
      });
      setEnabledRows(initEnabled);
      setRemarks(initRemarks);
    }
  }, [metaleads]);

  const isAnyRowSelected = Object.values(enabledRows).some(Boolean);

  const toggleRow = (id) =>
    setEnabledRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleRemark1Change = (value) => {
    if (value === "Other") {
      setShowCustomInput(true);
      setGlobalRemark1("");
    } else {
      setGlobalRemark1(value);
      setShowCustomInput(false);
    }
  };

  const addCustomRemark = () => {
    if (!customRemark1.trim()) return;
    setRemarkOptions1((prev) => [
      customRemark1,
      ...prev.filter((opt) => opt !== "Other"),
      "Other",
    ]);
    setGlobalRemark1(customRemark1);
    setCustomRemark1("");
    setShowCustomInput(false);
  };

  const applyGlobalRemarks = () => {
    const updatedRemarks = { ...remarks };
    Object.keys(enabledRows)
      .filter((id) => enabledRows[id])
      .forEach((id) => {
        updatedRemarks[id] = { remark1: globalRemark1, remark2: globalRemark2 };
      });
    setRemarks(updatedRemarks);
  };

  // 🔹 build headers (normalize phone/email display)
  const allFieldKeys = leads[0]?.AllFields ? Object.keys(leads[0].AllFields) : [];
  const headers = [
    "Select",
    "ID",
    ...leadFields.map((f) =>
      f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    ),
    ...allFieldKeys.map((k) => {
      if (phoneFieldVariants.includes(k.toLowerCase())) return "Phone Number";
      if (emailFieldVariants.includes(k.toLowerCase())) return "Email";
      return k.charAt(0).toUpperCase() + k.slice(1);
    }),
    "Tags",
    "Remark 1",
    "Remark 2",
    "Actions",
  ];

  // 🔹 filter + map rows
  const rows = leads
    .filter((lead) =>
      Object.values(lead.AllFields || {})
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((lead) => {
      const leadFieldValues = leadFields.map((f) => lead[f] || "-");
      const allFieldValues = allFieldKeys.map((k) => lead.AllFields[k] || "-");
      return [lead._id, ...leadFieldValues, ...allFieldValues];
    });

  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const currentRows = rows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -----------------------------
  // Send WhatsApp
  const sendWhatsApp = () => {
    const selectedLeads = leads.filter((lead) => enabledRows[lead._id]);
    if (selectedLeads.length === 0) {
      alert("No row selected");
      return;
    }

    selectedLeads.forEach((lead) => {
      let phone = lead.phone || null;
      if (!phone) {
        const phoneKey = getFieldKey(lead.AllFields, phoneFieldVariants);
        if (phoneKey) phone = lead.AllFields[phoneKey];
      }
      if (!phone) return;

      const remark1 = remarks[lead._id]?.remark1 || globalRemark1;
      const remark2 = remarks[lead._id]?.remark2 || globalRemark2;

      const message = `Hello ${lead.name || "there"},\nRemark1: ${remark1}\nRemark2: ${remark2}`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });
  };

  // -----------------------------
  // Send Gmail
  const sendGmail = () => {
    const selectedLeads = leads.filter((lead) => enabledRows[lead._id]);
    if (selectedLeads.length === 0) {
      alert("No row selected");
      return;
    }

    selectedLeads.forEach((lead) => {
      let email = lead.email || null;
      if (!email) {
        const emailKey = getFieldKey(lead.AllFields, emailFieldVariants);
        if (emailKey) email = lead.AllFields[emailKey];
      }
      if (!email) return;

      const remark1 = remarks[lead._id]?.remark1 || globalRemark1;
      const remark2 = remarks[lead._id]?.remark2 || globalRemark2;
      const subject = "Lead Follow-up";
      const body = `Hello ${lead.name || "there"},\nRemark1: ${remark1}\nRemark2: ${remark2}\n\nBest Regards`;
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.open(url, "_blank");
    });
  };

  return (
    <section className="w-full bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <FaTag className="text-blue-500" /> Meta Leads
        </h1>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm w-60"
            />
          </div>
          {/* Filter */}
          <FaFilter
            className={`text-blue-600 text-lg cursor-pointer transition ${
              !isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() =>
              isAnyRowSelected && setShowGlobalRemarks((prev) => !prev)
            }
            title={
              !isAnyRowSelected
                ? "Select at least one row to enable"
                : showGlobalRemarks
                ? "Hide Global Remarks"
                : "Show Global Remarks"
            }
          />
        </div>
      </div>

      {/* Global Remarks Toolbar */}
      {showGlobalRemarks && (
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-center mb-4">
          {/* Remark 1 dropdown */}
          <select
            value={globalRemark1}
            onChange={(e) => handleRemark1Change(e.target.value)}
            disabled={!isAnyRowSelected}
            className="px-4 py-2 border-b border-gray-300 text-sm disabled:opacity-50"
          >
            <option value="">Select Remark 1</option>
            {remarkOptions1.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Custom Remark Input */}
          {showCustomInput && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter custom remark"
                value={customRemark1}
                onChange={(e) => setCustomRemark1(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
              />
              <button
                onClick={addCustomRemark}
                className="flex items-center gap-1 px-2 py-2 bg-green-600 text-white rounded-full shadow-sm hover:bg-green-700 transition"
              >
                <FiCheck />
              </button>
            </div>
          )}

          {/* Remark 2 */}
          <input
            type="text"
            placeholder="Enter Remark 2"
            value={globalRemark2}
            onChange={(e) => setGlobalRemark2(e.target.value)}
            className="px-4 py-2 border-b border-gray-300 text-sm outline-none flex-1"
          />

          {/* Apply */}
          <button
            onClick={applyGlobalRemarks}
            className="flex items-center gap-2 px-2 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition"
          >
            <FiCheck className="text-lg" />
          </button>

          {/* WhatsApp & Gmail */}
          <div className="flex items-center gap-2">
            <FaWhatsapp
              onClick={sendWhatsApp}
              className={`p-1 bg-green-600 text-white text-3xl rounded-md cursor-pointer shadow-sm hover:bg-green-700 transition ${
                !isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Send WhatsApp Message"
            />
            <SiGmail
              onClick={sendGmail}
              className={`p-1 bg-red-600 text-white text-3xl rounded-md cursor-pointer shadow-sm hover:bg-red-700 transition ${
                !isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Send Email via Gmail"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="py-6 text-center text-gray-400"
                >
                  No leads found.
                </td>
              </tr>
            )}

            {currentRows.map((row) => {
              const id = row[0];
              return (
                <tr
                  key={id}
                  className={`transition-all duration-200 hover:shadow-sm ${
                    enabledRows[id] ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={enabledRows[id] || false}
                      onChange={() => toggleRow(id)}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </td>

                  {row.map((cell, idx) => (
                    <td
                      key={idx}
                      className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm"
                    >
                      {cell}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {remarks[id]?.remark1 || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {remarks[id]?.remark2 || "-"}
                  </td>

                  <td className="px-4 py-3 flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition">
                      <FaRegEdit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition">
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-blue-50 disabled:opacity-50"
          >
            <IoIosArrowBack />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-blue-50 disabled:opacity-50"
          >
            <IoIosArrowForward />
          </button>
        </div>
      )}
    </section>
  );
}
