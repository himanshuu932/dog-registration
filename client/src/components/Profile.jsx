import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

   const backend = "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${backend}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user?.username}</p>
      <p><strong>Email:</strong> {user?.email || "N/A"}</p>
      <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "10% auto",
    padding: "20px",
    fontFamily: "Segoe UI, sans-serif",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  loading: {
    textAlign: "center",
    marginTop: "20%",
    fontSize: "18px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "20%",
  },
};

export default Profile;
