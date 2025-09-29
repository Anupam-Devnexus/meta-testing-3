import React, { useEffect, useMemo } from "react";
import useCaleads from "../../../Zustand/Caleads";
import DynamicDataTable from "../../../Components/Tables/DynamicDataTable";

const Caleads = () => {
  const { data, loading, error, fetchCaleads } = useCaleads();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(
          "https://dbbackend.devnexussolutions.com/all-leads-via-webhook",
          { credentials: "include" }
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const json = await response.json();
        const leads = json?.leads || [];

        const allFieldsSet = new Set();

        const transformed = leads.map((item, idx) => {
          const fieldMap = {};
          (item.field_data || []).forEach((f) => {
            const cleanName = f.name.replace(/_/g, " ").replace(/\?$/, "");
            allFieldsSet.add(cleanName);
            fieldMap[cleanName] = f.values?.join(", ") || "N/A";
          });

          return {
            id: item._id || `#LEAD${idx + 1}`,
            createdDate: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-IN")
              : "N/A",
            dueDate: "20-10-2023",
            price: "₹0.00",
            status: "Due",
            image: `https://randomuser.me/api/portraits/${
              idx % 2 ? "men" : "women"
            }/${idx + 1}.jpg`,
            fields: fieldMap,
          };
        });

        setData(transformed);
        setUniqueFields(Array.from(allFieldsSet));

        // Initialize remarks and enabledRows
        const initEnabled = {};
        const initRemarks = {};
        transformed.forEach((lead) => {
          initEnabled[lead.id] = false;
          initRemarks[lead.id] = { remark1: "", remark2: "" };
        });
        setEnabledRows(initEnabled);
        setRemarks(initRemarks);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching leads.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);
  console.log(data)

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
    setRemarkOptions1((prev) => [
      customRemark1,
      ...prev.filter((opt) => opt !== "Other"),
      "Other",
    ]);
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg overflow-x-auto space-y-4">
      {/* Global remarks */}
      <div className="flex gap-2 items-center flex-wrap">
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

      <table className="min-w-full table-auto text-sm text-left">
        <thead className="text-gray-700 bg-gray-100 uppercase text-sm">
          <tr>
            <th className="px-4 py-3">Select</th>
            <th className="px-4 py-3">Image</th>
            {uniqueFields.map((field, i) => (
              <th key={i} className="px-4 py-3">
                {field}
              </th>
            ))}
            <th className="px-4 py-3">Created Date</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3">Remark 2</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 divide-y">
          {data.map((item, idx) => (
            <tr key={idx}>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={enabledRows[item.id] || false}
                  onChange={() => toggleRow(item.id)}
                  className="w-5 h-5 accent-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <img
                  src={item.image}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>
              {uniqueFields.map((field, i) => (
                <td key={i} className="px-4 py-3">
                  {item.fields[field] || "N/A"}
                </td>
              ))}
              <td className="px-4 py-3">{item.createdDate}</td>
              <td className="px-4 py-3">{item.dueDate}</td>
              <td className="px-4 py-3 font-medium">{item.price}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    statusColor[item.status] || "text-gray-600 bg-gray-100"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.status === "Paid"
                        ? "bg-green-500"
                        : item.status === "Due"
                        ? "bg-yellow-500"
                        : item.status === "Canceled"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3">{remarks[item.id]?.remark1 || "-"}</td>
              <td className="px-4 py-3">{remarks[item.id]?.remark2 || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Caleads;
