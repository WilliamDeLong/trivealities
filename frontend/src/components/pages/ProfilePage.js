import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profileUrl, setProfileUrl] = useState("/user-icon.png"); // default fallback
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  // Your server.js mounts profileImageUpload at "/"
  // So endpoints are:
  // GET  http://localhost:8081/users/:id
  // POST http://localhost:8081/users/:id/profile-image
  const API_BASE = "http://localhost:8081";

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  useEffect(() => {
    const u = getUserInfo();
    setUser(u);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/${u.id}`);
        if (!res.ok) {
          console.log("GET profile failed:", res.status, await res.text());
          return;
        }
        const data = await res.json();

        const url = data?.user?.profileImage?.imageUrl;
        if (url) setProfileUrl(url);
      } catch (err) {
        console.error("GET profile error:", err);
      }
    };

    if (u?.id) fetchProfile();
  }, []);

  const uploadProfileImage = async () => {
    try {
      setStatus("");

      console.log("Selected file:", selectedFile);
      if (!selectedFile || !user?.id) {
        setStatus("No file selected.");
        return;
      }

      // IMPORTANT: key must be "image" to match upload.single("image") on backend
      const formData = new FormData();
      formData.append("image", selectedFile);

      // IMPORTANT: do NOT set Content-Type header manually for FormData
      const res = await fetch(`${API_BASE}/user/${user.id}/profile-image`, {
         method: "POST", 
         body: formData 
        });

      console.log("UPLOAD STATUS:", res.status);

      // Read as text first so you can see errors even if JSON parsing fails
      const bodyText = await res.text();
      console.log("UPLOAD BODY:", bodyText);

      let data;
      try {
        data = JSON.parse(bodyText);
      } catch {
        data = null;
      }

      if (!res.ok) {
        setStatus((data && data.message) || "Upload failed (see console).");
        return;
      }

      const newUrl = data?.user?.profileImage?.imageUrl;
      if (newUrl) setProfileUrl(newUrl);

      setSelectedFile(null);
      setStatus("Profile image updated!");
      setUploadSuccess(true);
    } catch (err) {
      console.error("UPLOAD error:", err);
      setUploadSuccess(false);
      setStatus("Upload failed (see console).");
    }
  };

  if (!user) {
    return (
      <div>
        <h4>Log in to view this page.</h4>
      </div>
    );
  }

  const { id, email, username } = user;

  return (
    <>
      <div className="card-container">
        <div className="card">
          <h3>Welcome</h3>

          <img
            src={profileUrl}
            alt="Profile"
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: 10,
            }}
            onError={() => setProfileUrl("/user-icon.png")}
          />

          <p className="username">{username}</p>

          <div style={{ marginTop: 12 }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {setSelectedFile(e.target.files?.[0] || null); setUploadSuccess(false);}}
            />
            <button
              onClick={uploadProfileImage}
              disabled={!selectedFile}
              style={{
                marginTop: 10,
                marginLeft: 8,
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontWeight: "bold",
                cursor: !selectedFile ? "not-allowed" : "pointer",
                backgroundColor: !selectedFile
                  ? "#22c55e"
                  : uploadSuccess
                  ? "#22c55e"
                  : "#ef4444",
                transition: "background-color 0.3s ease, transform 0.2s ease",
              }}
            >
              {uploadSuccess ? "Upload Successful" : "Upload New Profile Image"}
            </button>
          </div>

          {status && <p style={{ marginTop: 10 }}>{status}</p>}
        </div>

        <div className="card">
          <h3>Your userId in MongoDB is</h3>
          <p className="userId">{id}</p>
        </div>

        <div className="card">
          <h3>Your email is</h3>
          <p className="email">{email}</p>
        </div>
      </div>

      <button onClick={handleLogout}>Log Out</button>
    </>
  );
};

export default ProfilePage;