import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function DynamicTable({ headers = [], keys = [], data = [], onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="text-left px-4 py-2 border-b font-semibold text-gray-700 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
            <th className="text-left px-4 py-2 border-b font-semibold text-gray-700 whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length + 1}
                className="px-4 py-4 text-center text-gray-500"
              >
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition">
                {keys.map((key, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 border-b text-sm text-gray-800 whitespace-nowrap"
                  >
                    {row[key] ?? "-"}
                  </td>
                ))}
                <td className="px-4 py-2 border-b flex gap-2">
                  <button
                    onClick={() => onEdit?.(row)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => onDelete?.(row)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
