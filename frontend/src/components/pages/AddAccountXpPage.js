import { useState, useEffect } from "react";
import axios from "axios";
import "./AddXpPage.css";
import API_BASE from "../../api";
import getUserInfo from "../../utilities/decodeJwt";

function AddXpPage() {
  const [user, setUser] = useState(getUserInfo());
  const [adminny, setAdminy] = useState();

  const [userId, setUserId] = useState("");
  const [xp, setXp] = useState("");

  const [easyCompleted, setEasyCompleted] = useState(false);
  const [mediumCompleted, setMediumCompleted] = useState(false);
  const [hardCompleted, setHardCompleted] = useState(false);

  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);

  const [singleLoading, setSingleLoading] = useState(false);
  const [multiLoading, setMultiLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  const fetch_admin = async () => {
    if (user?.id) {
      const result = await axios.get(`${API_BASE}/user/${user.id}/admin`);
      setAdminy(result.data.success);
    }
  };

  useEffect(() => {
    if (!user) setUser(getUserInfo());
    fetch_admin();
  }, []);

  const addXp = async (xpType) => {
    if (!userId.trim()) {
      setMessage("Please enter a user ID first.");
      return;
    }

    if (!xp || Number(xp) <= 0) {
      setMessage("Please enter a valid XP amount.");
      return;
    }

    setMessage("");
    setUserData(null);

    const route =
      xpType === "multiplayer"
        ? `${API_BASE}/user/${userId}/multiplayer-xp`
        : `${API_BASE}/user/${userId}/xp`;

    try {
      if (xpType === "multiplayer") {
        setMultiLoading(true);
      } else {
        setSingleLoading(true);
      }

      const res = await axios.post(route, {
        xp: Number(xp),
      });

      setMessage(res.data.message);
      setUserData(res.data);
      setXp("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong while adding XP"
      );
    } finally {
      setSingleLoading(false);
      setMultiLoading(false);
    }
  };

  const handleResetXpAndLevel = async () => {
    if (!userId.trim()) {
      setMessage("Please enter a user ID first.");
      return;
    }

    const confirmReset = window.confirm(
      "Are you sure you want to reset this user's single-player XP and level to 0?"
    );

    if (!confirmReset) return;

    setMessage("");
    setUserData(null);
    setResetLoading(true);

    try {
      const res = await axios.put(`${API_BASE}/user/${userId}/reset-xp`, {});
      setMessage(res.data.message);
      setUserData(res.data.user);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong while resetting XP and levels"
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdateSinglePlayerProgress = async () => {
    if (!userId.trim()) {
      setMessage("Please enter a user ID first.");
      return;
    }

    setMessage("");
    setProgressLoading(true);

    try {
      const res = await axios.put(`${API_BASE}/user/${userId}/single-player-progress`, {
        easyCompleted,
        mediumCompleted,
        hardCompleted,
      });

      setMessage(res.data.message || "Single-player progress updated");
      setUserData(res.data.user || res.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong while updating single-player progress"
      );
    } finally {
      setProgressLoading(false);
    }
  };

  if (adminny !== true) {
    return (
      <div>
        <h4>Only Admins can access this page.</h4>
      </div>
    );
  }

  const shownXp =
    userData?.multiplayerXp !== undefined
      ? userData.multiplayerXp
      : userData?.accountXp;

  const xpProgress = userData ? Math.min(Number(shownXp) || 0, 100) : 0;

  return (
    <div className="add-xp-page">
      <div className="add-xp-overlay">
        <div className="add-xp-card">
          <div className="add-xp-header">
            <h1>Add XP</h1>
            <p>Manage single-player XP, multiplayer XP, and game mode completion.</p>
          </div>

          <form className="add-xp-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="xp">XP to Add</label>
              <input
                id="xp"
                type="number"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
                placeholder="Enter XP amount"
                min="1"
                step="0.01"
              />
            </div>

            <div className="add-xp-actions">
              <button
                type="button"
                className="xp-btn xp-btn-primary"
                onClick={() => addXp("single")}
                disabled={singleLoading || multiLoading || resetLoading}
              >
                {singleLoading ? "Adding Single Player XP..." : "Add Single Player XP"}
              </button>

              <button
                type="button"
                className="xp-btn xp-btn-primary"
                onClick={() => addXp("multiplayer")}
                disabled={singleLoading || multiLoading || resetLoading}
              >
                {multiLoading ? "Adding Multiplayer XP..." : "Add Multiplayer XP"}
              </button>

              <button
                type="button"
                className="xp-btn xp-btn-danger"
                onClick={handleResetXpAndLevel}
                disabled={singleLoading || multiLoading || resetLoading}
              >
                {resetLoading ? "Resetting..." : "Reset Single Player XP and Level"}
              </button>
            </div>

            <div className="single-player-progress-card">
              <h2>Single Player Completion</h2>

              <label className="completion-row">
                <input
                  type="checkbox"
                  checked={easyCompleted}
                  onChange={(e) => setEasyCompleted(e.target.checked)}
                />
                Easy Completed
              </label>

              <label className="completion-row">
                <input
                  type="checkbox"
                  checked={mediumCompleted}
                  onChange={(e) => setMediumCompleted(e.target.checked)}
                />
                Medium Completed
              </label>

              <label className="completion-row">
                <input
                  type="checkbox"
                  checked={hardCompleted}
                  onChange={(e) => setHardCompleted(e.target.checked)}
                />
                Hard Completed
              </label>

              <button
                type="button"
                className="xp-btn xp-btn-primary"
                onClick={handleUpdateSinglePlayerProgress}
                disabled={progressLoading}
              >
                {progressLoading ? "Updating..." : "Update Single Player Completion"}
              </button>
            </div>
          </form>

          {message && <div className="xp-message">{message}</div>}

          {userData && (
            <div className="xp-results-card">
              <h2>Updated Stats</h2>

              <div className="xp-stats-grid">
                <div className="xp-stat-box">
                  <span className="xp-stat-label">Single Player Level</span>
                  <span className="xp-stat-value">
                    {userData.accountLevel ?? "N/A"}
                  </span>
                </div>

                <div className="xp-stat-box">
                  <span className="xp-stat-label">Single Player XP</span>
                  <span className="xp-stat-value">
                    {userData.accountXp ?? "N/A"}
                  </span>
                </div>

                <div className="xp-stat-box">
                  <span className="xp-stat-label">Multiplayer Level</span>
                  <span className="xp-stat-value">
                    {userData.multiplayerLevel ?? "N/A"}
                  </span>
                </div>

                <div className="xp-stat-box">
                  <span className="xp-stat-label">Multiplayer XP</span>
                  <span className="xp-stat-value">
                    {userData.multiplayerXp ?? "N/A"}
                  </span>
                </div>
              </div>

              <div className="xp-progress-section">
                <div className="xp-progress-label-row">
                  <span>Progress to Next Level</span>
                  <span>{xpProgress.toFixed(0)}%</span>
                </div>

                <div className="xp-progress-bar">
                  <div
                    className="xp-progress-fill"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddXpPage;