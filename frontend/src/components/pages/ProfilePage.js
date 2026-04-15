import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import API_BASE from "../../api";
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profileUrl, setProfileUrl] = useState("/user-icon.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [status, setStatus] = useState("");

  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");

  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState("");

  const navigate = useNavigate();

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    localStorage.removeItem("accessToken");
    navigate("/");
  };

useEffect(() => {
  const u = getUserInfo();

  if (!u?.id) {
    setUser(null);
    return;
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/user/${u.id}`);
      if (!res.ok) {
        console.log("GET profile failed:", res.status, await res.text());
        setUser(u);
        return;
      }

      const data = await res.json();
      const fetchedUser = data?.user;

      if (fetchedUser) {
        setUser({
          ...u,
          ...fetchedUser,
        });

        const url = fetchedUser?.profileImage?.imageUrl;
        if (url) setProfileUrl(url);
      } else {
        setUser(u);
      }
    } catch (err) {
      console.error("GET profile error:", err);
      setUser(u);
    }
  };

  fetchProfile();
}, []);

  const uploadProfileImage = async () => {
    try {
      setStatus("");

      if (!selectedFile || !user?.id) {
        setStatus("No file selected.");
        return;
      }

      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch(`${API_BASE}/user/${user.id}/profile-image`, {
        method: "POST",
        body: formData,
      });

      const bodyText = await res.text();
      let data;

      try {
        data = JSON.parse(bodyText);
      } catch {
        data = null;
      }

      if (!res.ok) {
        setStatus((data && data.message) || "Upload failed.");
        return;
      }

      const newUrl = data?.user?.profileImage?.imageUrl;
      if (newUrl) setProfileUrl(newUrl);

      setSelectedFile(null);
      setUploadSuccess(true);
      setStatus("Profile image updated!");
    } catch (err) {
      console.error("UPLOAD error:", err);
      setUploadSuccess(false);
      setStatus("Upload failed.");
    }
  };

  const updatePassword = async () => {
    try {
      setPasswordStatus("");

      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordStatus("All password fields are required.");
        return;
      }

      const res = await fetch(`${API_BASE}/user/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordStatus(data.message || "Password update failed.");
        return;
      }

      setPasswordStatus("Password updated successfully. Logging out...");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        handleLogout();
      }, 1500);
    } catch (err) {
      console.error("PASSWORD UPDATE ERROR:", err);
      setPasswordStatus("Password update failed.");
    }
  };

  const deleteAccount = async () => {
    try {
      setDeleteStatus("");

      if (!deletePassword) {
        setDeleteStatus("Password is required.");
        return;
      }

      if (!confirmDelete) {
        setDeleteStatus("Please confirm account deletion.");
        return;
      }

      const res = await fetch(`${API_BASE}/user/${user.id}/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteStatus(data.message || "Account deletion failed.");
        return;
      }

      setDeleteStatus("Account deleted successfully. Logging out...");

      setTimeout(() => {
        handleLogout();
      }, 1500);
    } catch (err) {
      console.error("DELETE ACCOUNT ERROR:", err);
      setDeleteStatus("Account deletion failed.");
    }
  };

  const togglePasswordDropdown = () => {
    setShowPasswordDropdown((prev) => !prev);
    setShowDeleteDropdown(false);
    setDeleteStatus("");
    setDeletePassword("");
    setConfirmDelete(false);
  };

  const toggleDeleteDropdown = () => {
    setShowDeleteDropdown((prev) => !prev);
    setShowPasswordDropdown(false);
    setPasswordStatus("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const dropdownTriggerStyle = {
    width: "100%",
    maxWidth: "320px",
    margin: "0 auto",
    padding: "12px 16px",
    borderRadius: "999px",
    border: "2px solid #a78bfa",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const dropdownLeftStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
    color: "#222",
  };

  const dropdownDotStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    display: "inline-block",
  };

  const dropdownPanelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
    marginTop: 12,
  };

  if (!user) {
    return (
      <div>
        <h4>Log in to view this page.</h4>
      </div>
    );
  }

  const { id, email, username,  accountLevel, accountXp} = user;

  return (
    <>
      <div className="card-container">
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            <p>Welcome back,</p>
          </div>

          <h2 className="username" style={{ color: "#00d0ff" }}>
            {username}
          </h2>

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

          <div style={{ marginTop: 12 }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setUploadSuccess(false);
              }}
            />

            {selectedFile && (
              <button
                onClick={uploadProfileImage}
                style={{
                  marginTop: 10,
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  backgroundColor: "#22c55e",
                  transition: "background-color 0.3s ease, transform 0.2s ease",
                }}
              >
                {uploadSuccess ? "Upload Successful" : "Upload New Profile Image"}
              </button>
            )}
          </div>

          {status && <p style={{ marginTop: 10 }}>{status}</p>}

          <div className="card">
            <p style={{ fontWeight: "bold" }}>Profile details:</p>
            <p className="username">Username: {username}</p>
            <p className="userId">User ID: {id}</p>
            <p className="email">Email: {email}</p>
          </div>

          <div className="card">
            <p className="label">Account Level:</p>

            <p className="accountLevel">Level: {accountLevel}</p>

            <div className="xp-bar-container">
              <div
                className="xp-bar-fill"
                style={{ width: `${Math.min(accountXp, 100)}%` }}
              ></div>
            </div>

            <p className="accountXp">XP: {accountXp} / 100</p>
          </div>
        
          <div style={{ width: "100%", marginTop: 15 }}>
            <button onClick={togglePasswordDropdown} style={dropdownTriggerStyle}>
              <span style={dropdownLeftStyle}>
                <span style={dropdownDotStyle}></span>
                {showPasswordDropdown ? "Hide Password Update" : "Update Password"}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#555",
                  transform: showPasswordDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                ▼
              </span>
            </button>

            {showPasswordDropdown && (
              <div style={dropdownPanelStyle}>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "250px",
                  }}
                />

                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "250px",
                  }}
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "250px",
                  }}
                />

                <button
                  onClick={updatePassword}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 14px",
                    borderRadius: "8px",
                  }}
                >
                  Update Password
                </button>

                {passwordStatus && <p style={{ marginTop: 5 }}>{passwordStatus}</p>}
              </div>
            )}
          </div>

          <div style={{ width: "100%", marginTop: 15 }}>
            <button onClick={toggleDeleteDropdown} style={dropdownTriggerStyle}>
              <span style={dropdownLeftStyle}>
                <span style={dropdownDotStyle}></span>
                {showDeleteDropdown ? "Hide Delete Account" : "Delete Account"}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#555",
                  transform: showDeleteDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                
              </span>
            </button>

            {showDeleteDropdown && (
              <div style={dropdownPanelStyle}>
                <input
                  type="password"
                  placeholder="Enter password to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "250px",
                  }}
                />

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                  />
                  I understand this action cannot be undone
                </label>

                <button
                  onClick={deleteAccount}
                  style={{
                    backgroundColor: "#b91c1c",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 14px",
                    borderRadius: "8px",
                  }}
                >
                  Confirm Delete Account
                </button>

                {deleteStatus && <p style={{ marginTop: 5 }}>{deleteStatus}</p>}
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              cursor: "pointer",
              margin: "10px",
              padding: "5px 15px",
              borderRadius: "8px",
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;