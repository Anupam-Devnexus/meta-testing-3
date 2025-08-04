import { useEffect, useState } from "react";
import useContactStore from "../../../Zustand/Contact";
import { FaRegEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function Contact() {
    const { data, loading, error, fetchContacts } = useContactStore();

    // State for modals and editing
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewData, setViewData] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    // Handle Delete
    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        // For now, we only remove locally (you should also call API to delete on backend)
        if (!data?.submissions) return;
        data.submissions = data.submissions.filter((item) => item.id !== deleteId);
        setShowDeleteModal(false);
        setDeleteId(null);
        // Trigger re-render by fetching or state update if needed
    };

    // Handle Edit
    const handleEditClick = (id) => {
        if (!data?.submissions) return;
        const submission = data.submissions.find((item) => item.id === id);
        setEditData(submission);
        setShowEditModal(true);
    };

    const saveEdit = () => {
        // Update submission locally (you should update backend here)
        if (!data?.submissions) return;
        data.submissions = data.submissions.map((item) =>
            item.id === editData.id ? editData : item
        );
        setShowEditModal(false);
        setEditData(null);
    };

    // Handle View
    const handleViewClick = (id) => {
        if (!data?.submissions) return;
        const submission = data.submissions.find((item) => item.id === id);
        setViewData(submission);
        setShowViewModal(true);
    };

    // If data.submissions is undefined or empty, show no data
    const submissions = data?.submissions || [];

    // Dynamically get table headers from keys of first submission (if exists)
    const tableHeaders = submissions.length > 0 ? Object.keys(submissions[0]) : [];

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
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {submissions.map((submission) => (
                                <tr key={submission.id || submission._id}>
                                    {tableHeaders.map((field) => (
                                        <td key={field} className="px-4 py-2 text-sm text-gray-800">
                                            {String(submission[field])}
                                        </td>
                                    ))}

                                    <td className="px-4 py-2 flex gap-3 text-gray-700">
                                        <button
                                            onClick={() => handleViewClick(submission.id || submission._id)}
                                            aria-label="View submission"
                                            className="hover:text-blue-600"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(submission.id || submission._id)}
                                            aria-label="Edit submission"
                                            className="hover:text-green-600"
                                        >
                                            <FaRegEdit />
                                        </button>
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

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">
                            Confirm Delete
                        </h2>
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

            {/* Edit Modal */}
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
                                        disabled={field === "id" || field === "_id"} // optionally disable editing id
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

            {/* View Modal */}
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
