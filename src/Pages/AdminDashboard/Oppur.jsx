import React, { useState, useEffect } from "react";
import useLeadStore from "../../Zustand/LeadsGet";
import { X } from "lucide-react";

export const Oppur = () => {
  const { data, loading, error, fetchData } = useLeadStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null); // For modal

  useEffect(() => {
    fetchData();
  }, []);

  const leads = data?.leads || [];

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  const remarkColors = {
    new: "bg-blue-100 text-blue-700 border border-blue-300",
    "appointment scheduled":
      "bg-purple-100 text-purple-700 border border-purple-300",
    called: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    "hot leads": "bg-red-100 text-red-700 border border-red-300",
    converted: "bg-green-100 text-green-700 border border-green-300",
    other: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handlePageSizeChange = (e) => {
    setLeadsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  console.log(currentLeads)
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4">
        Opportunities (Leads from Social Media Ads)
      </h2>

      <div className="overflow-x-auto shadow-md">
        <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-[var(--primary-color)] text-white">
            <tr>
              <th className="px-4 py-3">SR No</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              {/* <th className="px-4 py-3">Phone</th> */}
              <th className="px-4 py-3">Campaign Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3 text-center">Extra Fields</th>

            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead, index) => (
              <tr key={lead._id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  {(indexOfFirstLead + index + 1).toString().padStart(2, "0")}
                </td>
                <td className="px-4 py-3">{lead.name || "—"}</td>
                <td className="px-4 py-3">{lead.email || "—"}</td>
                {/* <td className="px-4 py-3">{lead.phone || "—"}</td> */}
                <td className="px-4 py-3">{lead?.campaign_name || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${remarkColors[lead.status?.toLowerCase()] ||
                      remarkColors["other"]
                      }`}
                  >
                    {lead.status || "Other"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    defaultValue={lead.remarks1 || ""}
                    className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="text-[var(--primary-color)] border border-[var(--primary-color)] px-3 py-1 rounded-md text-sm hover:bg-[var(--primary-color)] hover:text-white transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {currentLeads.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {leads.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md border ${currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[var(--primary-color)] text-white hover:bg-opacity-90"
                }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md border ${currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[var(--primary-color)] text-white hover:bg-opacity-90"
                }`}
            >
              Next
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <select
              value={leadsPerPage}
              onChange={handlePageSizeChange}
              className="border px-2 py-1 rounded-md text-sm"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* ✅ Modal for Viewing Extra Fields */}
      {selectedLead && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[500px] p-6 relative">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4">
              Question Answer of {selectedLead.name || "Lead"}
            </h3>
            <div className="space-y-2 overflow-y-auto">
              {selectedLead.field_data?.length > 0 ? (
                selectedLead.field_data.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
                  >
                    <span className="font-medium text-gray-800">{f.name}:</span>
                    <span className="text-gray-600 ml-2">
                      {f.values?.[0] || "—"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 italic text-center">
                  No extra fields
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
