import React, { useState, useMemo } from "react";
import axios from "axios";
import { Mail, MessageCircle } from "lucide-react";

const TAG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-red-100 text-red-700",
];

const ModernTable = ({ leads = [], patchApi }) => {
  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, setRemarks] = useState({});
  const [globalRemark1, setGlobalRemark1] = useState("");
  const [globalRemark2, setGlobalRemark2] = useState("");
  const [loading, setLoading] = useState(false);

  const token = JSON.parse(localStorage.getItem("UserDetails"))?.token;

  if (!token) {
    return <p className="text-red-600">User not authenticated. Please log in.</p>;
  }

  // Collect dynamic table headers
  const allKeys = useMemo(() => {
    if (!leads.length) return [];
    const keys = new Set();
    leads.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [leads]);

  const toggleRow = (id) => {
    setEnabledRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const applyGlobalRemarks = () => {
    setRemarks((prev) => {
      const updated = { ...prev };
      Object.keys(enabledRows)
        .filter((id) => enabledRows[id])
        .forEach((id) => {
          updated[id] = { remark1: globalRemark1, remark2: globalRemark2 };
        });
      return updated;
    });
  };

  const handleSendEmail = (row) => {
    if (!row.email) return;
    const subject = encodeURIComponent("Follow-up on your inquiry");
    const body = encodeURIComponent(
      `Hello ${row.field_data?.find((f) => f.name === "full_name")?.values[0] || "Customer"},\n\nRemark 1: ${remarks[row._id]?.remark1 || row.remarks1 || ""
      }\nRemark 2: ${remarks[row._id]?.remark2 || row.remarks2 || ""}`
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${row.email}&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  const handleSendWhatsApp = (row) => {
    const phone = row.field_data?.find((f) => f.name === "phone")?.values[0];
    if (!phone) return;
    const msg = encodeURIComponent(
      `Hello ${row.field_data?.find((f) => f.name === "full_name")?.values[0] || "Customer"},\nRemark 1: ${remarks[row._id]?.remark1 || row.remarks1 || ""
      }\nRemark 2: ${remarks[row._id]?.remark2 || row.remarks2 || ""}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const submitChanges = async () => {
    if (!Object.values(enabledRows).some(Boolean)) {
      alert("No rows selected!");
      return;
    }

    setLoading(true);
    try {
      const updates = Object.keys(enabledRows)
        .filter((id) => enabledRows[id])
        .map((id) => ({
          _id: id,
          remarks1: remarks[id]?.remark1,
          remarks2: remarks[id]?.remark2,
        }));

      await axios.patch(`${patchApi}`, { updates });
      alert("Remarks updated ✅");
    } catch (err) {
      console.error("Error updating remarks:", err);
      alert("Failed to update remarks ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!leads.length)
    return <p className="text-gray-500 text-center py-6">No data available</p>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 rounded-lg shadow-lg">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <input
          type="text"
          placeholder="Global Remark 1"
          value={globalRemark1}
          onChange={(e) => setGlobalRemark1(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-1/2"
        />
        <input
          type="text"
          placeholder="Global Remark 2"
          value={globalRemark2}
          onChange={(e) => setGlobalRemark2(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-1/2"
        />
        <button
          onClick={applyGlobalRemarks}
          disabled={!Object.values(enabledRows).some(Boolean)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Apply Global Remarks
        </button>
        <button
          onClick={submitChanges}
          disabled={!Object.values(enabledRows).some(Boolean) || loading}
          className="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Submit Changes"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-3 border text-center">Select</th>
              {allKeys.map((key) => (
                <th key={key} className="p-3 border text-left">
                  {key}
                </th>
              ))}
              <th className="p-3 border text-center">Remark1</th>
              <th className="p-3 border text-center">Remark2</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((row, idx) => (
              <tr
                key={row._id}
                className={`transition hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
              >
                <td className="p-3 border text-center">
                  <input
                    type="checkbox"
                    checked={enabledRows[row._id] || false}
                    onChange={() => toggleRow(row._id)}
                    className="w-4 h-4"
                  />
                </td>

                {allKeys.map((key) => (
                  <td key={key} className="p-3 border">
                    {Array.isArray(row[key]) ? (
                      <div className="flex flex-wrap gap-1">
                        {row[key].map((item, i) =>
                          typeof item === "string" ? (
                            <span
                              key={i}
                              className={`px-2 py-1 text-xs rounded-full ${TAG_COLORS[i % TAG_COLORS.length]}`}
                            >
                              {item}
                            </span>
                          ) : (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded bg-gray-200"
                            >
                              {JSON.stringify(item)}
                            </span>
                          )
                        )}
                      </div>
                    ) : row[key]?.toString() || "N/A"}
                  </td>
                ))}

                <td className="p-3 border">
                  <input
                    type="text"
                    value={remarks[row._id]?.remark1 || row.remarks1 || ""}
                    onChange={(e) =>
                      setRemarks((prev) => ({
                        ...prev,
                        [row._id]: {
                          ...prev[row._id],
                          remark1: e.target.value,
                        },
                      }))
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>

                <td className="p-3 border">
                  <input
                    type="text"
                    value={remarks[row._id]?.remark2 || row.remarks2 || ""}
                    onChange={(e) =>
                      setRemarks((prev) => ({
                        ...prev,
                        [row._id]: {
                          ...prev[row._id],
                          remark2: e.target.value,
                        },
                      }))
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>

                <td className="p-3 border flex justify-center gap-2">
                  <button
                    onClick={() => handleSendEmail(row)}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    <Mail size={18} />
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(row)}
                    className="text-green-600 hover:text-green-800 transition"
                  >
                    <MessageCircle size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModernTable;
