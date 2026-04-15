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
                            <button
                                type="button"
                                style={{
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    padding: "12px 28px",
                                    borderRadius: "0px",
                                    fontWeight: "bold",
                                    border: "none",
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                                    cursor: "pointer",
                                }}
                            >
                                Join Game
                            </button>

                            <button
                                type="button"
                                style={{
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    padding: "12px 28px",
                                    borderRadius: "0px",
                                    fontWeight: "bold",
                                    border: "none",
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                                    cursor: "pointer",
                                }}
                            >
                                Host Game
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/singleplayer")}
                                style={{
                                    backgroundColor: "#22c55e",
                                    color: "white",
                                    padding: "12px 28px",
                                    borderRadius: "0px",
                                    fontWeight: "bold",
                                    border: "none",
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                                    cursor: "pointer",
                                }}
                                >
                                Single Player
                            </button>
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