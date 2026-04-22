import { useState } from "react";
import axios from "axios";
import "./AddXpPage.css";
import API_BASE from '../../api';

function AddXpPage() {
  const [userId, setUserId] = useState("");
  const [xp, setXp] = useState("");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleAddXp = async (e) => {
    e.preventDefault();
    setMessage("");
    setUserData(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/user/${userId}/xp`, {
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
      setLoading(false);
    }
  };

  const handleResetXpAndLevel = async () => {
    if (!userId.trim()) {
      setMessage("Please enter a user ID first.");
      return;
    }

    const confirmReset = window.confirm(
      "Are you sure you want to reset this user's XP and level to 0?"
    );

    if (!confirmReset) return;

    setMessage("");
    setUserData(null);
    setResetLoading(true);

    try {
      const res = await axios.put(
        `http://10.0.0.132/user/${userId}/reset-xp`
      );

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

  const xpProgress = userData ? Math.min(Number(userData.accountXp) || 0, 100) : 0;

  return (
    <div className="add-xp-page">
      <div className="add-xp-overlay">
        <div className="add-xp-card">
          <div className="add-xp-header">
            <h1>Add XP</h1>
            <p>Manage player progression and reset account levels when needed.</p>
          </div>

          <form className="add-xp-form" onSubmit={handleAddXp}>
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
                required
              />
            </div>

            <div className="add-xp-actions">
              <button
                type="submit"
                className="xp-btn xp-btn-primary"
                disabled={loading || resetLoading}
              >
                {loading ? "Adding XP..." : "Add XP"}
              </button>

              <button
                type="button"
                className="xp-btn xp-btn-danger"
                onClick={handleResetXpAndLevel}
                disabled={loading || resetLoading}
              >
                {resetLoading ? "Resetting..." : "Reset XP and Level"}
              </button>
            </div>
          </form>

          {message && <div className="xp-message">{message}</div>}

          {userData && (
            <div className="xp-results-card">
              <h2>Updated Account Stats</h2>

              <div className="xp-stats-grid">
                <div className="xp-stat-box">
                  <span className="xp-stat-label">Level</span>
                  <span className="xp-stat-value">{userData.accountLevel}</span>
                </div>

                <div className="xp-stat-box">
                  <span className="xp-stat-label">Current XP</span>
                  <span className="xp-stat-value">{userData.accountXp}</span>
                </div>

                <div className="xp-stat-box">
                  <span className="xp-stat-label">Levels Gained</span>
                  <span className="xp-stat-value">
                    {userData.levelsGained !== undefined ? userData.levelsGained : 0}
                  </span>
                </div>

                <div className="xp-stat-box">
                  <span className="xp-stat-label">XP Needed</span>
                  <span className="xp-stat-value">
                    {userData.xpNeededForNextLevel !== undefined
                      ? userData.xpNeededForNextLevel
                      : 100}
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