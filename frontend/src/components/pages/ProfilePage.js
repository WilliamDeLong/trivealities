import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import API_BASE from "../../api";
import axios from "axios";
import { UserContext } from "../../App";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isLightMode } = useContext(UserContext);

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
    <div className="card" style={innerCardStyle(isLightMode)}>
      <p className="label" style={{ fontWeight: "bold", color: isLightMode ? "#111827" : "#ffffff" }}>
        {title}
      </p>
      <p className="accountLevel" style={{ color: isLightMode ? "#111827" : "#ffffff" }}>
        Level: {level}
      </p>

      <div style={xpBarContainerStyle(isLightMode)}>
        <div
          className="xp-bar-fill"
          style={{ ...xpBarFillStyle, width: `${Math.min(xp, 100)}%` }}
        ></div>
      </div>

      <p className="accountXp" style={{ color: isLightMode ? "#111827" : "#ffffff" }}>
        XP: {xp} / 100
      </p>
    </div>
  );

  if (!user) {
    return (
      <div style={profilePageBackgroundStyle(isLightMode)}>
        <h4 style={{ color: isLightMode ? "#111827" : "#ffffff" }}>
          Log in to view this page.
        </h4>
      </div>
    );
  }

  const { id, email, username } = user;

  return (
    <div style={profilePageBackgroundStyle(isLightMode)}>
      <div className="card-container" style={profileContainerStyle}>
        <div className="card" style={mainCardStyle(isLightMode)}>
          <div style={{ fontWeight: "bold", color: isLightMode ? "#111827" : "#ffffff" }}>
            <p>Welcome back,</p>
          </div>

          <h2
            className="username"
            style={{ color: isLightMode ? "#7c3aed" : "#00d0ff" }}
          >
            {username}
          </h2>

          <img
            src={profileUrl}
            alt="Profile"
            style={profileImageStyle(isLightMode)}
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
              style={{ color: isLightMode ? "#111827" : "#ffffff" }}
            />

            {selectedFile && (
              <button onClick={uploadProfileImage} style={uploadButtonStyle}>
                {uploadSuccess ? "Upload Successful" : "Upload New Profile Image"}
              </button>
            )}
          </div>

          {status && (
            <p style={{ marginTop: 10, color: isLightMode ? "#111827" : "#ffffff" }}>
              {status}
            </p>
          )}
          {error && <p style={{ color: "#f87171" }}>{error}</p>}

          <div className="card" style={innerCardStyle(isLightMode)}>
            <p style={{ fontWeight: "bold", color: isLightMode ? "#111827" : "#ffffff" }}>
              Profile details:
            </p>
            <p className="username" style={{ color: isLightMode ? "#111827" : "#ffffff" }}>
              Username: {username}
            </p>
            <p className="userId" style={{ color: isLightMode ? "#111827" : "#ffffff" }}>
              User ID: {id}
            </p>
            <p className="email" style={{ color: isLightMode ? "#111827" : "#ffffff" }}>
              Email: {email}
            </p>
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
            <button onClick={togglePasswordDropdown} style={dropdownTriggerStyle(isLightMode)}>
              <span style={dropdownLeftStyle()}>
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
                  style={inputStyle(isLightMode)}
                />

                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle(isLightMode)}
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle(isLightMode)}
                />

                <button onClick={updatePassword} style={updatePasswordButtonStyle}>
                  Update Password
                </button>

                {passwordStatus && (
                  <p style={{ marginTop: 5, color: isLightMode ? "#111827" : "#ffffff" }}>
                    {passwordStatus}
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{ width: "100%", marginTop: 15 }}>
            <button onClick={toggleDeleteDropdown} style={dropdownTriggerStyle(isLightMode)}>
              <span style={dropdownLeftStyle()}>
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
                  style={inputStyle(isLightMode)}
                />

                <label
                  style={{
                    ...checkboxLabelStyle,
                    color: isLightMode ? "#111827" : "#ffffff",
                  }}
                >
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

                {deleteStatus && (
                  <p style={{ marginTop: 5, color: isLightMode ? "#111827" : "#ffffff" }}>
                    {deleteStatus}
                  </p>
                )}
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={logoutButtonStyle}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

const profilePageBackgroundStyle = (isLightMode) => ({
  minHeight: "100vh",
  width: "100%",
  padding: "56px 20px 40px",
  boxSizing: "border-box",
  background: isLightMode
    ? "linear-gradient(135deg, #f8fafc, #dbeafe, #ede9fe)"
    : "radial-gradient(circle at 20% 20%, rgba(0,208,255,0.18), transparent 32%), radial-gradient(circle at 80% 30%, rgba(168,85,247,0.18), transparent 30%), linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
});

const profileContainerStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const mainCardStyle = (isLightMode) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  width: "100%",
  maxWidth: "620px",
  padding: "28px",
  borderRadius: "22px",
  background: isLightMode ? "rgba(255,255,255,0.82)" : "rgba(15, 23, 42, 0.82)",
  border: isLightMode
    ? "1px solid rgba(0,0,0,0.08)"
    : "1px solid rgba(255,255,255,0.12)",
  boxShadow: isLightMode
    ? "0 18px 40px rgba(0,0,0,0.18)"
    : "0 18px 40px rgba(0,0,0,0.35)",
  color: isLightMode ? "#111827" : "#ffffff",
});

const innerCardStyle = (isLightMode) => ({
  width: "100%",
  marginTop: "16px",
  background: isLightMode ? "rgba(255,255,255,0.78)" : "rgba(30,41,59,0.85)",
  color: isLightMode ? "#111827" : "#ffffff",
  border: isLightMode
    ? "1px solid rgba(0,0,0,0.06)"
    : "1px solid rgba(255,255,255,0.08)",
});

const profileImageStyle = (isLightMode) => ({
  width: 110,
  height: 110,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 10,
  border: isLightMode
    ? "3px solid rgba(124,58,237,0.18)"
    : "3px solid rgba(255,255,255,0.12)",
});

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

const dropdownTriggerStyle = (isLightMode) => ({
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
});

const dropdownLeftStyle = () => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "500",
  color: "#222",
});

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

const inputStyle = (isLightMode) => ({
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "250px",
  background: "#ffffff",
  color: "#111827",
});

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

const xpBarContainerStyle = (isLightMode) => ({
  width: "100%",
  height: "12px",
  borderRadius: "999px",
  background: isLightMode ? "#e5e7eb" : "#334155",
  overflow: "hidden",
});

const xpBarFillStyle = {
  height: "100%",
  background: "#22c55e",
};

export default ProfilePage;