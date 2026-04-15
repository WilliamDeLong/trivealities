import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt';
import { UserContext } from '../../App';

const HomePage = () => {
    const [user, setUser] = useState({});
    const [videoFailed, setVideoFailed] = useState(false);
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const { isLightMode } = useContext(UserContext);
    const homeButtonStyle = {
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
        };
    const handleClick = (e) => {
        e.preventDefault();
        localStorage.removeItem('accessToken');
        return navigate('/');
    };

    useEffect(() => {
        setUser(getUserInfo());
    }, []);

    if (!user) return (
        <div><h4>Log in to view this page.</h4></div>
    );

    const { username } = user;

    return (
        <>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    minHeight: "100vh",
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
                            filter: isLightMode
                                ? "brightness(1.05) saturate(0.9)"
                                : "brightness(0.7)",
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
                        minHeight: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            animation: "fadeInHome 1s ease forwards",
                            opacity: 0,
                        }}
                    >
                        <p
                            style={{
                                color: "white",
                                fontWeight: "bold",
                                marginBottom: "8px",
                            }}
                        >
                            Welcome!
                        </p>

                        <h1
                            style={{
                                color: "#00d0ff",
                                fontSize: "3rem",
                                fontWeight: "bold",
                                marginBottom: "12px",
                            }}
                        >
                            {username}
                        </h1>

                        <p
                            style={{
                                color: "white",
                                fontSize: "1.2rem",
                                marginBottom: "30px",
                            }}
                        >
                            Choose how you want to enter Trivialities
                        </p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "16px",
                                flexWrap: "wrap",
                            }}
                        >
                            <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  }}
>
  {/* MULTIPLAYER */}
  <button
        onClick={() => navigate("/multiplayer")}
        style={homeButtonStyle}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(59,130,246,0.6)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.28)";
        }}
        >
        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🌐</div>
        <h3 style={{ margin: 0 }}>Multiplayer</h3>
        <p style={{ margin: "6px 0 0", fontSize: "0.9rem", opacity: 0.8 }}>
            Join or host a live game
        </p>
    </button>

  {/* SINGLE PLAYER */}
  <button
    onClick={() => navigate("/singleplayer")}
    style={{
      ...homeButtonStyle,
      boxShadow: "0 0 20px rgba(34,197,94,0.35)",
      border: "1px solid rgba(34,197,94,0.4)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
      e.currentTarget.style.boxShadow = "0 0 30px rgba(34,197,94,0.6)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.35)";
    }}
  >
    <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🔥</div>
    <h3 style={{ margin: 0 }}>Single Player</h3>
    <p style={{ margin: "6px 0 0", fontSize: "0.9rem", opacity: 0.8 }}>
      Play solo and level up
    </p>
  </button>
</div>
                        </div>

                        {videoFailed && (
                            <p style={{ color: "white", marginTop: "20px" }}>
                                Background video unavailable. Default background is being shown.
                            </p>
                        )}

                    </div>
                </div>

                <style>
                    {`
                        @keyframes fadeInHome {
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
        </>
    );
};
// Here is a demo comment that will be pushed!
export default HomePage;