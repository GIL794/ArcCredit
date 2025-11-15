import React, { useState, useEffect } from 'react';
import './index.css';
import WalletConnect from './components/WalletConnect';
import LoanForm from './components/LoanForm';
import LoanStatus from './components/LoanStatus';
import RateInfo from './components/RateInfo';
import { useWeb3 } from './hooks/useWeb3';

function App() {
  const { account, connecting, connect } = useWeb3();
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="app">
      <header className="header">
        <div className="logo">💰 ArcCredit</div>
        <div>
          {account ? (
            <div style={{ color: '#333', fontSize: '14px' }}>
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          ) : (
            <button 
              className="connect-btn" 
              onClick={connect}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {!account ? (
        <div className="main-content">
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '32px' }}>Welcome to ArcCredit</h2>
            <p style={{ marginBottom: '30px', color: '#666', fontSize: '16px' }}>
              Connect your wallet to get started with programmable lending
            </p>
            <button 
              className="btn btn-primary" 
              onClick={connect}
              style={{ maxWidth: '300px', margin: '0 auto' }}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      ) : (
        <main className="main-content">
          <div style={{ marginBottom: '30px' }}>
            <h1 className="section-title">Multi-Stablecoin Lending Platform</h1>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('create')}
                style={{ flex: 1 }}
              >
                Create Loan
              </button>
              <button 
                className={`btn ${activeTab === 'status' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('status')}
                style={{ flex: 1 }}
              >
                Loan Status
              </button>
              <button 
                className={`btn ${activeTab === 'rates' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('rates')}
                style={{ flex: 1 }}
              >
                Interest Rates
              </button>
            </div>
          </div>

          {activeTab === 'create' && <LoanForm />}
          {activeTab === 'status' && <LoanStatus />}
          {activeTab === 'rates' && <RateInfo />}
        </main>
      )}

      <footer className="footer">
        <p>ArcCredit © 2025 | Programmable Money for SMB Lending | Arc Blockchain</p>
      </footer>
    </div>
  );
}

export default App;
