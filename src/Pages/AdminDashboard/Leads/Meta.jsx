import { useEffect, useState } from "react";
import {
  FaRegEdit,
  FaSearch,
  FaTag,
  FaFilter,
  FaWhatsapp,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiCheck } from "react-icons/fi";
import { SiGmail } from "react-icons/si";
import axios from "axios";
import useMetaLeads from "../../../Zustand/MetaLeadsGet";
import metainsights from "../../../Zustand/MetaIns";
import useNewMetaLeads from "../../../Zustand/NewMetaLeads";
import { toast } from "react-toastify";
import { formatDateTime } from "@/Components/Tables/MannualTable";

// 🔹 field variations
const phoneFieldVariants = [
  "phone",
  "mobile",
  "contact_number",
  "PHONE_NUMBER",
  "number",
];
const emailFieldVariants = ["email", "EMAIL_ID", "contact_email", "mail"];

export default function Meta() {
  const { metaleads, fetchMetaLeads, loading, error } = useMetaLeads();
  const { fetchinsights } = metainsights();
  const { fetchNewMeta } = useNewMetaLeads();

  const [leads, setLeads] = useState([]);
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
  const [showGlobalRemarks, setShowGlobalRemarks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  // const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [editRemark1, setEditRemark1] = useState("");
  const [editRemark2, setEditRemark2] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const itemsPerPage = 10;
  const leadFields = ["created_time", "created_at"];

  const updateMetaLeadAPI = (id, payload) =>
    axios.put(`/auth/api/meta-leads/${id}`, payload);

  const deleteMetaLeadAPI = async (id) => {
    try {
      await axios.delete(
        import.meta.env.VITE_BASE_URL + `/auth/api/meta-leads/${id}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("User")).token}`,
          },
        },
      );
      toast.success("Entry deleted");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // 🔹 helper: detect key from field variations
  const getFieldKey = (allFields, variants) => {
    if (!allFields) return null;
    const keys = Object.keys(allFields);
    const lowerKeys = keys.map((k) => k.toLowerCase());
    for (let variant of variants) {
      const idx = lowerKeys.indexOf(variant.toLowerCase());
      if (idx !== -1) return keys[idx];
    }
    return null;
  };

  useEffect(() => {
    fetchMetaLeads();
    fetchinsights();
    fetchNewMeta();
  }, []);
  // console.log("metaleads",metaleads)
  useEffect(() => {
    if (metaleads?.leads) {
      setLeads(metaleads.leads);
      const initEnabled = {};
      const initRemarks = {};
      metaleads.leads.forEach((lead) => {
        initEnabled[lead._id] = false;
        initRemarks[lead._id] = { remark1: "", remark2: "" };
      });
      setEnabledRows(initEnabled);
      setRemarks(initRemarks);
    }
  }, [metaleads]);

  const isAnyRowSelected = Object.values(enabledRows).some(Boolean);

  const toggleRow = (id) =>
    setEnabledRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleRemark1Change = (value) => {
    if (value === "Other") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
    }
    setGlobalRemark1(value);
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

  const applyGlobalRemarks = async () => {
    if (!isAnyRowSelected) {
      alert("No row selected");
      return;
    }

    const updatedRemarks = { ...remarks };
    Object.keys(enabledRows)
      .filter((id) => enabledRows[id])
      .forEach((id) => {
        updatedRemarks[id] = { remark1: globalRemark1, remark2: globalRemark2 };
      });
    setRemarks(updatedRemarks);
    console.log(updatedRemarks);
    console.log(enabledRows);

    //     let payload = {
    //       remarks1,
    // remarks2
    //     }

    // try {
    //   const { data } = await axios.patch("http://localhost:3001/auth/api/meta-ads/" + id,)
    // } catch (error) {

    // }

    console.log(customRemark1, globalRemark1, globalRemark2);
  };

  // 🔹 build headers (normalize phone/email display)
  const allFieldKeys = leads[0]?.AllFields
    ? Object.keys(leads[0].AllFields)
    : [];
  const headers = [
    "Select",
    "ID",
    ...leadFields.map((f) =>
      f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
    ...allFieldKeys.map((k) => {
      if (phoneFieldVariants.includes(k.toLowerCase())) return "Phone Number";
      if (emailFieldVariants.includes(k.toLowerCase())) return "Email";
      return k.charAt(0).toUpperCase() + k.slice(1);
    }),
    "Tags",
    "Remark 1",
    "Remark 2",
    "Actions",
  ];

  // 🔹 filter + map rows
  const rows = leads
    .filter((lead) =>
      Object.values(lead.AllFields || {})
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .map((lead) => {
      const leadFieldValues = leadFields.map((f) => lead[f] || "-");
      const allFieldValues = allFieldKeys.map((k) => lead.AllFields[k] || "-");
      return [lead._id, ...leadFieldValues, ...allFieldValues];
    });

  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const currentRows = rows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // -----------------------------
  // Send WhatsApp
  const sendWhatsApp = () => {
    const selectedLeads = leads.filter((lead) => enabledRows[lead._id]);
    if (selectedLeads.length === 0) {
      alert("No row selected");
      return;
    }

    selectedLeads.forEach((lead) => {
      let phone = lead.phone || null;
      if (!phone) {
        const phoneKey = getFieldKey(lead.AllFields, phoneFieldVariants);
        if (phoneKey) phone = lead.AllFields[phoneKey];
      }
      if (!phone) return;

      const remark1 = remarks[lead._id]?.remark1 || globalRemark1;
      const remark2 = remarks[lead._id]?.remark2 || globalRemark2;

      const message = `Hello ${lead.name || "there"},\nRemark1: ${remark1}\nRemark2: ${remark2}`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });
  };

  // -----------------------------
  // Send Gmail
  const sendGmail = () => {
    const selectedLeads = leads.filter((lead) => enabledRows[lead._id]);
    if (selectedLeads.length === 0) {
      alert("No row selected");
      return;
    }

    selectedLeads.forEach((lead) => {
      let email = lead.email || null;
      if (!email) {
        const emailKey = getFieldKey(lead.AllFields, emailFieldVariants);
        if (emailKey) email = lead.AllFields[emailKey];
      }
      if (!email) return;

      const remark1 = remarks[lead._id]?.remark1 || globalRemark1;
      const remark2 = remarks[lead._id]?.remark2 || globalRemark2;
      const subject = "Lead Follow-up";
      const body = `Hello ${lead.name || "there"},\nRemark1: ${remark1}\nRemark2: ${remark2}\n\nBest Regards`;
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      window.open(url, "_blank");
    });
  };

  const handleDelete = async (id) => {
    // console.log(id)
    // return
    if (!confirm("Are you sure you want to delete this lead?")) return;

    // optimistic remove
    setLeads((prev) => prev.filter((l) => l._id !== id));

    setEnabledRows((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    setRemarks((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    try {
      await deleteMetaLeadAPI(id);
    } catch (err) {
      alert("Delete failed. Please refresh.");
    }
  };

  // const handleEdit = (id) => {
  //   setEditingLeadId(id);
  //   setEditRemark1(remarks[id]?.remark1 || "");
  //   setEditRemark2(remarks[id]?.remark2 || "");
  //   setEditModalOpen(true);
  // };

  // const saveEdit = async () => {
  //   if (!editingLeadId) return;

  //   const payload = {
  //     remark1: editRemark1,
  //     remark2: editRemark2,
  //   };

  //   // optimistic UI update
  //   setRemarks((prev) => ({
  //     ...prev,
  //     [editingLeadId]: payload,
  //   }));

  //   setLoadingAction(true);

  //   try {
  //     await updateMetaLeadAPI(editingLeadId, payload);
  //     setEditModalOpen(false);
  //   } catch (err) {
  //     alert("Failed to update lead");
  //   } finally {
  //     setLoadingAction(false);
  //   }
  // };

  if (loading || error) {
    return (
      <div className="text-center h-10">
        {(loading && "Loading...") || (error && error?.message)}
      </div>
    );
  }

  return (
    <section className="w-full bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <FaTag className="text-blue-500" /> Meta Leads ({metaleads?.total})
        </h1>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm w-60"
            />
          </div>
          {/* Filter */}
          <FaFilter
            className={`text-blue-600 text-lg cursor-pointer transition ${
              !isAnyRowSelected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() =>
              isAnyRowSelected && setShowGlobalRemarks((prev) => !prev)
            }
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
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-center mb-4">
          {/* Remark 1 dropdown */}
          <select
            value={globalRemark1}
            onChange={(e) => handleRemark1Change(e.target.value)}
            disabled={!isAnyRowSelected}
            className="px-4 py-2 border-b border-gray-300 text-sm disabled:opacity-50"
          >
            <option value="">Select Remark 1</option>
            {remarkOptions1.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Custom Remark Input */}
          {showCustomInput && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                disabled={!isAnyRowSelected}
                placeholder="Enter custom remark"
                value={customRemark1}
                onChange={(e) => setCustomRemark1(e.target.value)}
                className="px-4 py-2 border-b border-gray-300 text-sm outline-none flex-1"
              />
              {/* <button
                onClick={addCustomRemark}
                className="flex items-center gap-1 px-2 py-2 bg-green-600 text-white rounded-full shadow-sm hover:bg-green-700 transition"
              >
                <FiCheck />
              </button> */}
            </div>
          )}

          {/* Remark 2 */}
          <input
            type="text"
            disabled={!isAnyRowSelected}
            placeholder="Enter Remark 2"
            value={globalRemark2}
            onChange={(e) => setGlobalRemark2(e.target.value)}
            className="px-4 py-2 border-b border-gray-300 text-sm outline-none flex-1"
          />

          {/* Apply */}
          <button
            // disabled={!isAnyRowSelected}
            onClick={applyGlobalRemarks}
            className="flex items-center gap-2 px-2 py-2 bg-[#00357a] text-white rounded-full shadow-sm hover:bg-blue-700 transition"
          >
            <FiCheck className="text-lg" />
          </button>

          {/* WhatsApp & Gmail */}
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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md divide-y divide-gray-200">
          <thead className="bg-(--primary-light) text-white ">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold  uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="p-6 text-gray-400">
                  No leads found.
                </td>
              </tr>
            )}

            {currentRows.map((row) => {
              const id = row[0];
              return (
                <tr
                  key={id}
                  className={`transition-all duration-200 hover:shadow-sm ${
                    enabledRows[id] ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={enabledRows[id] || false}
                      onChange={() => toggleRow(id)}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </td>

                  {row.map((cell, idx) => (
                    <td
                      key={idx}
                      className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm"
                    >
                      {typeof cell === "string" && cell.includes("T")
                        ? formatDateTime(cell)
                        : cell}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {remarks[id]?.tag || "-"}
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {remarks[id]?.remark1 || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {remarks[id]?.remark2 || "-"}
                  </td>

                  <td className="px-4 py-3 flex items-center gap-2">
                    {/* <button
                      onClick={() => handleEdit(id)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
                    >
                      <FaRegEdit size={18} />
                    </button> */}

                    <button
                      onClick={() => handleDelete(id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-blue-50 disabled:opacity-50"
          >
            <IoIosArrowBack />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === i + 1
                  ? "bg-[#00357a] text-white shadow"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-blue-50 disabled:opacity-50"
          >
            <IoIosArrowForward />
          </button>
        </div>
      )}
      {/* {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-blue-700">
              Edit Lead Remarks
            </h2>

            <div className="space-y-3">
              <input
                value={editRemark1}
                onChange={(e) => setEditRemark1(e.target.value)}
                placeholder="Remark 1"
                className="w-full px-4 py-2 border rounded-lg text-sm outline-none"
              />

              <input
                value={editRemark2}
                onChange={(e) => setEditRemark2(e.target.value)}
                placeholder="Remark 2"
                className="w-full px-4 py-2 border rounded-lg text-sm outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border"
              >
                Cancel
              </button>

              <button
                disabled={loadingAction}
                onClick={saveEdit}
                className="px-4 py-2 text-sm rounded-lg bg-[#00357a] text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )} */}
    </section>
  );
}
