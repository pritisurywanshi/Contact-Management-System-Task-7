import { useState } from "react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage("");
    setProgress(0);
    setFileUrl("");
  };

  const handleUpload = (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("jwt_token");
    console.log("JWT Token:", token);

    const xhr = new XMLHttpRequest();

    setLoading(true);
    setMessage("");
    setProgress(0);
    setFileUrl("");

    // Upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round(
          (event.loaded / event.total) * 100
        );

        setProgress(percent);
      }
    });

    // Upload completed
    xhr.addEventListener("load", async () => {
      setLoading(false);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);

          setMessage("File uploaded and email sent successfully!");

          // Get file ID returned by backend
          const fileId = data.id;

          // Get 15-minute presigned URL
          const urlResponse = await fetch(
            `http://localhost:8080/files/${fileId}/url`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (urlResponse.ok) {
            const urlData = await urlResponse.json();

            setFileUrl(urlData.url);
          }

          setFile(null);

        } catch (error) {
          setMessage("File uploaded successfully.");
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);

          setMessage(
            errorData.error ||
            errorData ||
            "File upload failed."
          );
        } catch {
          setMessage("File upload failed.");
        }
      }
    });

    // Connection error
    xhr.addEventListener("error", () => {
      setLoading(false);
      setMessage("Server connection failed.");
    });

    // Send request
    xhr.open(
      "POST",
      "http://localhost:8080/files/upload"
    );

    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${token}`
    );

    xhr.send(formData);
  };


 return (
  <div className="file-upload-page">

    <div className="file-upload-card">

      <div className="file-upload-header">
        <div className="file-upload-icon">📁</div>
        <h2>File Upload</h2>
        <p>Upload your JPG, PNG or PDF files</p>
      </div>

      <form onSubmit={handleUpload} className="file-upload-form">

        <label className="file-upload-label">
          Select File
        </label>

        <input
          className="file-upload-input"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
        />

        {file && (
          <div className="selected-file">
            <span>📄</span>

            <div>
              <span className="selected-file-label">
                Selected File
              </span>

              <b>{file.name}</b>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="file-upload-button"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

      </form>

      {/* Progress */}
      {loading && (
        <div className="file-upload-progress">

          <div className="progress-header">
            <span>Uploading file...</span>
            <strong>{progress}%</strong>
          </div>

          <progress
            value={progress}
            max="100"
            className="progress-bar"
          />

        </div>
      )}

      {/* Message */}
      {message && (
        <div className="file-upload-message">
          {message}
        </div>
      )}

      {/* Uploaded file link */}
            {fileUrl && (
        <div className="uploaded-file-success">

          <div className="success-icon">✓</div>

          <p>File uploaded successfully!</p>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-file-button"
          >
            View Uploaded File
          </a>

        </div>
      )}

    </div>

  </div>
);
}

export default FileUpload;