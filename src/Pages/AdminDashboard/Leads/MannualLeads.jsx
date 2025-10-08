import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MannualTable from "../../../Components/Tables/MannualTable";
import { useManualLeadsStore } from "../../../Zustand/MannualLeads";
import DynamicDataTable from "../../../Components/Tables/DynamicDataTable";

// Icons
import { FaFilter } from "react-icons/fa";

export default function ManualLeads() {
  const navigate = useNavigate();

  // Use your manual leads store
  const { leads, loading, error, fetchLeads } = useManualLeadsStore();

  // Local state for table interactions
  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showGlobalRemarks, setShowGlobalRemarks] = useState(false);

  // --- Fetch manual leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // --- Initialize enabledRows and remarks when leads change
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

  // --- Helper to check if any row is selected
  const isAnyRowSelected = useMemo(
    () => Object.values(enabledRows).some(Boolean),
    [enabledRows]
  );
console.log("Leads data:", leads);
  // --- Render
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Manual Leads</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin-dashboard/mannual-leads/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700"
          >
            Add Lead
          </button>
          <FaFilter
            className={`text-blue-600 ${
              !isAnyRowSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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

      {/* Loading/Error states */}
      {loading && <p>Loading leads...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Table */}
      <MannualTable
        leads={leads}
        patchApi="https://dbbackend.devnexussolutions.com/user/leads"
        enabledRows={enabledRows}
        setEnabledRows={setEnabledRows}
        remarks={remarks}
        setRemarks={setRemarks}
        showGlobalRemarks={showGlobalRemarks}
      />
    </div>
  );
}
