import React, { useState } from 'react';
import './styles/UpdateProvisional.css'; // We will create this CSS file next
import { ShieldCheck } from 'lucide-react';

const UpdateProvisional = () => {
    const [licenseId, setLicenseId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [updatedLicense, setUpdatedLicense] = useState(null);

    const backend = "http://localhost:5000";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setUpdatedLicense(null);

        if (!licenseId.trim() || !licenseId.toUpperCase().startsWith('PL')) {
            setMessage({ type: 'error', text: 'Please enter a valid Provisional License ID (e.g., PL123).' });
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${backend}/api/admin/update-provisional`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ licenseId: licenseId.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update license status.');
            }

            setMessage({ type: 'success', text: data.message });
            setUpdatedLicense(data.license);
            setLicenseId(''); // Clear input on success

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="update-provisional-container">
            <div className="update-provisional-card">
                <h1 className="update-provisional-title">Update Provisional License</h1>
                <p className="update-provisional-subtitle">
                    Enter a Provisional License ID (PL) to convert it to a Full License (FL).
                </p>

                <form onSubmit={handleSubmit} className="update-provisional-form">
                    <div className="form-group">
                        <label htmlFor="licenseId">Provisional License ID</label>
                        <input
                            type="text"
                            id="licenseId"
                            name="licenseId"
                            value={licenseId}
                            onChange={(e) => setLicenseId(e.target.value.toUpperCase())}
                            className="form-control"
                            placeholder="e.g., PL12345"
                            required
                        />
                    </div>
                    
                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn-submit" 
                        disabled={isLoading || !licenseId}
                    >
                        {isLoading ? 'Updating...' : 'Upgrade to Full License'}
                    </button>
                </form>

                {updatedLicense && (
                    <div className="updated-license-details">
                         <div className="success-icon">
                            <ShieldCheck size={48} />
                        </div>
                        <h3>Update Successful</h3>
                        <p><strong>New License ID:</strong> {updatedLicense.license_Id}</p>
                        <p><strong>Status:</strong> <span className="status-approved">{updatedLicense.status}</span></p>
                        <p><strong>Is Provisional:</strong> {updatedLicense.isProvisional ? 'Yes' : 'No'}</p>
                        <p><strong>New Expiry Date:</strong> {new Date(updatedLicense.expiryDate).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateProvisional;
