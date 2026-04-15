import React from "react";
import { useNavigate } from "react-router-dom";

function MultiplayerPage() {
  const navigate = useNavigate();

  const cardStyle = {
    width: "220px",
    minHeight: "180px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    cursor: "pointer",
    background: "rgba(15,23,42,0.66)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  };

  const handleHover = (e, entering) => {
    if (entering) {
      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
      e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,0.32)";
    } else {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.28)";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: "floatGlow 10s ease-in-out infinite",
          background:
            "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.25), transparent 30%), radial-gradient(circle at 80% 30%, rgba(168,85,247,0.25), transparent 30%), radial-gradient(circle at 50% 80%, rgba(34,197,94,0.2), transparent 30%)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              color: "#00d0ff",
              marginBottom: "10px",
              textShadow: "0 0 18px rgba(0,208,255,0.35)",
            }}
          >
            Multiplayer
          </h1>

          <p style={{ color: "white", marginBottom: "30px" }}>
            Choose how you want to play
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/multiplayer/join")}
              style={{
                ...cardStyle,
                boxShadow: "0 0 20px rgba(59,130,246,0.35)",
                border: "1px solid rgba(59,130,246,0.4)",
              }}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  background: "rgba(59,130,246,0.18)",
                }}
              />

              <div style={{ fontSize: "2rem", marginBottom: "10px", zIndex: 1 }}>
                🎮
              </div>
              <h3 style={{ margin: 0, zIndex: 1 }}>Join Game</h3>
              <p style={{ fontSize: "0.9rem", opacity: 0.8, zIndex: 1 }}>
                Enter a room code
              </p>
            </button>

            <button
              onClick={() => navigate("/multiplayer/host")}
              style={{
                ...cardStyle,
                boxShadow: "0 0 20px rgba(168,85,247,0.35)",
                border: "1px solid rgba(168,85,247,0.4)",
              }}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  background: "rgba(168,85,247,0.18)",
                }}
              />

              <div style={{ fontSize: "2rem", marginBottom: "10px", zIndex: 1 }}>
                🧠
              </div>
              <h3 style={{ margin: 0, zIndex: 1 }}>Host Game</h3>
              <p style={{ fontSize: "0.9rem", opacity: 0.8, zIndex: 1 }}>
                Create a new room
              </p>
            </button>
          </div>

          <button
            onClick={() => navigate("/home")}
            style={{
              marginTop: "30px",
              background: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes floatGlow {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
}

export default MultiplayerPage;