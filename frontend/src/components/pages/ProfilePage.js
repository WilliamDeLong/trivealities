import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import API_BASE from "../../api";
import axios from "axios";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(getUserInfo());
  const [error, setError] = useState("");

  const [singlePlayerLevel, setSinglePlayerLevel] = useState(0);
  const [singlePlayerXp, setSinglePlayerXp] = useState(0);
  const [multiplayerLevel, setMultiplayerLevel] = useState(0);
  const [multiplayerXp, setMultiplayerXp] = useState(0);

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

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const fetchUserProfile = async () => {
    const tokenUser = getUserInfo();

    if (!tokenUser?.id) {
      setUser(null);
      return;
    }

    try {
      const result = await axios.get(`${API_BASE}/user/${tokenUser.id}`);
      const fetchedUser = result.data.user || result.data;

      setUser({
        ...tokenUser,
        ...fetchedUser,
      });

      setSinglePlayerLevel(fetchedUser.accountLevel || 0);
      setSinglePlayerXp(fetchedUser.accountXp || 0);
      setMultiplayerLevel(fetchedUser.multiplayerLevel || 0);
      setMultiplayerXp(fetchedUser.multiplayerXp || 0);

      const imageUrl = fetchedUser?.profileImage?.imageUrl;
      if (imageUrl) setProfileUrl(imageUrl);
    } catch (error) {
      console.error("GET profile error:", error);
      setUser(tokenUser);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
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
        setStatus(data?.message || "Upload failed.");
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

  const XpCard = ({ title, level, xp }) => (
    <div className="card">
      <p className="label">{title}</p>
      <p className="accountLevel">Level: {level}</p>

      <div className="xp-bar-container">
        <div
          className="xp-bar-fill"
          style={{ width: `${Math.min(xp, 100)}%` }}
        ></div>
      </div>

      <p className="accountXp">XP: {xp} / 100</p>
    </div>
  );

  if (!user) {
    return (
      <div>
        <h4>Log in to view this page.</h4>
      </div>
    );
  }

  const { id, email, username } = user;

  return (
    <div className="card-container">
      <div className="card" style={mainCardStyle}>
        <div style={{ fontWeight: "bold" }}>
          <p>Welcome back,</p>
        </div>

        <h2 className="username" style={{ color: "#00d0ff" }}>
          {username}
        </h2>

        <img
          src={profileUrl}
          alt="Profile"
          style={profileImageStyle}
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
            <button onClick={uploadProfileImage} style={uploadButtonStyle}>
              {uploadSuccess ? "Upload Successful" : "Upload New Profile Image"}
            </button>
          )}
        </div>

        {status && <p style={{ marginTop: 10 }}>{status}</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <div className="card">
          <p style={{ fontWeight: "bold" }}>Profile details:</p>
          <p className="username">Username: {username}</p>
          <p className="userId">User ID: {id}</p>
          <p className="email">Email: {email}</p>
        </div>

        <XpCard
          title="Single Player XP:"
          level={singlePlayerLevel}
          xp={singlePlayerXp}
        />

        <XpCard
          title="Multiplayer XP:"
          level={multiplayerLevel}
          xp={multiplayerXp}
        />

        <div style={{ width: "100%", marginTop: 15 }}>
          <button onClick={togglePasswordDropdown} style={dropdownTriggerStyle}>
            <span style={dropdownLeftStyle}>
              <span style={dropdownDotStyle}></span>
              {showPasswordDropdown ? "Hide Password Update" : "Update Password"}
            </span>
            <span style={dropdownArrowStyle(showPasswordDropdown)}>▼</span>
          </button>

          {showPasswordDropdown && (
            <div style={dropdownPanelStyle}>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />

              <button onClick={updatePassword} style={updatePasswordButtonStyle}>
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
          </button>

          {showDeleteDropdown && (
            <div style={dropdownPanelStyle}>
              <input
                type="password"
                placeholder="Enter password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={inputStyle}
              />

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                />
                I understand this action cannot be undone
              </label>

              <button onClick={deleteAccount} style={deleteButtonStyle}>
                Confirm Delete Account
              </button>

              {deleteStatus && <p style={{ marginTop: 5 }}>{deleteStatus}</p>}
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={logoutButtonStyle}>
          Log Out
        </button>
      </div>
    </div>
  );
};

const mainCardStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

const profileImageStyle = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 10,
};

const uploadButtonStyle = {
  marginTop: 10,
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  backgroundColor: "#22c55e",
  transition: "background-color 0.3s ease, transform 0.2s ease",
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

const dropdownArrowStyle = (isOpen) => ({
  fontSize: "16px",
  color: "#555",
  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease",
});

const inputStyle = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "250px",
};

const updatePasswordButtonStyle = {
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  cursor: "pointer",
  padding: "8px 14px",
  borderRadius: "8px",
};

const deleteButtonStyle = {
  backgroundColor: "#b91c1c",
  color: "white",
  border: "none",
  cursor: "pointer",
  padding: "8px 14px",
  borderRadius: "8px",
};

const logoutButtonStyle = {
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  cursor: "pointer",
  margin: "10px",
  padding: "5px 15px",
  borderRadius: "8px",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

export default ProfilePage;