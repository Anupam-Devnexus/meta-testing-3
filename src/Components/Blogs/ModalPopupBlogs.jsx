import React, { useEffect, useState } from "react";
import { Editor } from "primereact/editor";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function ModalPopupBlog({ blog, onClose, onUpdate }) {
  const [title, setTitle] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [content, setContent] = useState("");
  const [editorKey, setEditorKey] = useState(0);


  // ✅ Prefill existing blog data when editing
  useEffect(() => {
    console.log(blog, 'update blogs');
    
    if (blog) {
      setTitle(blog.title || "");
      setContent(blog?.blogContent || "");
      setPreviewImage(blog.featuredImage || "");
    }
  }, [blog]);

  useEffect(() => {
    if (blog) {
      setContent(blog.blogContent || "");
      setEditorKey((k) => k + 1); // 🔥 force remount
    }
  }, [blog]);


  // ✅ Upload pasted images
  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("upload", file);
    const res = await fetch(
      "https://backend.devnexussolutions.com/api/upload-image",
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (data.url) return data.url;
    throw new Error("Failed to upload image");
  };

  const handleImagePaste = async (e) => {
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile();
        const url = await uploadImageToServer(file);
        setContent((prev) => prev + `<img src="${url}" style="max-width:100%;" />`);
        e.preventDefault();
        break;
      }
    }
  };

  // ✅ Submit handler for create or update
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("blogContent", content);
    if (featuredImage) formData.append("featuredImage", featuredImage);

    const endpoint = blog
      ? `https://backend.devnexussolutions.com/api/update/blogs/${blog._id}`
      : "https://backend.devnexussolutions.com/api/create-blogs";

    const method = blog ? "PATCH" : "POST";

    const response = await fetch(endpoint, { method, body: formData });
    const result = await response.json();

    if (result.success) {
      alert(blog ? "Blog updated successfully!" : "Blog created successfully!");
      onUpdate?.({
        ...blog,
        title,
        blogContent: content,
        featuredImage: featuredImage
          ? URL.createObjectURL(featuredImage)
          : previewImage,
      });
      onClose();
    } else {
      alert("Failed to save blog");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "2rem",
          width: "90%",
          maxWidth: "1300px",
          height: "600px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>
          {blog ? "Edit Blog" : "Add New Blog"}
        </h3>

        {/* Featured Image */}
        <label>Featured Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setFeaturedImage(file);
            setPreviewImage(URL.createObjectURL(file));
          }}
        />

        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "200px",
              marginTop: "10px",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        )}

        {/* Title */}
        <input
          type="text"
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <div
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            minHeight: "150px",
          }}
          dangerouslySetInnerHTML={{ __html: blog?.blogContent }}
        />

        {/* ✅ Rich text editor prefilled with HTML content */}
        <Editor
          key={editorKey}
          value={content}
          onTextChange={(e) => setContent(e.htmlValue)}
          onPasteCapture={handleImagePaste}
          style={{ height: "320px", marginTop: "1rem" }}
          placeholder="Write blog content here..."
        />


        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1.5rem",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#aaa",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              background: "#1890ff",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {blog ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
