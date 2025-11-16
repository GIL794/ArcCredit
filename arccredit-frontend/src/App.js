import React, { useState } from 'react';
import './App.css';
import { useWeb3 } from './hooks/useWeb3';
import WalletSelector from './components/WalletSelector';
import BrowserWalletPicker from './components/BrowserWalletPicker';
import LoanForm from './components/LoanForm';
import LoanStatus from './components/LoanStatus';
import RateInfo from './components/RateInfo';

function App() {
  const { 
    account, 
    connecting, 
    connect, 
    disconnect, 
    error,
    connectWithExtension,
    connectWithHardhat,
    showWalletSelector,
    closeWalletSelector
  } = useWeb3();
  const [browserPickerVisible, setBrowserPickerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">💰 ArcCredit</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {account ? (
            <>
              <div style={{ color: '#fff', fontSize: '14px' }}>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              <button 
                className="connect-btn" 
                onClick={disconnect}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                className="connect-btn" 
                onClick={() => {
                  console.log('🔌 Connect Wallet button clicked in App.js');
                  connect();
                }}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
              {error && (
                <div style={{ color: '#ffebee', fontSize: '12px' }}>
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px 20px',
          margin: '10px 20px',
          borderRadius: '4px',
          borderLeft: '4px solid #c62828',
        }}>
          <strong>Connection Error:</strong> {error}
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#b71c1c' }}>
            💡 <strong>Troubleshooting:</strong> For local development, start Hardhat with: <code>npx hardhat node</code>
          </div>
        </div>
      )}

      {!account ? (
        <div className="main-content">
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '32px' }}>Welcome to ArcCredit</h2>
            <p style={{ marginBottom: '30px', color: '#666', fontSize: '16px' }}>
              Connect your wallet to get started with programmable lending
            </p>
            {error && (
              <div style={{ 
                backgroundColor: '#ffebee', 
                color: '#c62828', 
                padding: '10px', 
                marginBottom: '20px',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
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

          {activeTab === 'create' && <LoanForm onLoanCreated={() => { setActiveTab('status'); setRefreshKey(prev => prev + 1); }} />}
          {activeTab === 'status' && <LoanStatus key={refreshKey} />}
          {activeTab === 'rates' && <RateInfo key={refreshKey} />}
        </main>
      )}

      {showWalletSelector && (
        <WalletSelector 
          onSelectMetaMask={() => {
            console.log('🔌 MetaMask option selected');
            setBrowserPickerVisible(true);
          }}
          onSelectHardhat={async () => {
            console.log('🔌 Hardhat option selected');
            try {
              await connectWithHardhat();
            } catch (err) {
              console.error('❌ Hardhat connection failed:', err);
            }
          }}
          onClose={() => {
            console.log('🔌 Wallet selector closed');
            closeWalletSelector();
          }}
          connecting={connecting}
          error={error}
        />
      )}

      {browserPickerVisible && (
        <BrowserWalletPicker
          onConnect={async (provider) => {
            try {
              await connectWithExtension(provider);
            } catch (e) {
              // error state handled in hook
            } finally {
              setBrowserPickerVisible(false);
              closeWalletSelector();
            }
          }}
          onClose={() => setBrowserPickerVisible(false)}
          connecting={connecting}
          error={error}
        />
      )}

      <footer className="footer">
        <p>ArcCredit © 2025 | Programmable Money for SMB Lending | Arc Blockchain</p>
      </footer>
    </div>
  );
}

export default App;
