import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useLeadStore from "../../../Zustand/LeadsGet";
import useUserStore from "../../../Zustand/UsersGet";
import MannualTable from "../../../Components/Tables/MannualTable";

// Icons
import { FaFilter, FaWhatsapp } from "react-icons/fa";


export default function ManualLeads() {
  const { data, loading, error, fetchData } = useLeadStore();
  const { users, fetchUser } = useUserStore();
  const navigate = useNavigate();

  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showGlobalRemarks, setShowGlobalRemarks] = useState(false);



  // --- Fetch data
  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const leads = data?.leads || [];
  const usersData = users?.users || [];

  console.log(leads , usersData)


  // --- Initialize remarks state when leads change
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

  // --- Helpers
  const isAnyRowSelected = useMemo(
    () => Object.values(enabledRows).some(Boolean),
    [enabledRows]
  );

 
 

  

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
            className={`text-blue-600 cursor-pointer ${
              !isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => isAnyRowSelected && setShowGlobalRemarks((p) => !p)}
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


      {/* Patch Table */}
      <MannualTable leads={leads} patchApi="https://dbbackend.devnexussolutions.com/user/leads" />
    </div>
  );
}
