import { useEffect, useState } from "react";
import useLeadStore from "../../../Zustand/LeadsGet";
import useUserStore from "../../../Zustand/UsersGet";
import { useNavigate } from "react-router-dom";

export default function MannualLeads() {
  const { data, loading, error, fetchData } = useLeadStore();
  const { users, userloading, usererror, fetchUser } = useUserStore();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Global remarks states
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

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const leads = data?.leads || [];
  const edata = users?.users || [];

  // Initialize enabledRows and remarks
  useEffect(() => {
    const initEnabled = {};
    const initRemarks = {};
    leads.forEach((lead) => {
      initEnabled[lead._id] = false;
      initRemarks[lead._id] = { remark1: "", remark2: "" };
    });
    setEnabledRows(initEnabled);
    setRemarks(initRemarks);
  }, [leads]);

  const getAssignedUserName = (userId) => {
    const user = edata.find((e) => e._id === userId);
    return user ? user.name : "N/A";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return dateStr.slice(0, 10);
  };

  const getStatus = (status) => {
    return status && status.trim() !== "" ? status : "N/A";
  };

  const handleDelete = async (leadId) => {
    if (window.confirm("Are you sure to delete this lead?")) {
      console.log("Deleting lead with ID:", leadId);
      // Add delete logic here
    }
  };

  const openModal = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLead(null);
    setShowModal(false);
  };

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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manual Leads</h1>
        <button
          onClick={() => navigate("/admin-dashboard/mannual-leads/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Lead
        </button>
      </div>

      {/* Global remarks */}
      <div className="mb-4 flex gap-2 items-center flex-wrap">
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

      {loading && <p className="text-yellow-600">Loading leads...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Select</th>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Phone</th>
                <th className="py-2 px-4 border">City</th>
                <th className="py-2 px-4 border">Requirement</th>
                <th className="py-2 px-4 border">Assigned To</th>
                <th className="py-2 px-4 border">Assigned Date</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Tags</th>
                <th className="py-2 px-4 border">Remark </th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">
                    <input
                      type="checkbox"
                      checked={enabledRows[lead._id] || false}
                      onChange={() => toggleRow(lead._id)}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </td>
                  <td className="py-2 px-4 border capitalize">{lead.name}</td>
                  <td className="py-2 px-4 border">{lead.email}</td>
                  <td className="py-2 px-4 border">{lead.phone}</td>
                  <td className="py-2 px-4 border capitalize">{lead.city}</td>
                  <td className="py-2 px-4 border capitalize">{lead.requirement}</td>
                  <td className="py-2 px-4 border">{getAssignedUserName(lead.assignedTo)}</td>
                  <td className="py-2 px-4 border">{formatDate(lead.assignedDate)}</td>
                  <td className="py-2 px-4 border">{getStatus(lead.status)}</td>
                  <td className="py-2 px-4 border">{remarks[lead._id]?.remark1 || "-"}</td>
                  <td className="py-2 px-4 border">{remarks[lead._id]?.remark2 || "-"}</td>
                  <td className="py-1 px-2 flex items-center border space-x-2">
                    <button
                      onClick={() => navigate(`/admin-dashboard/mannual-leads/edit/${lead._id}`)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => openModal(lead)}
                      className="px-2 py-2 bg-blue-700 text-white rounded-md cursor-pointer font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <p className="text-gray-500">No leads found.</p>
      )}

      {/* Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Lead Details</h2>
            <ul className="space-y-2 text-sm">
              <li><strong>Name:</strong> {selectedLead.name}</li>
              <li><strong>Email:</strong> {selectedLead.email}</li>
              <li><strong>Phone:</strong> {selectedLead.phone}</li>
              <li><strong>City:</strong> {selectedLead.city}</li>
              <li><strong>Requirement:</strong> {selectedLead.requirement}</li>
              <li><strong>Assigned To:</strong> {getAssignedUserName(selectedLead.assignedTo)}</li>
              <li><strong>Assigned Date:</strong> {formatDate(selectedLead.assignedDate)}</li>
              <li><strong>Status:</strong> {getStatus(selectedLead.status)}</li>
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
