import React, { useState, useEffect } from 'react';
import { policiesAPI } from '../services/api';
import './MyPolicies.css';

const MyPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledging, setAcknowledging] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await policiesAPI.getPolicies();
      setPolicies(response.policies || []);
    } catch (err) {
      setError('Failed to load policies');
      console.error('Policies fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (policyId) => {
    try {
      setAcknowledging(policyId);
      await policiesAPI.acknowledgePolicy(policyId);

      // Update local state
      setPolicies(prevPolicies =>
        prevPolicies.map(policy =>
          policy._id === policyId
            ? { ...policy, acknowledged: true, acknowledgedAt: new Date().toISOString() }
            : policy
        )
      );
    } catch (err) {
      setError('Failed to acknowledge policy');
      console.error('Policy acknowledgment error:', err);
    } finally {
      setAcknowledging(null);
    }
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
  };

  const closeModal = () => {
    setSelectedPolicy(null);
  };

  const filteredPolicies = policies.filter(policy =>
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.category && policy.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="my-policies">
        <div className="policies-header">
          <h1>My Policies</h1>
          <p>Loading policies...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-policies">
        <div className="policies-header">
          <h1>My Policies</h1>
          <p>Error loading policies</p>
        </div>
        <div className="error-message">{error}</div>
        <button onClick={fetchPolicies} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="my-policies">
      <div className="policies-header">
        <h1>My Policies</h1>
        <p>Access and acknowledge company policies</p>
      </div>

      <div className="policies-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="policies-grid">
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map(policy => (
            <div key={policy._id || policy.id} className="policy-card">
              <div className="policy-header">
                <h3>{policy.title}</h3>
                <span className={`policy-status ${policy.acknowledged ? 'acknowledged' : 'pending'}`}>
                  {policy.acknowledged ? 'Acknowledged' : 'Pending'}
                </span>
              </div>
              <div className="policy-meta">
                <span className="category">{policy.category || 'General'}</span>
                <span className="updated">
                  Updated: {policy.updatedAt ? new Date(policy.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {policy.acknowledged && policy.acknowledgedAt && (
                <div className="acknowledgment-info">
                  Acknowledged: {new Date(policy.acknowledgedAt).toLocaleString()}
                </div>
              )}
              <div className="policy-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleViewPolicy(policy)}
                >
                  View Details
                </button>
                {!policy.acknowledged && (
                  <button
                    className="btn-primary"
                    onClick={() => handleAcknowledge(policy._id)}
                    disabled={acknowledging === policy._id}
                  >
                    {acknowledging === policy._id ? 'Acknowledging...' : 'Acknowledge'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-policies">
            <p>No policies found matching your search.</p>
          </div>
        )}
      </div>

      {selectedPolicy && (
        <div className="policy-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedPolicy.title}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="policy-details">
                <p><strong>Category:</strong> {selectedPolicy.category || 'General'}</p>
                <p><strong>Last Updated:</strong> {selectedPolicy.updatedAt ? new Date(selectedPolicy.updatedAt).toLocaleDateString() : 'N/A'}</p>
                {selectedPolicy.acknowledged && selectedPolicy.acknowledgedAt && (
                  <p><strong>Acknowledged:</strong> {new Date(selectedPolicy.acknowledgedAt).toLocaleString()}</p>
                )}
                {selectedPolicy.effectiveDate && (
                  <p><strong>Effective Date:</strong> {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="policy-content">
                <h3>Policy Content</h3>
                <p>{selectedPolicy.content || selectedPolicy.description || 'Policy content not available.'}</p>
              </div>
            </div>
            <div className="modal-footer">
              {!selectedPolicy.acknowledged && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    handleAcknowledge(selectedPolicy._id);
                    closeModal();
                  }}
                  disabled={acknowledging === selectedPolicy._id}
                >
                  {acknowledging === selectedPolicy._id ? 'Acknowledging...' : 'Acknowledge Policy'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPolicies;