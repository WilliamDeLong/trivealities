import React, { useEffect, useState } from "react";
import getUserInfo from "../utilities/decodeJwt";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import ReactNavbar from "react-bootstrap/Navbar";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import API_BASE from "../api";

export default function Navbar({ isLightMode, toggleTheme }) {
  const [user, setUser] = useState(getUserInfo());
  const [profileUrl, setProfileUrl] = useState("/user-icon.png");
  const [isProfileAreaHovered, setIsProfileAreaHovered] = useState(false);
  const [isAdmin, setAdmin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isMuted, toggleMute, stopAndResetMusic } = useMusic();

  useEffect(() => {
    const currentUser = getUserInfo();
    setUser(currentUser);

    const fetchAdmin = async () => {
      try {
        if (!currentUser?.id) return;
        const result = await axios.get(`${API_BASE}/user/${currentUser.id}/admin`);
        setAdmin(result.data.success);
      } catch (error) {
        console.error("Failed to fetch admin status:", error);
      }
    };

    const fetchProfileImage = async () => {
      try {
        if (!currentUser?.id) return;

        const res = await fetch(`${API_BASE}/user/${currentUser.id}`);
        if (!res.ok) return;

        const data = await res.json();
        const imageUrl = data?.user?.profileImage?.imageUrl;

        if (imageUrl) {
          setProfileUrl(imageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch navbar profile image:", error);
      }
    };

    if (currentUser?.id) {
      fetchAdmin();
      fetchProfileImage();
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    stopAndResetMusic();
    navigate("/");
  };

  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;

    return {
      color: isLightMode ? "#0f172a" : "white",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: isActive ? "underline" : "none",
      textUnderlineOffset: "6px",
      textDecorationThickness: "2px",
      transition: "transform 0.18s ease, text-decoration-color 0.18s ease",
    };
  };

  const navHoverHandlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.textDecoration = "underline";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = "translateY(0)";
      if (!e.currentTarget.dataset.active) {
        e.currentTarget.style.textDecoration = "none";
      }
    },
  };

  const themeToggleStyle = {
    position: "relative",
    width: "122px",
    height: "42px",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    overflow: "hidden",
    padding: 0,
    background: isLightMode
      ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
      : "linear-gradient(90deg, #2563eb, #1d4ed8)",
    boxShadow: "inset 0 1px 3px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.18)",
    transition: "all 0.25s ease",
  };

  const themeKnobStyle = {
    position: "absolute",
    top: "4px",
    left: isLightMode ? "84px" : "4px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
    transition: "all 0.25s ease",
  };

  const themeLabelStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    color: "white",
    fontWeight: "700",
    fontSize: "0.76rem",
    letterSpacing: "0.4px",
    lineHeight: 1.05,
    textAlign: "center",
    pointerEvents: "none",
  };

  const soundToggleStyle = {
    position: "relative",
    width: "74px",
    height: "42px",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    overflow: "hidden",
    padding: 0,
    background: isMuted
      ? "linear-gradient(90deg, #6b7280, #4b5563)"
      : "linear-gradient(90deg, #10b981, #059669)",
    boxShadow: "inset 0 1px 3px rgba(255,255,255,0.15), 0 2px 6px rgba(0,0,0,0.18)",
    transition: "all 0.25s ease",
  };

  const soundKnobStyle = {
    position: "absolute",
    top: "4px",
    left: isMuted ? "4px" : "36px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.95rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
    transition: "all 0.25s ease",
  };

  const soundSideIconStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    color: "white",
    fontSize: "0.8rem",
    opacity: 0.95,
    pointerEvents: "none",
  };

  if (!user?.id) return null;

  return (
    <ReactNavbar
      expand="lg"
      style={{
        backgroundColor: isLightMode ? "#e2e8f0" : "#0f172a",
        padding: "12px 24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      <Container fluid style={{ display: "flex", alignItems: "center" }}>
        <Nav
          className="mx-auto"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <Nav.Link
            onClick={() => navigate("/home")}
            data-active={location.pathname === "/home" ? "true" : ""}
            style={getNavLinkStyle("/home")}
            {...navHoverHandlers}
          >
            Home
          </Nav.Link>

          <Nav.Link
            onClick={() => navigate("/questionCreate")}
            data-active={location.pathname === "/questionCreate" ? "true" : ""}
            style={getNavLinkStyle("/questionCreate")}
            {...navHoverHandlers}
          >
            Question Creation
          </Nav.Link>

          <Nav.Link
            onClick={() => navigate("/questionDatabase")}
            data-active={location.pathname === "/questionDatabase" ? "true" : ""}
            style={getNavLinkStyle("/questionDatabase")}
            {...navHoverHandlers}
          >
            Question Database
          </Nav.Link>

          {isAdmin && (
            <Nav.Link
              onClick={() => navigate("/questionDatabase-A")}
              data-active={location.pathname === "/questionDatabase-A" ? "true" : ""}
              style={getNavLinkStyle("/questionDatabase-A")}
              {...navHoverHandlers}
            >
              Question Editing Page
            </Nav.Link>
          )}

          {isAdmin && (
            <Nav.Link
              onClick={() => navigate("/add-xp")}
              data-active={location.pathname === "/add-xp" ? "true" : ""}
              style={getNavLinkStyle("/add-xp")}
              {...navHoverHandlers}
            >
              Add XP
            </Nav.Link>
          )}

          <Nav.Link
            onClick={() => navigate("/chat")}
            data-active={location.pathname === "/chat" ? "true" : ""}
            style={getNavLinkStyle("/chat")}
            {...navHoverHandlers}
          >
            Chat
          </Nav.Link>
        </Nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginLeft: "auto",
          }}
        >
          <button
            onClick={toggleMute}
            style={soundToggleStyle}
            title={isMuted ? "Unmute Music" : "Mute Music"}
            aria-label={isMuted ? "Unmute Music" : "Mute Music"}
          >
            <span style={{ ...soundSideIconStyle, left: "12px" }}>🔇</span>
            <span style={{ ...soundSideIconStyle, right: "12px" }}>🔊</span>
            <span style={soundKnobStyle}>{isMuted ? "🔇" : "🔊"}</span>
          </button>

          <button
            onClick={toggleTheme}
            style={themeToggleStyle}
            title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLightMode ? (
              <>
                <span style={{ ...themeLabelStyle, left: "10px" }}>
                  LIGHT
                  <br />
                  MODE
                </span>
                <span style={themeKnobStyle}>☀️</span>
              </>
            ) : (
              <>
                <span style={themeKnobStyle}>🌙</span>
                <span style={{ ...themeLabelStyle, right: "10px" }}>
                  DARK
                  <br />
                  MODE
                </span>
              </>
            )}
          </button>

          <div
            onClick={() => navigate("/profile")}
            onMouseEnter={() => setIsProfileAreaHovered(true)}
            onMouseLeave={() => setIsProfileAreaHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              transform: isProfileAreaHovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          >
            <span
              style={{
                color: isLightMode ? "#0f172a" : "white",
                fontWeight: "600",
                textDecoration: isProfileAreaHovered ? "underline" : "none",
              }}
            >
              {user.username}
            </span>

            <img
              src={profileUrl}
              alt="Profile"
              onError={() => setProfileUrl("/user-icon.png")}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${isLightMode ? "#0f172a" : "white"}`,
              }}
            />
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "999px",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Log Out
          </button>
        </div>
      </Container>
    </ReactNavbar>
  );
}