import React, { useRef, useState, useContext } from "react";
import { useMusic } from "../../context/MusicContext";
import { UserContext } from "../../App";

const Landingpage = () => {
  const videoRef = useRef(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const { isMuted, startMusic, toggleMute } = useMusic();
  const { isLightMode } = useContext(UserContext);

  const handleStartJourney = async () => {
    setHasStarted(true);

    // keep video muted at all times
    if (videoRef.current) {
      videoRef.current.muted = true;
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Video playback failed:", error);
      }
    }

    // music only starts if user has not muted it
    await startMusic();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: videoFailed
          ? isLightMode
            ? "linear-gradient(135deg, #dbeafe, #bfdbfe, #e0f2fe)"
            : "linear-gradient(135deg, #0f172a, #1e3a8a, #0f172a)"
          : "#000",
      }}
    >
      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            filter: isLightMode ? "brightness(1.05) saturate(0.9)" : "brightness(0.7)",
          }}
        >
          <source src="/trivialities-landing-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: isLightMode
            ? "rgba(255, 255, 255, 0.18)"
            : "rgba(0, 0, 0, 0.35)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px",
        }}
      >
        {!hasStarted ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              onClick={handleStartJourney}
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "white",
                border: "2px solid white",
                borderRadius: "999px",
                padding: "22px 48px",
                fontSize: "1.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                backdropFilter: "blur(6px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              }}
            >
              Start my journey
            </button>

            <button
              onClick={toggleMute}
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.7)",
                borderRadius: "999px",
                padding: "10px 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                backdropFilter: "blur(6px)",
              }}
            >
              {isMuted ? "Unmute Music" : "Mute Music"}
            </button>
          </div>
        ) : (
          <div
            style={{
              animation: "fadeInLanding 1s ease forwards",
              opacity: 0,
            }}
          >
            <h1
              style={{
                color: "white",
                fontSize: "3rem",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              Welcome to Trivialities
            </h1>

            <p
              style={{
                color: "white",
                fontSize: "1.3rem",
                marginBottom: "30px",
              }}
            >
              Where trivia meets reality
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <a
                href="/signup"
                style={{
                  textDecoration: "none",
                  backgroundColor: "#22c55e",
                  color: "white",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                }}
              >
                Sign Up
              </a>

              <a
                href="/login"
                style={{
                  textDecoration: "none",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                }}
              >
                Log In
              </a>
            </div>

            <div style={{ marginTop: "18px" }}>
              <button
                onClick={toggleMute}
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.7)",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                }}
              >
                {isMuted ? "Unmute Music" : "Mute Music"}
              </button>
            </div>

            {videoFailed && (
              <p style={{ color: "white", marginTop: "20px" }}>
                Background video unavailable. Default background is being shown.
              </p>
            )}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInLanding {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Landingpage;