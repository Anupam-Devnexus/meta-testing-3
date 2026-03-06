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

  const token = JSON.parse(localStorage.getItem("UserDetails"))?.token;

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

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const response = await fetch(
        "https://dbbackend.devnexussolutions.com/auth/api/Add-leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Submission failed");
      }

      toast.success("Lead submitted successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
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

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {/* Lead Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                🧾 Lead Information
              </h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[
                  { label: "Name", name: "name" },
                  { label: "Email", name: "email" },
                  { label: "Phone", name: "phone" },
                  { label: "City", name: "city" },
                  { label: "Budget", name: "budget" },
                  { label: "Requirement", name: "requirement" },
                  { label: "Source", name: "source" },
                  { label: "Campaign", name: "Campaign" },
                ].map(({ label, name }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">
                      {label}
                    </label>

                    <Field
                      name={name}
                      className="w-full border rounded-lg p-2.5"
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
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                💬 Remarks & Status
              </h2>

              <div className="grid sm:grid-cols-3 gap-5">
                <Field
                  name="remarks1"
                  placeholder="Remark 1"
                  className="input"
                />
                <Field
                  name="remarks2"
                  placeholder="Remark 2"
                  className="input"
                />

                <Field as="select" name="status" className="input">
                  {statusOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Field>
              </div>
            </div>

            {/* Dynamic Fields */}
            <FieldArray name="dynamicFields">
              {({ push, remove }) => (
                <div>
                  <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                    ➕ Additional Fields
                  </h2>

                  {values.dynamicFields.map((_, index) => (
                    <div key={index} className="grid sm:grid-cols-3 gap-4 mb-3">
                      <Field
                        name={`dynamicFields.${index}.label`}
                        placeholder="Label"
                        className="input"
                      />

                      <Field
                        name={`dynamicFields.${index}.value`}
                        placeholder="Value"
                        className="input"
                      />

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => push({ label: "", value: "" })}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    + Add Field
                  </button>
                </div>
              )}
            </FieldArray>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#00357a] text-white rounded-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Lead"}
            </button>
          </Form>
        )}
      </Formik>

      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
}
