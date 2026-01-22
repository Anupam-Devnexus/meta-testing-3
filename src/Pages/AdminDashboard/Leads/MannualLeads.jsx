import { useEffect, useState, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import MannualTable from "../../../Components/Tables/MannualTable";
import { useManualLeadsStore } from "../../../Zustand/MannualLeads";

// Icons
import { FaFilter } from "react-icons/fa";

// --- Reducer for managing remarks efficiently
const remarksReducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return action.payload; // initialize all rows
    case "UPDATE":
      return { ...state, [action.id]: { ...state[action.id], ...action.data } };
    case "APPLY_GLOBAL":
      const updated = { ...state };
      action.ids.forEach((id) => {
        updated[id] = { remark1: action.remark1, remark2: action.remark2 };
      });
      return updated;
    default:
      return state;
  }
};

export default function ManualLeads() {
  const navigate = useNavigate();

  // --- Zustand store
  const { leads, loading, error, fetchLeads } = useManualLeadsStore();

  // --- Local state
  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, dispatchRemarks] = useReducer(remarksReducer, {});
  const [showGlobalRemarks, setShowGlobalRemarks] = useState(false);

  // --- Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);
  console.log("Mannual leads Page", leads)
  // --- Initialize enabledRows & remarks when leads change
  useEffect(() => {
    const initEnabled = {};
    const initRemarks = {};
    leads.forEach((lead) => {
      initEnabled[lead._id] = false;
      initRemarks[lead._id] = { remark1: lead.remarks1 || "", remark2: lead.remarks2 || "" };
    });
    setEnabledRows(initEnabled);
    dispatchRemarks({ type: "INIT", payload: initRemarks });
  }, [leads]);

  // --- Check if any row is selected
  const isAnyRowSelected = useMemo(
    () => Object.values(enabledRows).some(Boolean),
    [enabledRows]
  );

  // --- Submit changes
  const submitChanges = async () => {
    const updates = Object.keys(enabledRows)
      .filter((id) => enabledRows[id])
      .map((id) => ({ _id: id, ...remarks[id] }));

    if (!updates.length) return alert("No rows selected!");

    try {
      const token = JSON.parse(localStorage.getItem("UserDetails"))?.token;
      await fetch(`${"https://dbbackend.devnexussolutions.com/user/leads"}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ updates }),
      });
      alert("Remarks updated ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update remarks ❌");
    }
  };



  {/* Loading/Error */ }
  if (loading) return <p className="text-gray-500 text-center ">Loading leads...</p>
  if (error) return <p className="text-red-600 text-center">{error?.message}</p>

  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manual Leads</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin-dashboard/mannual-leads/add")}
            className="bg-[#00357a] text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Add Lead
          </button>
        </div>
      </div>




      {/* Table */}
      <MannualTable
        leads={leads}
        patchApi="http://localhost:3001/user/leads"
        enabledRows={enabledRows}
        setEnabledRows={setEnabledRows}
        remarks={remarks}
        dispatchRemarks={dispatchRemarks}
        showGlobalRemarks={showGlobalRemarks}
      />

      {/* Submit button */}
      {isAnyRowSelected && (
        <div className="flex justify-end">
          <button
            onClick={submitChanges}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
