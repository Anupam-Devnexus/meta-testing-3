import { useEffect, useState } from "react";
import useContactStore from "../../../Zustand/Contact";
import { FaRegEdit, FaEye, FaWhatsapp } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { SiGmail } from "react-icons/si";

export default function Contact() {
  const { data, loading, error, fetchContacts } = useContactStore();

  // State
  const [submissions, setSubmissions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  // 🔹 field variations
  const phoneFieldVariants = ["phone", "mobile", "contact_number", "phone_number", "number", "PHONE"];
  const emailFieldVariants = ["email", "email_id", "contact_email", "mail"];

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  console.log(data)

  useEffect(() => {
    if (data?.submissions) {
      const enriched = data.submissions.map((sub) => {
        const phone = detectFieldValue(sub.field_data, phoneFieldVariants);
        const email = detectFieldValue(sub.field_data, emailFieldVariants);
        return {
          ...sub,
          detectedPhone: phone?.value || null,
          detectedPhoneProb: phone?.probability || 0,
          detectedEmail: email?.value || null,
          detectedEmailProb: email?.probability || 0,
        };
      });
      setSubmissions(enriched);
    }
  }, [data]);

  // 🔹 helper: detect field value with probability
  const detectFieldValue = (fieldData, variants) => {
    if (!Array.isArray(fieldData)) return null;

    // exact matches
    for (let variant of variants) {
      const found = fieldData.find(
        (f) => f.name?.toLowerCase() === variant.toLowerCase()
      );
      if (found && found.values?.[0]) {
        return { value: found.values[0], probability: 1.0, matched: variant };
      }
    }

    // partial matches
    for (let variant of variants) {
      const found = fieldData.find((f) =>
        f.name?.toLowerCase().includes(variant.toLowerCase())
      );
      if (found && found.values?.[0]) {
        return { value: found.values[0], probability: 0.7, matched: variant };
      }
    }

    return null;
  };

  // 🔹 Actions
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setSubmissions((prev) => prev.filter((item) => item.id !== deleteId && item._id !== deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleEditClick = (id) => {
    const submission = submissions.find((item) => item.id === id || item._id === id);
    setEditData(submission);
    setShowEditModal(true);
  };

  const saveEdit = () => {
    setSubmissions((prev) =>
      prev.map((item) => (item.id === editData.id || item._id === editData._id ? editData : item))
    );
    setShowEditModal(false);
    setEditData(null);
  };

  const handleViewClick = (id) => {
    const submission = submissions.find((item) => item.id === id || item._id === id);
    setViewData(submission);
    setShowViewModal(true);
  };

  // Dynamically get table headers (include detected phone/email)
  const tableHeaders =
    submissions.length > 0
      ? [...new Set([...Object.keys(submissions[0]), "detectedPhone", "detectedEmail"])]
      : [];

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Submissions</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && submissions.length === 0 && <p>No submissions found.</p>}

      {submissions.length > 0 && (
        <div className="overflow-x-auto border rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id || submission._id}>
                  {tableHeaders.map((field) => (
                    <td key={field} className="px-4 py-2 text-sm text-gray-800">
                      {String(submission[field] ?? "")}
                    </td>
                  ))}

                  <td className="px-4 py-2 flex gap-3 text-gray-700">
                    {/* WhatsApp */}
                    {submission.detectedPhone && (
                      <a
                        href={`https://wa.me/${submission.detectedPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-600"
                        title={`WhatsApp (confidence: ${(submission.detectedPhoneProb * 100).toFixed(0)}%)`}
                      >
                        <FaWhatsapp />
                      </a>
                    )}

                    {/* Gmail */}
                    {submission.detectedEmail && (
                      <a
                        href={`mailto:${submission.detectedEmail}`}
                        className="hover:text-red-600"
                        title={`Send Email (confidence: ${(submission.detectedEmailProb * 100).toFixed(0)}%)`}
                      >
                        <SiGmail />
                      </a>
                    )}

                    {/* View */}
                    <button
                      onClick={() => handleViewClick(submission.id || submission._id)}
                      aria-label="View submission"
                      className="hover:text-blue-600"
                    >
                      <FaEye />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEditClick(submission.id || submission._id)}
                      aria-label="Edit submission"
                      className="hover:text-green-600"
                    >
                      <FaRegEdit />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteClick(submission.id || submission._id)}
                      aria-label="Delete submission"
                      className="hover:text-red-600"
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this submission?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Submission</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
              className="space-y-4"
            >
              {tableHeaders.map((field) => (
                <div key={field}>
                  <label
                    htmlFor={`edit-${field}`}
                    className="block text-sm font-medium text-gray-700 mb-1 select-none"
                  >
                    {field}
                  </label>
                  <input
                    id={`edit-${field}`}
                    type="text"
                    value={editData[field] || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="block w-full rounded border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={field === "id" || field === "_id"}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">View Submission</h2>
            <div className="space-y-2">
              {Object.entries(viewData).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> <span>{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
