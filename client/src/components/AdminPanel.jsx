import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/AdminPanel.css";

const AdminPanel = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchLicenses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLicenses(res.data);
    } catch (err) {
      alert("Failed to load licenses");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`License ${action}d`);
      fetchLicenses(); // refresh
    } catch (err) {
      alert("Failed to update license status");
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  return (
    <div className="admin-panel">
      <h2>Dog License Applications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="license-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Dog Name</th>
              <th>Status</th>
              <th>Vaccination Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((lic) => (
              <tr key={lic._id}>
                <td>{lic.fullName}</td>
                <td>{lic.dog?.name || "N/A"}</td>
                <td>{lic.status}</td>
                <td>{lic.dog?.dateOfVaccination?.slice(0, 10)}</td>
                <td>
                  {lic.status === "pending" ? (
                    <>
                      <button onClick={() => updateStatus(lic._id, "approve")}>Approve</button>
                      <button onClick={() => updateStatus(lic._id, "reject")}>Reject</button>
                    </>
                  ) : (
                    <span>{lic.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
