import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

export default function AllBlogs() {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    blogContent: "",
    featuredImage: null,
  });

  useEffect(() => {
    fetch(import.meta.env.VITE_BASE_URL + '/api/blogs')
      .then((res) => res.json())
      .then((data) => setBlogs(data))
      .catch((err) => console.error("Failed to load blogs", err));
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/delete/blogs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setBlogs((prev) => prev.filter((blog) => blog._id !== id));
        alert("Blog deleted successfully");
      } else {
        alert("Failed to delete blog.");
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
      alert("Error deleting blog");
    }
  };

  const handleEditClick = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      blogContent: blog.blogContent,
      featuredImage: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBlog) return;

    const form = new FormData();
    form.append("title", formData.title);
    form.append("blogContent", formData.blogContent);
    if (formData.featuredImage) {
      form.append("featuredImage", formData.featuredImage);
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/update/blogs/${editingBlog._id}`,
        {
          method: "PATCH",
          body: form,
        }
      );
      const data = await res.json();

      if (data.success) {
        alert("Blog updated successfully!");
        setEditingBlog(null);
        setBlogs((prev) =>
          prev.map((b) =>
            b._id === editingBlog._id ? { ...b, ...formData } : b
          )
        );
      } else {
        alert("Failed to update blog.");
      }
    } catch (err) {
      console.error("Error updating blog:", err);
      alert("Error updating blog");
    }
  };

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: "1200px", margin: "auto" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2.5rem",
          fontSize: "2rem",
          fontWeight: "600",
          color: "#222",
        }}
      >
        📝 DevNexus Blogs
      </h2>

      {blogs.length === 0 && (
        <p style={{ textAlign: "center" }}>No blogs yet.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
          alignItems: "stretch",
        }}
      >
        {blogs.map((blog) => (
          <div
            key={blog._id}
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e5e5",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {blog.featuredImage && (
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                />
              </div>
            )}

            <div
              style={{
                padding: "20px",
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  marginBottom: "10px",
                  color: "#111",
                  fontSize: "1.2rem",
                  lineHeight: "1.3",
                  fontWeight: "600",
                }}
              >
                {blog.title}
              </h3>

              <div
                style={{
                  fontSize: "0.95rem",
                  color: "#555",
                  lineHeight: "1.5",
                  maxHeight: "85px",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}
                dangerouslySetInnerHTML={{ __html: blog.blogContent }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={{ fontSize: "0.8rem", color: "#777" }}>
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => navigate('/update-blogs/' + blog._id)}
                    // onClick={() => handleEditClick(blog)}

                    style={{
                      background: "#1890ff",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    style={{
                      background: "#ff4d4f",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

     
    </div>
  );
}
