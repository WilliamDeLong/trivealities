import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../App";
import getUserInfo from "../../utilities/decodeJwt";
import API_BASE from "../../api";

const LeaderboardPage = () => {
  const { isLightMode } = useContext(UserContext);
  const currentUser = getUserInfo();

  const [mode, setMode] = useState("single");
  const [searchTerm, setSearchTerm] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserRowRef = useRef(null);
  const [showStickyCurrentUser, setShowStickyCurrentUser] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE}/user/leaderboard?mode=${mode}&order=desc`
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Failed to load leaderboard.");
          setLeaderboard([]);
          return;
        }

        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("LEADERBOARD FETCH ERROR:", err);
        setError("Failed to load leaderboard.");
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [mode]);

  const currentUserId = currentUser?._id || currentUser?.id;

  const filteredLeaderboard = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return leaderboard;

    return leaderboard.filter((entry) =>
      entry.username.toLowerCase().includes(normalized)
    );
  }, [leaderboard, searchTerm]);

  const currentUserEntry = useMemo(() => {
    return leaderboard.find((entry) => entry.userId === currentUserId) || null;
  }, [leaderboard, currentUserId]);

  useEffect(() => {
    if (!currentUserEntry || !currentUserRowRef.current) {
      setShowStickyCurrentUser(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCurrentUser(!entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(currentUserRowRef.current);

    return () => observer.disconnect();
  }, [currentUserEntry, filteredLeaderboard]);

  const scrollToCurrentUser = () => {
    currentUserRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const pageStyle = {
    minHeight: "100vh",
    background: isLightMode
      ? "linear-gradient(135deg, #f8fafc, #dbeafe, #ede9fe)"
      : "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
    padding: "24px",
    boxSizing: "border-box",
  };

  const boardShellStyle = {
    width: "100%",
    maxWidth: "980px",
    margin: "0 auto",
    background: isLightMode
      ? "rgba(255,255,255,0.82)"
      : "rgba(15,23,42,0.9)",
    border: isLightMode
      ? "1px solid rgba(59,130,246,0.18)"
      : "1px solid rgba(96,165,250,0.16)",
    borderRadius: "26px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  };

  const titleStyle = {
    margin: 0,
    color: isLightMode ? "#2563eb" : "#60a5fa",
    fontSize: "2rem",
    fontWeight: "800",
    textAlign: "center",
  };

  const subStyle = {
    textAlign: "center",
    color: isLightMode ? "#334155" : "#cbd5e1",
    marginTop: "8px",
    marginBottom: "20px",
  };

  const controlRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "16px",
  };

  const controlGroupStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  };

  const pillButton = (active) => ({
    border: "none",
    borderRadius: "999px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "700",
    background: active
      ? isLightMode
        ? "linear-gradient(90deg, #3b82f6, #2563eb)"
        : "linear-gradient(90deg, #3b82f6, #1d4ed8)"
      : isLightMode
      ? "#e2e8f0"
      : "#334155",
    color: active ? "#ffffff" : isLightMode ? "#1e293b" : "#e2e8f0",
  });

  const searchInputStyle = {
    width: "100%",
    maxWidth: "320px",
    padding: "11px 14px",
    borderRadius: "12px",
    border: isLightMode
      ? "1px solid rgba(59,130,246,0.2)"
      : "1px solid rgba(148,163,184,0.18)",
    background: isLightMode ? "#ffffff" : "rgba(30,41,59,0.95)",
    color: isLightMode ? "#0f172a" : "#f8fafc",
    outline: "none",
    fontSize: "0.95rem",
  };

  const listStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "8px",
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const rowStyle = (isCurrentUser) => ({
    display: "grid",
    gridTemplateColumns: "72px 54px minmax(0, 1fr) 90px 170px",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "18px",
    background: isCurrentUser
      ? isLightMode
        ? "rgba(59,130,246,0.14)"
        : "rgba(96,165,250,0.14)"
      : isLightMode
      ? "rgba(255,255,255,0.88)"
      : "rgba(30,41,59,0.88)",
    border: isCurrentUser
      ? isLightMode
        ? "1px solid rgba(59,130,246,0.45)"
        : "1px solid rgba(96,165,250,0.45)"
      : isLightMode
      ? "1px solid rgba(0,0,0,0.06)"
      : "1px solid rgba(255,255,255,0.06)",
    boxShadow: isCurrentUser ? "0 0 0 1px rgba(96,165,250,0.12)" : "none",
  });

  const stickyCardStyle = {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "18px",
    width: "min(920px, calc(100vw - 28px))",
    zIndex: 120,
    background: isLightMode ? "rgba(255,255,255,0.97)" : "rgba(15,23,42,0.97)",
    border: isLightMode
      ? "1px solid rgba(59,130,246,0.28)"
      : "1px solid rgba(96,165,250,0.28)",
    borderRadius: "18px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
    padding: "10px",
    cursor: "pointer",
  };

  const xpBarTrackStyle = {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    background: isLightMode ? "#dbeafe" : "#334155",
    overflow: "hidden",
    marginTop: "6px",
  };

  const xpBarFillStyle = (xp) => ({
    width: `${Math.min(xp, 100)}%`,
    height: "100%",
    background: "linear-gradient(90deg, #fbbf24, #3b82f6)",
  });

  const renderRow = (entry, isSticky = false) => {
    const isCurrentUser = entry.userId === currentUserId;

    return (
      <div
        key={`${entry.userId}-${isSticky ? "sticky" : "row"}`}
        ref={!isSticky && isCurrentUser ? currentUserRowRef : null}
        style={rowStyle(isCurrentUser)}
      >
        <div
          style={{
            fontWeight: "800",
            fontSize: "1.1rem",
            color: isLightMode ? "#1e3a8a" : "#bfdbfe",
            textAlign: "center",
          }}
        >
          {getRankDisplay(entry.rank)}
        </div>

        <img
          src={entry.profileImageUrl}
          alt={entry.username}
          onError={(e) => {
            e.currentTarget.src = "/user-icon.png";
          }}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${isLightMode ? "#60a5fa" : "#93c5fd"}`,
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: isLightMode ? "#0f172a" : "#f8fafc",
              fontWeight: "700",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.username}
            {isCurrentUser ? " (You)" : ""}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            color: isLightMode ? "#1d4ed8" : "#93c5fd",
            fontWeight: "800",
          }}
        >
          Lv. {entry.level}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              color: isLightMode ? "#334155" : "#cbd5e1",
            }}
          >
            <span>XP</span>
            <span>{entry.xp}/100</span>
          </div>
          <div style={xpBarTrackStyle}>
            <div style={xpBarFillStyle(entry.xp)} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={boardShellStyle}>
        <h1 style={titleStyle}>Leaderboard</h1>
        <div style={subStyle}>
          Compare rankings by game mode.
        </div>

        <div style={controlRowStyle}>
          <div style={controlGroupStyle}>
            <button style={pillButton(mode === "single")} onClick={() => setMode("single")}>
              Single Player
            </button>
            <button
              style={pillButton(mode === "multiplayer")}
              onClick={() => setMode("multiplayer")}
            >
              Multiplayer
            </button>
          </div>

          <div style={controlGroupStyle}>
            <input
              type="text"
              placeholder="Search player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />

            {currentUserEntry && (
              <button style={pillButton(false)} onClick={scrollToCurrentUser}>
                Go to My Rank
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ color: isLightMode ? "#334155" : "#cbd5e1", textAlign: "center" }}>
            Loading leaderboard...
          </div>
        ) : error ? (
          <div style={{ color: "#ef4444", textAlign: "center" }}>{error}</div>
        ) : (
          <div style={listStyle}>
            {filteredLeaderboard.length > 0 ? (
              filteredLeaderboard.map((entry) => renderRow(entry))
            ) : (
              <div
                style={{
                  color: isLightMode ? "#475569" : "#94a3b8",
                  textAlign: "center",
                  padding: "18px 0",
                }}
              >
                No players found.
              </div>
            )}
          </div>
        )}
      </div>

      {showStickyCurrentUser && currentUserEntry && (
        <div style={stickyCardStyle} onClick={scrollToCurrentUser}>
          {renderRow(currentUserEntry, true)}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;