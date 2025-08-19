import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import "react-resizable/css/styles.css";
import { useNavigate } from "react-router-dom";
import useMetaLeads from "../../../Zustand/MetaLeadsGet";
import metainsights from "../../../Zustand/MetaIns";
import useNewMetaLeads from "../../../Zustand/NewMetaLeads"

export default function Meta() {
  const { metaleads, error, loading, fetchMetaLeads } = useMetaLeads();
  const { fetchinsights, merror, mloading, data } = metainsights()
  const { fetchNewMeta, newleadsdata } = useNewMetaLeads()
  const [leads, setLeads] = useState([]);
  const [mleads, setMleads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const navigate = useNavigate();

  const itemsPerPage = 10;
  const leadFields = ["created_time", "created_at"];

  // Fetch leads on component mount
  useEffect(() => {
    fetchMetaLeads();
    fetchinsights();
    fetchNewMeta();
  }, []);

  // Sync leads from global state
  useEffect(() => {
    if (metaleads?.leads) {
      setLeads(metaleads.leads);
    }
    if (!merror) {
      setMleads(data)
    }
  }, [metaleads]);
  console.log(data.data)


  // Extract keys for dynamic AllFields columns safely
  const allFieldKeys = leads[0]?.AllFields ? Object.keys(leads[0].AllFields) : [];

  // Format headers
  const leadFieldHeaders = leadFields.map(
    (field) => field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );

  const allFieldHeaders = allFieldKeys.map(
    (key) => key.charAt(0).toUpperCase() + key.slice(1)
  );

  const headers = ["ID", ...leadFieldHeaders, ...allFieldHeaders, "Actions"];

  // Prepare rows for current page
  const rows = leads.map((lead) => {
    const id = lead._id;
    const leadFieldValues = leadFields.map((field) => lead[field] || "-");
    const allFieldValues = allFieldKeys.map((key) => lead.AllFields[key] || "-");
    return [id, ...leadFieldValues, ...allFieldValues];
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = rows.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  // Delete handlers
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setLeads((prev) => prev.filter((lead) => lead._id !== deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Edit handlers
  const handleEditClick = (id) => {
    const leadToEdit = leads.find((lead) => lead._id === id);
    setEditData({ ...leadToEdit });
    setShowEditModal(true);
  };

  const handleEditChange = (e, field, type = "root") => {
    const value = e.target.value;
    setEditData((prev) => {
      if (type === "root") {
        return { ...prev, [field]: value };
      } else if (type === "AllFields") {
        return {
          ...prev,
          AllFields: {
            ...prev.AllFields,
            [field]: value,
          },
        };
      }
      return prev;
    });
  };

  const saveEdit = () => {
    setLeads((prev) =>
      prev.map((lead) => (lead._id === editData._id ? editData : lead))
    );
    setShowEditModal(false);
    setEditData(null);
  };

  // InsightsCard.jsx
  const InsightsCard = ({ name, data }) => {
    return (
      <div className="flex items-center gap-4 justify-between p-3 bg-blue-400 text-white font-bold rounded-md">
        <span>{name}</span>
        <span>{data ? data : 21}</span>
      </div>
    );
  };

  console.log(newleadsdata)
  const NewMetaDataCard = ({ message, totalFetched, totalNew, savedLeadIds = [] }) => {
    return (
      <div className="max-w-full mx-auto mb-3 bg-white rounded-lg shadow-md p-3 border border-gray-200">
        <div className="flex items-center p-3 justify-between">

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Meta Leads Summary</h2>

          {message && (
            <p className="mb-4 text-gray-600 italic border-l-4 border-blue-400 pl-3">
              {message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-100 rounded-md p-4">
            <p className="text-3xl font-bold text-blue-700">{totalFetched ?? 0}</p>
            <p className="text-sm text-blue-600 mt-1">Total Fetched</p>
          </div>

          <div className="bg-green-100 rounded-md p-4">
            <p className="text-3xl font-bold text-green-700">{totalNew ?? 0}</p>
            <p className="text-sm text-green-600 mt-1">New Leads</p>
          </div>

          <div className="bg-purple-100 rounded-md p-4 col-span-2">
            <p className="text-3xl font-bold text-purple-700">{savedLeadIds.length}</p>
            <p className="text-sm text-purple-600 mt-1">Saved Leads</p>
          </div>
        </div>
      </div>
    );
  };


  const insight = data?.data?.[0];
  console.log("insight", insight)

  return (
    <section className="w-full bg-gray-50 min-h-screen p-6 ">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Meta Leads</h1>

        {insight && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <InsightsCard name="Clicks" data={insight.clicks} />
            <InsightsCard name="Impressions" data={insight.impressions} />
            <InsightsCard name="Spend" data={insight.spend} />
            <InsightsCard name="Start Date" data={insight.date_start} />
            <InsightsCard name="End Date" data={insight.date_stop} />
          </div>
        )}
      </header>

      <NewMetaDataCard
        message={newleadsdata.message}
        totalFetched={newleadsdata.totalFetched}
        totalNew={newleadsdata.totalNew}
      />


      {/* Loading/Error */}
      {loading && (
        <p className="text-center text-blue-600 font-medium my-4">Loading data...</p>
      )}
      {error && (
        <p className="text-center text-red-600 font-medium my-4">
          Error loading data: {error.message || error}
        </p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="py-6 text-center text-gray-400">
                  No leads found.
                </td>
              </tr>
            )}
            {currentRows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 transition-colors duration-150 cursor-default"
              >
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm"
                  >
                    {cell}
                  </td>
                ))}

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-4">
                  <button
                    onClick={() => handleEditClick(row[0])}
                    aria-label="Edit lead"
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaRegEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row[0])}
                    aria-label="Delete lead"
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-6 flex justify-center space-x-2"
          aria-label="Pagination"
        >
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === i + 1
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-blue-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this lead? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-blue-700 mb-6">Edit Lead</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
              className="space-y-4"
            >
              {/* Root fields */}
              {leadFields.map((field, i) => (
                <div key={i}>
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-700 mb-1 select-none"
                  >
                    {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                  <input
                    id={field}
                    type="text"
                    value={editData[field] || ""}
                    onChange={(e) => handleEditChange(e, field, "root")}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              ))}

              {/* AllFields dynamic */}
              {allFieldKeys.map((key, i) => (
                <div key={i}>
                  <label
                    htmlFor={`allfields-${key}`}
                    className="block text-sm font-medium text-gray-700 mb-1 select-none"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    id={`allfields-${key}`}
                    type="text"
                    value={editData.AllFields?.[key] || ""}
                    onChange={(e) => handleEditChange(e, key, "AllFields")}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
