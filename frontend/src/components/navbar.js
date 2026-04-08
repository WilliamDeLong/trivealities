import React, { useEffect, useState } from "react";
import getUserInfo from "../utilities/decodeJwt";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import ReactNavbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";

// Here, we display our Navbar
export default function Navbar({ isLightMode, toggleTheme }) {
  // We are pulling in the user's info but not using it for now.
  // Warning disabled:
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  const [profileUrl, setProfileUrl] = useState("/user-icon.png");
  const [isProfileAreaHovered, setIsProfileAreaHovered] = useState(false);

  const navigate = useNavigate();
  const { isMuted, toggleMute, stopAndResetMusic } = useMusic();

  useEffect(() => {
    const currentUser = getUserInfo();
    setUser(currentUser);

    const fetchProfileImage = async () => {
      try {
        if (!currentUser?.id) return;

        const res = await fetch(`http://localhost:8081/user/${currentUser.id}`);
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
      fetchProfileImage();
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    stopAndResetMusic();
    navigate("/");
  };

  if (!user?.id) return null; // for now, let's show the bar even not logged in.
  // we have an issue with getUserInfo() returning null after a few minutes
  // it seems.
  //<Nav.Link href="/">Start</Nav.Link>

  return (
    <ReactNavbar
      expand="lg"
      style={{
        backgroundColor: "#0f172a",
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
            href="/home"
            style={{ color: "white", fontWeight: "600" }}
          >
            Home
          </Nav.Link>

          <Nav.Link
            href="/questionCreate"
            style={{ color: "white", fontWeight: "600" }}
          >
            Question Creation
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
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: "999px",
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {isMuted ? "Unmute Music" : "Mute Music"}
          </button>

          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: "999px",
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {isLightMode ? "Dark Mode" : "Light Mode"}
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
                color: "white",
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
                border: "2px solid white",
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