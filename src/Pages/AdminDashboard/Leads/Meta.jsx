import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import useMetaLeads from "../../../Zustand/MetaLeadsGet";
import metainsights from "../../../Zustand/MetaIns";
import useNewMetaLeads from "../../../Zustand/NewMetaLeads";

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
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;
  const leadFields = ["created_time", "created_at"];

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

  const toggleRow = (id) => {
    setEnabledRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    setRemarkOptions1((prev) => [customRemark1, ...prev.filter((opt) => opt !== "Other"), "Other"]);
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

  const allFieldKeys = leads[0]?.AllFields ? Object.keys(leads[0].AllFields) : [];
  const headers = [
    "Select",
    "ID",
    ...leadFields.map((f) => f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())),
    ...allFieldKeys.map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
    "Tags",
    "Remark",
    "Actions",
  ];

  const rows = leads.map((lead) => {
    const leadFieldValues = leadFields.map((f) => lead[f] || "-");
    const allFieldValues = allFieldKeys.map((k) => lead.AllFields[k] || "-");
    return [lead._id, ...leadFieldValues, ...allFieldValues];
  });

  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const currentRows = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section className="w-full bg-gray-50 min-h-screen p-6">
      {/* Global Remarks */}
      <div className="mb-4 flex gap-2 items-center">
        <div className="flex items-center gap-2">
          <select
            value={globalRemark1}
            onChange={(e) => handleRemark1Change(e.target.value)}
            className="px-4 py-2 border rounded-md text-sm border-blue-300"
          >
            <option value="">Select Remark 1</option>
            {remarkOptions1.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {showCustomInput && (
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Enter custom remark"
                value={customRemark1}
                onChange={(e) => setCustomRemark1(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm border-blue-300"
              />
              <button
                onClick={addCustomRemark}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="Enter Remark 2"
          value={globalRemark2}
          onChange={(e) => setGlobalRemark2(e.target.value)}
          className="px-4 py-2 border rounded-md text-sm border-blue-300"
        />

        <button
          onClick={applyGlobalRemarks}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Apply to Selected
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-lg divide-y divide-gray-200">
          <thead className="bg-blue-100 sticky top-0 z-10">
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
                <td colSpan={headers.length} className="py-6 text-center text-gray-400">
                  No leads found.
                </td>
              </tr>
            )}

            {currentRows.map((row) => {
              const id = row[0];
              return (
                <tr
                  key={id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    enabledRows[id] ? "bg-green-50" : "bg-white"
                  } rounded-md`}
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
                    <td key={idx} className="px-4 py-3 whitespace-nowrap text-gray-800 text-sm font-medium">
                      {cell}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-sm">{remarks[id]?.remark1 || "-"}</td>
                  <td className="px-4 py-3 text-sm">{remarks[id]?.remark2 || "-"}</td>

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
        <div className="mt-6 flex justify-center space-x-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
