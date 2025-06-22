import React, { useState, useEffect } from 'react';
import './styles/fee.css'; // We will create this CSS file next

const FeeSetup = () => {
    const [fees, setFees] = useState({ newRegistrationFee: '', renewalFee: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [originalFees, setOriginalFees] = useState(null);

    const backend = "http://localhost:5000";

    const fetchFees = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${backend}/api/admin/fees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch fees.');
            }
            const data = await response.json();
            setFees({
                newRegistrationFee: data.newRegistrationFee || '',
                renewalFee: data.renewalFee || ''
            });
            setOriginalFees(data); // Store original fees
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Could not load fee data.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            setFees(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!fees.newRegistrationFee || !fees.renewalFee) {
            setMessage({ type: 'error', text: 'All fee fields are required.' });
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${backend}/api/admin/fees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newRegistrationFee: Number(fees.newRegistrationFee),
                    renewalFee: Number(fees.renewalFee)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update fees.');
            }

            setMessage({ type: 'success', text: 'Fees updated successfully!' });
            setOriginalFees({ // Update original fees on successful save
                newRegistrationFee: fees.newRegistrationFee,
                renewalFee: fees.renewalFee
            });

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Check if form values are different from the initially fetched values
    const hasChanges = originalFees ? 
        (String(fees.newRegistrationFee) !== String(originalFees.newRegistrationFee) ||
         String(fees.renewalFee) !== String(originalFees.renewalFee))
        : false;

    return (
        <div className="fee-setup-container">
            <div className="fee-setup-card">
                <h1 className="fee-setup-title">License Fee Setup</h1>
                <p className="fee-setup-subtitle">
                    Update the base fees for new license registrations and renewals.
                </p>

                {isLoading && <div className="loader">Loading...</div>}
                
                {!isLoading && (
                    <form onSubmit={handleSubmit} className="fee-setup-form">
                        <div className="form-group">
                            <label htmlFor="newRegistrationFee">New Registration Fee (₹)</label>
                            <input
                                type="text"
                                id="newRegistrationFee"
                                name="newRegistrationFee"
                                value={fees.newRegistrationFee}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="e.g., 200"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="renewalFee">Renewal Fee (₹)</label>
                            <input
                                type="text"
                                id="renewalFee"
                                name="renewalFee"
                                value={fees.renewalFee}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="e.g., 100"
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
                            disabled={isLoading || !hasChanges}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeeSetup;
