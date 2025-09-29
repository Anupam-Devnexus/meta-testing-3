import { useEffect } from "react";
import useLeadStore from "../../../Zustand/LeadsGet";
import DynamicDataTable from "../../../Components/Tables/DynamicDataTable";
import MannualTable from "../../../Components/Tables/MannualTable";

export default function ManualLeads() {
  const { data, loading, error, fetchData } = useLeadStore();
  const { users, fetchUser } = useUserStore();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Global remarks states
  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showGlobalRemarks, setShowGlobalRemarks] = useState(false);
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
  }, []);

  const leads = data?.leads || [];
  const usersData = users?.users || [];

  // Initialize enabledRows and remarks when leads change
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

  const isAnyRowSelected = Object.values(enabledRows).some(Boolean);

  const getAssignedUserName = (userId) => {
    const user = usersData.find((e) => e._id === userId);
    return user ? user.name : "N/A";
  };

  const formatDate = (dateStr) => (dateStr ? dateStr.slice(0, 10) : "N/A");

  const getStatus = (status) => (status && status.trim() ? status : "N/A");

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

  const openModal = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLead(null);
    setShowModal(false);
  };

  const handleDelete = (leadId) => {
    if (window.confirm("Are you sure to delete this lead?")) {
      console.log("Deleting lead:", leadId);
      // Add delete logic
    }
  };

  // inside MannualLeads()

// -----------------------------
// Send WhatsApp message
const sendWhatsApp = () => {
  const selected = leads.filter((lead) => enabledRows[lead._id]);
  if (selected.length === 0) return;

  selected.forEach((lead) => {
    const phone = lead.phone;
    if (!phone) return;
    const message = encodeURIComponent(
      `Hello ${lead.name},\n\nRemark 1: ${remarks[lead._id]?.remark1 || globalRemark1}\nRemark 2: ${remarks[lead._id]?.remark2 || globalRemark2}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  });
};

// -----------------------------
// Send Gmail
const sendGmail = () => {
  const selected = leads.filter((lead) => enabledRows[lead._id]);
  if (selected.length === 0) return;

  selected.forEach((lead) => {
    const email = lead.email;
    if (!email) return;
    const subject = encodeURIComponent("Lead Follow-up");
    const body = encodeURIComponent(
      `Hi ${lead.name},\n\nWe wanted to follow up regarding your requirement.\n\nRemark 1: ${remarks[lead._id]?.remark1 || globalRemark1}\nRemark 2: ${remarks[lead._id]?.remark2 || globalRemark2}\n\nThanks,\nYour Company`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, "_blank");
  });
};


  const api = "https://dbbackend.devnexussolutions.com/user/leads"
  console.log("Leads Data:", leads)
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          
          Manual Leads
        </h1>
        <div className="flex items-center gap-3">

        <button
          onClick={() => navigate("/admin-dashboard/mannual-leads/add")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition"
        >
          <FiPlus className="text-lg" /> Add Lead
        </button>
        <FaFilter
            className={`text-blue-600 cursor-pointer transition ${
              !isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => isAnyRowSelected && setShowGlobalRemarks((prev) => !prev)}
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
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-center">
          {/* Remark 1 dropdown */}
          <div className="flex items-center gap-2 relative">
            <select
              value={globalRemark1}
              onChange={(e) => handleRemark1Change(e.target.value)}
              disabled={!isAnyRowSelected}
              className="px-4 py-2 border-b border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Remark 1</option>
              {remarkOptions1.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {!isAnyRowSelected && (
              <span className="absolute -top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-80">
                Select a row to enable
              </span>
            )}
          </div>

          {/* Custom Remark Input */}
          {showCustomInput && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter custom remark"
                value={customRemark1}
                onChange={(e) => setCustomRemark1(e.target.value)}
                disabled={!isAnyRowSelected}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={addCustomRemark}
                disabled={!isAnyRowSelected}
                className="flex items-center gap-1 px-2 py-2 bg-green-600 text-white rounded-full shadow-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                <FiCheck />
              </button>
            </div>
          )}

          {/* Remark 2 input */}
          <input
            type="text"
            placeholder="Enter Remark 2"
            value={globalRemark2}
            onChange={(e) => setGlobalRemark2(e.target.value)}
            disabled={!isAnyRowSelected}
            className="px-4 py-2 border-b border-gray-300 text-sm outline-none flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Apply button */}
          <button
            onClick={applyGlobalRemarks}
            disabled={!isAnyRowSelected}
            className="flex items-center gap-2 px-2 py-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            <FiCheck className="text-lg" />
          </button>
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
    <div className="p-4">
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
                <th className="py-2 px-4 border">Remark 1</th>
                <th className="py-2 px-4 border">Remark 2</th>
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
        <MannualTable
          leads={leads}
          patchApi={api}
        />
      )}

      {!loading && !error && leads.length === 0 && (
        <p className="text-gray-500">No leads found.</p>
      )}
    </div>
  );
}
