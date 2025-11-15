import React from 'react';

function WalletConnect({ account, connecting, onConnect }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {account ? (
        <div className="loan-info">
          <div className="loan-info-row">
            <span className="loan-info-label">Connected Wallet:</span>
            <span className="loan-info-value">{account}</span>
          </div>
        </div>
      ) : (
        <button 
          className="btn btn-primary"
          onClick={onConnect}
          disabled={connecting}
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}

export default WalletConnect;
