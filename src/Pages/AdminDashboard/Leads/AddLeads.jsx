import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const statusOptions = ["new", "in progress", "converted", "closed"];

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Must be 10 digits")
    .required("Required"),
  city: Yup.string().required("Required"),
  budget: Yup.number().typeError("Must be a number").required("Required"),
  requirement: Yup.string().required("Required"),
  source: Yup.string().required("Required"),
  Campaign: Yup.string().required("Required"),
  status: Yup.string().required("Required"),
});

export default function AddLeads() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [formToSubmit, setFormToSubmit] = useState(null);

  const token = localStorage.getItem("userDetails");
  const details = token ? JSON.parse(token).token : null;

  const initialValues = {
    date: new Date().toISOString(),
    name: "",
    email: "",
    phone: "",
    city: "",
    budget: "",
    requirement: "",
    source: "",
    Campaign: "",
    status: "new",
    remarks1: "",
    remarks2: "",
    dynamicFields: [],
  };

  const handleFormSubmit = (values, { resetForm }) => {
    setFormToSubmit({ values, resetForm });
    setShowConfirm(true);
  };

  const confirmAndSubmit = async () => {
    if (!formToSubmit) return;
    const { values, resetForm } = formToSubmit;

    try {
      const response = await fetch(
        "https://dbbackend.devnexussolutions.com/auth/api/Add-leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${details}`,
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Lead submitted successfully!");
        resetForm();
        setFormToSubmit(null);
        setShowConfirm(false);
      } else {
        toast.error(data?.message || "❌ Submission failed.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("An error occurred during submission.");
    }
  };

  return (
    <section className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Add New Lead</h1>
        <button
          onClick={() => navigate("/admin-dashboard/upload-excel")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Upload Excel
        </button>
      </div>

      {/* Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                🧾 Lead Information
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[
                  { label: "Name", name: "name" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone", name: "phone" },
                  { label: "City", name: "city" },
                  { label: "Budget", name: "budget" },
                  { label: "Requirement", name: "requirement" },
                  { label: "Source", name: "source" },
                  { label: "Campaign", name: "Campaign" },
                ].map(({ label, name, type = "text" }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <Field
                      name={name}
                      type={type}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <ErrorMessage
                      name={name}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                💬 Remarks & Status
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks 1
                  </label>
                  <Field
                    name="remarks1"
                    placeholder="Enter first remark"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks 2
                  </label>
                  <Field
                    name="remarks2"
                    placeholder="Enter second remark"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                </div>
              </div>
            </div>

            {/* Dynamic Fields */}
            <FieldArray name="dynamicFields">
              {({ push, remove }) => (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                    ➕ Additional Fields
                  </h2>
                  <div className="space-y-4">
                    {values.dynamicFields.map((_, index) => (
                      <div
                        key={index}
                        className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-center"
                      >
                        <Field
                          name={`dynamicFields[${index}].label`}
                          placeholder="Label"
                          className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <Field
                          name={`dynamicFields[${index}].value`}
                          placeholder="Value"
                          className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => push({ label: "", value: "" })}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      + Add Field
                    </button>
                  </div>
                </div>
              )}
            </FieldArray>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#00357a] text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
            >
              {isSubmitting ? "Submitting..." : "Submit Lead"}
            </button>
          </Form>
        )}
      </Formik>

      {/* Toast */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Do you want to add more fields before submitting?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Yes, Add More
              </button>
              <button
                onClick={confirmAndSubmit}
                className="px-4 py-2 bg-[#00357a] text-white rounded-lg hover:bg-blue-700 transition"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
