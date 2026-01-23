import { useEffect, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import MannualTable from "../../../Components/Tables/MannualTable";
import { useManualLeadsStore } from "../../../Zustand/MannualLeads";

// Icons

const remarksReducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return action.payload;

    case "UPDATE":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      };

    default:
      return state;
  }
};

export default function ManualLeads() {
  const navigate = useNavigate();

  const {
    leads,
    loading: loadingLeads,
    error,
    fetchLeads,
  } = useManualLeadsStore();

  const [enabledRows, setEnabledRows] = useState({});
  const [remarks, dispatchRemarks] = useReducer(remarksReducer, {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  // init row state when leads arrive
  useEffect(() => {
    const initEnabled = {};
    const initRemarks = {};

    leads.forEach((lead) => {
      initEnabled[lead._id] = false;
      initRemarks[lead._id] = {
        remarks1: lead.remarks1 || "",
        remarks2: lead.remarks2 || "",
      };
    });

    setEnabledRows(initEnabled);
    dispatchRemarks({ type: "INIT", payload: initRemarks });
  }, [leads]);

  const submitChanges = async () => {
    const selectedIds = Object.keys(enabledRows).filter(
      (id) => enabledRows[id],
    );

    if (!selectedIds.length) return alert("No rows selected!");

    const updates = selectedIds.map((id) => ({
      _id: id,
      ...remarks[id],
    }));

    setSaving(true);

    try {
      const token = JSON.parse(localStorage.getItem("UserDetails"))?.token;

      const res = await fetch(
        "https://dbbackend.devnexussolutions.com/user/leads",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ updates }),
        },
      );

      if (!res.ok) throw new Error("Patch failed");

      alert("Remarks updated ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update remarks ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loadingLeads)
    return <p className="text-gray-500 text-center">Loading leads...</p>;

  if (error)
    return <p className="text-red-600 text-center">{error?.message}</p>;

  return (
    <div className="p-3 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manual Leads</h1>

        <button
          onClick={() => navigate("/admin-dashboard/mannual-leads/add")}
          className="bg-[#00357a] text-white px-4 py-2 rounded"
        >
          Add Lead
        </button>
      </div>

      <MannualTable
        leads={leads}
        enabledRows={enabledRows}
        setEnabledRows={setEnabledRows}
        remarks={remarks}
        dispatchRemarks={dispatchRemarks}
        loading={saving}
        submitChanges={submitChanges}
      />
    </div>
  );
}
