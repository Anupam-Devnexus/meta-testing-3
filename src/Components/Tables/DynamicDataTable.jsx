import React, { useEffect, useState, useMemo } from "react";
import { FaWhatsapp, FaFilter } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { FiCheck } from "react-icons/fi";

// Random tag colors
const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-red-100 text-red-700",
];

export default function DynamicDataTable({ apiData }) {
  // normalize leads
  const leads = useMemo(() => {
    if (!apiData) return [];
    return Array.isArray(apiData) ? apiData : apiData.leads || [];
  }, [apiData]);

  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, setRemarks] = useState({});
  const [tags, setTags] = useState({});
  const [showGlobalRemarks, setShowGlobalRemarks] = useState(false);
  const [remarkOptions1, setRemarkOptions1] = useState([
    "New Lead",
    "Appointment Scheduled",
    "Called",
    "Hot Lead",
    "Converted",
    "Other",
  ]);
  const [globalRemark1, setGlobalRemark1] = useState("");
  const [globalRemark2, setGlobalRemark2] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRemark1, setCustomRemark1] = useState("");


  const remarkColors = {
  "New Lead": "text-blue-600",
  "Appointment Scheduled": "text-green-600",
  "Called": "text-yellow-600",
  "Hot Lead": "text-red-600",
  "Converted": "text-purple-600",
  "Other": "text-gray-500", // default for "Other"
};
  // 🔹 Transform leads for table
  const transformedData = useMemo(() => {
    return leads.map((lead) => {
      const flatFields = {};
      lead.field_data?.forEach((f) => {
        flatFields[f.name] = f.values?.[0] || "";
      });

      return {
        _id: lead._id,
        status: lead.status,
        leadgen_id: lead.leadgen_id,
        campaign_name: lead.campaign_name,
        created_time: lead.created_time,
        ...flatFields,
      };
    });
  }, [leads]);

  // Initialize rows on data change
  useEffect(() => {
    const initEnabled = {};
    const initRemarks = {};
    const initTags = {};
    transformedData.forEach((row) => {
      const id = row._id;
      initEnabled[id] = false;
      initRemarks[id] = { remark1: "", remark2: "" };
      initTags[id] = [];
    });
    setEnabledRows(initEnabled);
    setRemarks(initRemarks);
    setTags(initTags);
  }, [transformedData]);

  const isAnyRowSelected = Object.values(enabledRows).some(Boolean);

  // 🔹 Helpers
  const detectEmail = (row) =>
    Object.entries(row).find(([k]) => k.toLowerCase().includes("email"))?.[1] || "";
  const detectPhone = (row) =>
    Object.entries(row).find(([k]) => k.toLowerCase().includes("phone"))?.[1] || "";

  const toggleRow = (id) =>
    setEnabledRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const addTag = (id, newTag) => {
    if (!newTag.trim()) return;
    setTags((prev) => ({
      ...prev,
      [id]: [
        ...prev[id],
        { text: newTag, color: tagColors[Math.floor(Math.random() * tagColors.length)] },
      ],
    }));
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
    setRemarkOptions1((prev) => [customRemark1, ...prev.filter((o) => o !== "Other"), "Other"]);
    setGlobalRemark1(customRemark1);
    setCustomRemark1("");
    setShowCustomInput(false);
  };

  const applyGlobalRemarks = () => {
    const updated = { ...remarks };
    Object.keys(enabledRows)
      .filter((id) => enabledRows[id])
      .forEach((id) => {
        updated[id] = { remark1: globalRemark1, remark2: globalRemark2 };
      });
    setRemarks(updated);
  };

  const sendWhatsApp = () => {
    transformedData
      .filter((row) => enabledRows[row._id])
      .forEach((row) => {
        const phone = detectPhone(row);
        if (!phone) return;
        const msg = encodeURIComponent(
          `Hello ${row.full_name || "Customer"},\nRemark 1: ${remarks[row._id]?.remark1 || globalRemark1}\nRemark 2: ${remarks[row._id]?.remark2 || globalRemark2}`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      });
  };

  const sendGmail = () => {
    transformedData
      .filter((row) => enabledRows[row._id])
      .forEach((row) => {
        const email = detectEmail(row);
        if (!email) return;
        const subject = encodeURIComponent("Follow Up");
        const body = encodeURIComponent(
          `Hi ${row.full_name || "Customer"},\n\nRemark 1: ${remarks[row._id]?.remark1 || globalRemark1}\nRemark 2: ${remarks[row._id]?.remark2 || globalRemark2}\n\nThanks,\nTeam`
        );
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, "_blank");
      });
  };

  if (!transformedData.length) return <p className="text-gray-500">No data available</p>;

  const headers = Object.keys(transformedData[0]).filter((k) => k !== "_id");

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <FaWhatsapp
          onClick={sendWhatsApp}
          className={`p-1 bg-green-600 text-white text-3xl rounded-md cursor-pointer shadow-sm hover:bg-green-700 transition ${!isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""}`}
          title="Send WhatsApp"
        />
        <SiGmail
          onClick={sendGmail}
          className={`p-1 bg-red-600 text-white text-3xl rounded-md cursor-pointer shadow-sm hover:bg-red-700 transition ${!isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""}`}
          title="Send Email"
        />
        <FaFilter
          onClick={() => isAnyRowSelected && setShowGlobalRemarks((p) => !p)}
          className={`text-blue-600 text-2xl cursor-pointer ${!isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""}`}
          title="Global Remarks"
        />
      </div>

      {/* Global Remarks */}
      {showGlobalRemarks && (
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <select
            value={globalRemark1}
            onChange={(e) => handleRemark1Change(e.target.value)}
            disabled={!isAnyRowSelected}
            className="px-4 py-2 border-b border-gray-300 text-sm disabled:opacity-50"
          >
            <option value="">Select Remark 1</option>
            {remarkOptions1.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>

          {showCustomInput && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter custom remark"
                value={customRemark1}
                onChange={(e) => setCustomRemark1(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={addCustomRemark}
                className="flex items-center gap-1 px-2 py-2 bg-green-600 text-white rounded-full shadow-sm hover:bg-green-700"
              >
                <FiCheck />
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Enter Remark 2"
            value={globalRemark2}
            onChange={(e) => setGlobalRemark2(e.target.value)}
            className="px-4 py-2 border-b border-gray-300 text-sm outline-none flex-1"
          />

          <button
            onClick={applyGlobalRemarks}
            className="flex items-center gap-2 px-2 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700"
          >
            <FiCheck className="text-lg" />
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Select</th>
              {headers.map((h, i) => (
                <th key={i} className="py-2 px-4 border capitalize">{h}</th>
              ))}
              <th className="py-2 px-4 border">Remarks</th>
              <th className="py-2 px-4 border">Tags</th>
            </tr>
          </thead>
          <tbody>
            {transformedData.map((row) => {
              const id = row._id;
              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">
                    <input type="checkbox" checked={enabledRows[id] || false} onChange={() => toggleRow(id)} className="w-5 h-5 accent-blue-500" />
                  </td>
                  {headers.map((h, i) => <td key={i} className="py-2 px-4 border">{row[h] || "-"}</td>)}
                  <td className="py-2 px-4 border text-xs">
                   
                    <p className="text-gray-600">{remarks[id]?.remark2 || "-"}</p>
                  </td>
                  <td className="py-2 px-4 border">
                    <div className="flex flex-wrap gap-1 mb-1">{tags[id]?.map((tag, idx) => <span key={idx} className={`px-2 py-1 text-xs rounded ${tag.color}`}>{tag.text}</span>)}</div>
                    <p className={`${remarkColors[remarks[id]?.remark1] || "text-gray-400"} font-semibold`}>
    {remarks[id]?.remark1 || "-"}
  </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
