import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useManualLeadsStore } from "../../Zustand/MannualLeads";
import { toast } from "react-toastify";
import axios from "axios";

const SalesFunnel = () => {
  const { leads, fetchLeads } = useManualLeadsStore();

  /* Funnel mode */
  const [mode, setMode] = useState(localStorage.getItem("db-fm") || "api");
  /* Custom funnel state */
  const [customStages, setCustomStages] = useState([]);
  const [stageName, setStageName] = useState("");
  const [stageValue, setStageValue] = useState("");

  const [loading, setLoading] = useState(false);

  /* Fetch leads once */
  useEffect(() => {
    fetchLeads();
    mode == 'custom' && enableCustomFunnel()

  }, [fetchLeads]);

  /* ---------------- API Funnel (STATUS BASED) ---------------- */
  const apiStages = useMemo(() => {
    if (!Array.isArray(leads) || leads.length === 0) return [];

    const countByStatus = (status) =>
      leads.filter(l => l.status === status).length;

    return [
      { name: "Total", value: leads?.length },
      { name: "New", value: countByStatus("new") },
      { name: "In Progress", value: countByStatus("in progress") },
      { name: "Converted", value: countByStatus("converted") },
      { name: "Closed", value: countByStatus("closed") },
    ];
  }, [leads]);

  /* Decide which funnel to show */
  const stages =
    mode === "custom" && customStages.length > 0
      ? customStages
      : apiStages;

  const maxValue = Math.max(...stages.map(s => s.value), 1);

  /* ---------------- Handlers ---------------- */
  const addStage = useCallback(async () => {
    if (!stageName.trim() || !stageValue.trim()) return;

    setLoading(true)

    const payload = {
      stageName,
      stageValue: Number(stageValue),
    };

    const token = JSON.parse(localStorage.getItem("User")).token

    try {
      // API call
      const { data } = await axios.post(
        import.meta.env.VITE_BASE_URL + "/auth/api/add-custom-lead",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI only after success
      setCustomStages((prev) => [...prev, data.data]);
      toast.success(data.message)

      // Reset inputs
      setStageName("");
      setStageValue("");
    } catch (error) {
      console.error(error);
      // show toast / error UI here
      toast.error(error.message)
    } finally {
      setLoading(false)

    }
  }, [stageName, stageValue]);

  const enableCustomFunnel = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("User")).token
      const { data } = await axios.get(import.meta.env.VITE_BASE_URL + '/auth/api/get-custom-lead', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log(data)

      setCustomStages(data.data);
      localStorage.setItem("db-fm", "custom")

      setMode("custom");
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  };

  const switchToApiFunnel = () => {
    setCustomStages([]);
    localStorage.setItem("db-fm", "api")
    setMode("api");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {mode === "custom" ? "Custom Sales Funnel" : "Sales Funnel"}
        </h2>

        {mode === "api" ? (
          <button
            onClick={enableCustomFunnel}
            className="px-4 py-2 bg-[#00357a] text-white rounded hover:bg-blue-700"
          >
            Create Custom Funnel
          </button>
        ) : (
          <button
            onClick={switchToApiFunnel}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Use API Funnel
          </button>
        )}
      </div>

      {/* Funnel View */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const width = (stage.value / maxValue) * 100;
          return (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium text-gray-700">
                {stage.name}
              </span>

              <div className="relative flex-1 bg-gray-200 h-10 rounded-md">
                <div
                  className="h-10 bg-blue-600 rounded-md transition-all duration-500"
                  style={{ width: `${width}%` }}
                />
                <span className="absolute right-3 top-2 text-white text-sm font-semibold">
                  {stage.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Funnel Builder */}
      {mode === "custom" && (
        <div className="border-t pt-5 space-y-4">
          <h3 className="font-semibold">Add Custom Stages</h3>

          <div className="flex gap-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Stage Name"
              value={stageName}
              onChange={e => setStageName(e.target.value)}
            />
            <input
              type="number"
              className="border p-2 rounded w-32"
              placeholder="Value"
              min={0}
              value={stageValue}
              onChange={e => setStageValue(e.target.value)}
            />
            <button
              onClick={addStage}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {loading ? 'Adding' : 'Add'}
            </button>
          </div>

          {/* {customStages.length > 0 && (
            <ul className="text-sm text-gray-600 list-disc pl-5">
              {customStages.map((s, i) => (
                <li key={i}>
                  {s.name} — {s.value}
                </li>
              ))}
            </ul>
          )} */}
        </div>
      )}
    </div>
  );
};

export default SalesFunnel;
