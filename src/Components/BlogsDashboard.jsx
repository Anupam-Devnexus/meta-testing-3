import React, { useState } from "react";
import TextEditor from "./TextEditor";

export default function BlogDashboard() {
  const [content, setContent] = useState("");

  const handleSave = () => {
    console.log("Content:", content); // Send this to API
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Post</h2>
      <TextEditor value={content} onChange={setContent} />
      <button
        onClick={handleSave}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}

<<<<<<< HEAD
import React, { useState } from "react";
import TextEditor from "./TextEditor";

export default function BlogDashboard() {
  const [content, setContent] = useState("");

  const handleSave = () => {
    console.log("Content:", content); // Send this to API
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Post</h2>
      <TextEditor value={content} onChange={setContent} />
      <button
        onClick={handleSave}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}
=======
import React, { useState } from "react";
import TextEditor from "./TextEditor";

export default function BlogDashboard() {
  const [content, setContent] = useState("");

  const handleSave = () => {
    console.log("Content:", content); // Send this to API
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Post</h2>
      <TextEditor value={content} onChange={setContent} />
      <button
        onClick={handleSave}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}
>>>>>>> 06b573bde6b3dd1f40cc020f320420a0d4ef3a9c
