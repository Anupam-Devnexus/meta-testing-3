import { useEffect, useState } from "react";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function UpdateBlog() {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [img, setImg] = useState(null);
    const [content, setContent] = useState("");
    const [preview, setpreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);



    useEffect(() => {
        const fetchBlog = async () => {
            setIsLoading(true);
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/blogs/${id}`);
            const data = await res.json();

            setImg(data.featuredImage);
            setTitle(data.title);
            setContent(data.blogContent);
            setpreview(data.featuredImage);

            setIsLoading(false);
        };

        fetchBlog();
    }, [id]);

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"]
        ]
    }), []);


    if (isLoading) {
        return <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>;
    }

    if (isError) {
        return;
    }

    const handleSubmit = async () => {
        setIsPending(true);
        const formData = new FormData();
        formData.append("featuredImage", img);
        formData.append("title", title);
        formData.append("blogContent", content);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/update/blogs/${id}`,
                {
                    method: "PATCH",
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.success) {
                toast.success("Blog updated successfully");
                setTitle('')
                setImg('')
                setContent('')
                setpreview('')
            } else {
                toast.error("Failed to update blog");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error updating blog");
        } finally {
            setIsPending(false);
        }
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files[0].type.split("/")[0] !== "image") {
            toast.error("Please select a valid image file");
            e.target.value = null;

            return;
        }
        setImg(e.target.files[0]);
        setpreview(URL.createObjectURL(files[0]));
    };


    return (
        <div className="card p-[2rem]">
            <div className="flex items-center border-b justify-between  pb-2 ">
                <h1 className="text-2xl font-semibold text-gray-800">Update Blogs</h1>
            </div>

            <div className="flex my-3 ">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Image
                </label>
                <input
                    type="file"
                    disabled={isPending}
                    name="img"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-lg p-1 cursor-pointer file:cursor-pointer  text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    required
                />
            </div>
            {preview && (
                <img src={preview} alt="Featured" className="mb-4 max-h-40 rounded" />
            )}

            {/* Title */}
            <input
                type="text"
                disabled={isPending}
                // maxLength={100}
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300  rounded mb-4"
            />

            {/* Editor */}
            <ReactQuill
                readOnly={isPending}
                value={content}
                onChange={setContent}
                modules={modules}
                style={{ height: "400px", marginBottom: "2rem" }}
            />

            <button
                onClick={handleSubmit}
                disabled={isPending}
                style={{
                    cursor: isPending ? "not-allowed" : "pointer",
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition mt-4"
            >
                {isPending ? "Updating..." : "Update Blog"}
            </button>
        </div>
    );
}

export default UpdateBlog;
