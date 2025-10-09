import React, { useState } from "react";
import axios from "axios";
import { Mail, MessageCircle, Save, Filter, CheckSquare } from "lucide-react";

const DEFAULT_REMARKS_OPTIONS = [
    "Interested",
    "Not Interested",
    "Follow Up",
    "Deal Closed",
    "Other",
];

const WebsiteLeadTable = ({ data = [], patchApiUrl }) => {
    const [rows, setRows] = useState(data);
    const [selectedIds, setSelectedIds] = useState([]);
    const [globalRemark1, setGlobalRemark1] = useState("");
    const [customRemark1, setCustomRemark1] = useState("");
    const [globalRemark2, setGlobalRemark2] = useState("");

    // ✅ Toggle row selection
    const handleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    // ✅ Update local field
    const handleChange = (id, field, value) => {
        setRows((prev) =>
            prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
        );
    };

    // ✅ Apply global remarks to selected
    const applyGlobalRemarks = () => {
        if (selectedIds.length === 0)
            return alert("Please select at least one row to apply.");

        const remark1Value =
            globalRemark1 === "Other" ? customRemark1 : globalRemark1;

        setRows((prev) =>
            prev.map((r) =>
                selectedIds.includes(r._id)
                    ? {
                        ...r,
                        remarks1: remark1Value || r.remarks1,
                        remarks2: globalRemark2 || r.remarks2,
                    }
                    : r
            )
        );

        setGlobalRemark1("");
        setCustomRemark1("");
        setGlobalRemark2("");
    };

    // ✅ Save all selected to API
    const handleSave = async () => {
        if (selectedIds.length === 0)
            return alert("Please select rows to save changes.");
        try {
            const selectedRows = rows.filter((r) => selectedIds.includes(r._id));
            await Promise.all(
                selectedRows.map((row) =>
                    axios.patch(`${patchApiUrl}/${row._id}`, {
                        remarks1: row.remarks1,
                        remarks2: row.remarks2,
                        tags: row.tags,
                    })
                )
            );
            
            alert("✅ All selected leads updated successfully!");
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            alert("❌ Failed to save. Check console for details.");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 transition-all duration-300">
            {/* 🌍 Global Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b pb-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-500" />
            <span className="font-semibold text-gray-800">Global Remarks</span>
          </div> */}

                    {/* Remark 1 */}
                    <select
                        value={globalRemark1}
                        onChange={(e) => setGlobalRemark1(e.target.value)}
                        className="border rounded-xl p-2 w-48 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Remark 1</option>
                        {DEFAULT_REMARKS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>

                    {globalRemark1 === "Other" && (
                        <input
                            type="text"
                            value={customRemark1}
                            onChange={(e) => setCustomRemark1(e.target.value)}
                            placeholder="Enter custom remark"
                            className="border rounded-xl p-2 w-48 focus:ring-2 focus:ring-blue-500"
                        />
                    )}

                    {/* Remark 2 */}
                    <input
                        type="text"
                        value={globalRemark2}
                        onChange={(e) => setGlobalRemark2(e.target.value)}
                        placeholder="Enter global remark 2"
                        className="border rounded-xl p-2 w-56 focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Apply Button */}
                    <button
                        onClick={applyGlobalRemarks}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 transition-all"
                    >
                        <CheckSquare size={16} /> Apply to Selected
                    </button>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>

            {/* 📋 Leads Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm text-left">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <th className="p-3">Select</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Message</th>
                            <th className="p-3">Remarks 1</th>
                            <th className="p-3">Remarks 2</th>
                            <th className="p-3">Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row._id}
                                className={`border-b transition-all hover:bg-gray-50 ${selectedIds.includes(row._id)
                                    ? "bg-blue-50 border-blue-200"
                                    : ""
                                    }`}
                            >
                                {/* Checkbox */}
                                <td className="p-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(row._id)}
                                        onChange={() => handleSelect(row._id)}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                </td>

                                <td className="p-3 font-medium text-gray-800">{row.name}</td>

                                <td className="p-3">
                                    <a
                                        href={`mailto:${row.email}`}
                                        className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        <Mail size={16} /> {row.email}
                                    </a>
                                </td>

                                <td className="p-3">
                                    <a
                                        href={`https://wa.me/${row.phoneNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-green-600 hover:underline"
                                    >
                                        <MessageCircle size={16} /> {row.phoneNumber}
                                    </a>
                                </td>

                                <td
                                    className="p-3 max-w-xs truncate text-gray-600"
                                    title={row.message}
                                >
                                    {row.message}
                                </td>

                                <td className="p-3 font-medium text-gray-700">
                                    {row.remarks1 || "—"}
                                </td>

                                <td className="p-3">
                                    <input
                                        type="text"
                                        value={row.remarks2 || ""}
                                        onChange={(e) =>
                                            handleChange(row._id, "remarks2", e.target.value)
                                        }
                                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
                                        placeholder="Add remark"
                                    />
                                </td>

                                <td className="p-3">
                                    <div className="flex flex-wrap gap-1">
                                        {row.tags?.length > 0 ? (
                                            row.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-xl text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 italic">No tags</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
                Showing {rows.length} leads | {selectedIds.length} selected
            </div>
        </div>
    );
};

export default WebsiteLeadTable;
