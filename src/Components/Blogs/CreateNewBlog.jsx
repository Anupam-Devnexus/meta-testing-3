import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Editor } from "primereact/editor";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function CreateNewBlog() {
    const [title, setTitle] = useState('');
      const [featuredImage, setFeaturedImage] = useState('');
      const [content, setContent] = useState('');

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("upload", file);

    const res = await fetch("https://backend.devnexussolutions.com/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) return data.url;
    else throw new Error("Failed to upload image");
  };

  const handleImagePaste = async (e) => {
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile();
        const url = await uploadImageToServer(file);

        const imgTag = `<img src="${url}" alt="image" style="max-width:100%;" />`;
        setContent((prev) => prev + imgTag);

        e.preventDefault();
        break;
      }
    }
  };


    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("featuredImage", featuredImage); // the raw File object
        formData.append("title", title);
        formData.append("blogContent", content);

        const response = await fetch("http://localhost:3000/api/create-blogs", {
            method: "POST",
            body: formData,
        });


        const result = await response.json();
        alert(result.message || 'Blog saved!');

        setTitle('');
        setFeaturedImage('');
        setContent('');
    };

  // // console.log("Pasted image detected:", file);
  // // console.log("Uploaded image URL:", url);
  // console.log("Uploading:", file);

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <h2>DevNexus Blogs</h2>
     {/* Featured Image Upload */}
      <label>Featured Image</label>
      <input
        type="file"
        accept="image/*"
        name='featuredImage'
        onChange={(e) => setFeaturedImage(e.target.files[0])}
        className="mb-4"
      />
      {featuredImage && (
  <img
    src={URL.createObjectURL(featuredImage)} // 👈 convert File to blob URL
    alt="Featured"
    className="mb-4 max-h-40 rounded"
  />
)}

      {/* Title Field */}
      <input
        type="text"
        placeholder="Enter blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <Editor
        value={content}
        onTextChange={(e) => setContent(e.htmlValue)}
        onPasteCapture={handleImagePaste}
        style={{ height: "320px" }}
      />
      <button
        onClick={handleSubmit}
        className="add-btn"
        style={{ marginTop: "1rem" }}
      >
        Save Blog
      </button>
    </div>
  );
}
