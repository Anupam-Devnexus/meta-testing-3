<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 390aa61 (mukti changes in UI)
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function BlogsPage({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder="Write something..."
      style={{ background: "white", borderRadius: "8px" }}
    />
  );
}
<<<<<<< HEAD
=======
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function BlogsPage({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder="Write something..."
      style={{ background: "white", borderRadius: "8px" }}
    />
  );
}
>>>>>>> 06b573bde6b3dd1f40cc020f320420a0d4ef3a9c
=======
>>>>>>> 390aa61 (mukti changes in UI)
