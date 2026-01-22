import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Editor } from "primereact/editor";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function CreateNewBlog() {
  const [title, setTitle] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true)
    const formData = new FormData();
    formData.append("featuredImage", featuredImage); // the raw File object
    formData.append("title", title);
    formData.append("blogContent", content);
    formData.append("keywords", keywords);
    try {

      const response = await fetch("http://localhost:3002/api/create-blogs", { // https://backend.devnexussolutions.com/api/create-blogs
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      alert(result.message || 'Blog saved!');

      setTitle('');
      setFeaturedImage('');
      setContent('');
      setKeywords('');
    } catch (error) {
      console.log(error)
      alert(error.message)
    } finally {
      setLoading(false)

    }



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
        disabled={loading}
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
        disabled={loading}
        type="text"
        placeholder="Enter blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <Editor
        disabled={loading}

        value={content}
        onTextChange={(e) => setContent(e.htmlValue)}
        onPasteCapture={handleImagePaste}
        style={{ height: "320px" }}
      />

      <textarea
        disabled={loading}

        placeholder="Enter blog Keywords"
        value={keywords}
        maxLength={580}
        rows={4}
        onChange={(e) => setKeywords(e.target.value)}
        className="w-full resize-none p-3 border rounded my-4"
      />

      <button
        disabled={loading}

        onClick={handleSubmit}
        className="add-btn mt-1 border p-3 bg-gray-100 "

      >
        {loading ? "Saving" : 'Save Blog'}
      </button>
    </div>
  );
}

