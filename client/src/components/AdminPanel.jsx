import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/AdminPanel.css";

const AdminPanel = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);

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

  const toggleExpanded = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
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
              <React.Fragment key={lic._id}>
                <tr>
                  <td>{lic.fullName}</td>
                  <td>{lic.dog?.name || "N/A"}</td>
                  <td>{lic.status}</td>
                  <td>{lic.dog?.dateOfVaccination?.slice(0, 10)}</td>
                  <td>
                    <button onClick={() => toggleExpanded(lic._id)}>
                      {expandedRows.includes(lic._id) ? "Hide" : "View"} Details
                    </button>
                    {lic.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(lic._id, "approve")}>Approve</button>
                        <button onClick={() => updateStatus(lic._id, "reject")}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
                {expandedRows.includes(lic._id) && (
                  <tr className="details-row">
                    <td colSpan="5">
                      <div className="license-details">
                        <h4>Owner Information</h4>
                        <p><strong>Name:</strong> {lic.fullName}</p>
                        <p><strong>Phone:</strong> {lic.phoneNumber}</p>
                        <p><strong>Gender:</strong> {lic.gender}</p>
                        <p><strong>Address:</strong> {lic.address?.streetName}, {lic.address?.city}, {lic.address?.state} - {lic.address?.pinCode}</p>
                        <p><strong>House Area:</strong> {lic.totalHouseArea}</p>
                        <p><strong>Number of Dogs:</strong> {lic.numberOfDogs}</p>

                        <h4>Dog Information</h4>
                        <p><strong>Name:</strong> {lic.dog?.name}</p>
                        <p><strong>Category:</strong> {lic.dog?.category}</p>
                        <p><strong>Breed:</strong> {lic.dog?.breed}</p>
                        <p><strong>Color:</strong> {lic.dog?.color}</p>
                        <p><strong>Age:</strong> {lic.dog?.age}</p>
                        <p><strong>Sex:</strong> {lic.dog?.sex}</p>
                        <p><strong>Date of Vaccination:</strong> {lic.dog?.dateOfVaccination?.slice(0, 10)}</p>
                        <p><strong>Due Vaccination:</strong> {lic.dog?.dueVaccination?.slice(0, 10)}</p>

                         {lic.dog?.avatarUrl && (
  <div style={{ marginTop: "10px" }}>
    <strong>Dog Avatar:</strong>
    <div>

      <img 
        src={lic.dog.avatarUrl} 
        alt="Dog Avatar" 
        style={{ maxHeight: "120px", borderRadius: "8px", marginTop: "5px" }} 
      />
    </div>
  </div>
)}


                        {lic.dog?.vaccinationProofUrl && (
                          <p>
                            <strong>Vaccination Certificate:</strong>{" "}
                            <a href={lic.dog.vaccinationProofUrl} target="_blank" rel="noreferrer">
                              View Certificate
                            </a>
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
