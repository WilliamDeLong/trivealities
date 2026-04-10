import { useState } from "react";
import axios from "axios";

function AddXpPage() {
  const [userId, setUserId] = useState("");
  const [xp, setXp] = useState("");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddXp = async (e) => {
    e.preventDefault();
    setMessage("");
    setUserData(null);
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:8081/user/${userId}/xp`, {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Add XP
        </h2>

        <form onSubmit={handleAddXp}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold" }}>User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "bold" }}>XP to Add</label>
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              placeholder="Enter XP amount"
              min="1"
              step="0.01"
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {loading ? "Adding XP..." : "Add XP"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        {userData && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "8px",
              background: "#f1f5f9",
              border: "1px solid #ddd",
            }}
          >
            <p><strong>Level:</strong> {userData.accountLevel}</p>
            <p><strong>Current XP:</strong> {userData.accountXp}</p>
            <p><strong>Levels Gained:</strong> {userData.levelsGained}</p>
            <p><strong>XP Needed:</strong> {userData.xpNeededForNextLevel}</p>

            {/* XP BAR */}
            <div
              style={{
                marginTop: "10px",
                height: "12px",
                background: "#ddd",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(userData.accountXp, 100)}%`,
                  background: "linear-gradient(90deg, #22c55e, #4ade80)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddXpPage;