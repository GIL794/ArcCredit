import React from 'react';
import './WalletSelector.css';

export const WalletSelector = ({ 
  onSelectMetaMask, 
  onSelectHardhat, 
  onClose,
  connecting,
  error 
}) => {
  return (
    <div className="wallet-selector-overlay">
      <div className="wallet-selector-modal">
        <div className="wallet-selector-header">
          <h2>Select a Wallet</h2>
          <button 
            className="wallet-selector-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="wallet-selector-content">
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Choose how you want to connect to ArcCredit
          </p>

          <div className="wallet-options">
            {/* MetaMask Option */}
            <button
              className="wallet-option"
              onClick={onSelectMetaMask}
              disabled={connecting}
              title="Connect with MetaMask or other browser wallet extensions"
            >
              <div className="wallet-icon">🦊</div>
              <div className="wallet-info">
                <div className="wallet-name">Browser Wallet</div>
                <div className="wallet-description">
                  MetaMask, Trust Wallet, etc.
                </div>
              </div>
              {connecting && (
                <div className="connecting-spinner">⟳</div>
              )}
            </button>

            {/* Hardhat Local Node Option */}
            <button
              className="wallet-option"
              onClick={onSelectHardhat}
              disabled={connecting}
              title="Connect to local Hardhat development node"
            >
              <div className="wallet-icon">⚙️</div>
              <div className="wallet-info">
                <div className="wallet-name">Local Node</div>
                <div className="wallet-description">
                  Hardhat development environment
                </div>
              </div>
              {connecting && (
                <div className="connecting-spinner">⟳</div>
              )}
            </button>
          </div>

          {error && (
            <div className="wallet-selector-error">
              <strong>Connection Error:</strong> {error}
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                💡 <strong>Troubleshooting:</strong>
                <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                  <li>For Browser Wallet: Install MetaMask extension</li>
                  <li>For Local Node: Run <code>npx hardhat node</code> in another terminal</li>
                </ul>
              </div>
            </div>
          )}

          <div className="wallet-selector-footer">
            <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
              Your wallet connection is private and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSelector;
