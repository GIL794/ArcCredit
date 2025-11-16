import React, { useEffect, useState } from 'react';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

// Reuse WalletSelector.css for styles
const detectProviderName = (p) => {
  if (!p) return 'Browser Wallet';
  if (p.isMetaMask) return 'MetaMask';
  if (p.isCoinbaseWallet) return 'Coinbase Wallet';
  if (p.isBraveWallet) return 'Brave Wallet';
  if (p.isFrame) return 'Frame';
  if (p.isTally) return 'Tally';
  return 'Browser Wallet';
};

export const BrowserWalletPicker = ({ onConnect, onClose, connecting, error }) => {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    // Modern multiple-injected-wallets pattern
    if (window.ethereum && window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      setProviders(window.ethereum.providers);
    } else if (window.ethereum) {
      // single injected provider
      setProviders([window.ethereum]);
    } else {
      setProviders([]);
    }
  }, []);

  return (
    <div className="wallet-selector-overlay">
      <div className="wallet-selector-modal">
        <div className="wallet-selector-header">
          <h2>Choose Browser Wallet</h2>
          <button className="wallet-selector-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="wallet-selector-content">
          <p style={{ color: '#666', marginBottom: '12px' }}>Select which injected wallet to use for this session.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {providers.length === 0 && (
              <div style={{ color: '#666' }}>
                No injected browser wallet detected. Install MetaMask or use WalletConnect.
              </div>
            )}

            {providers.map((p, idx) => (
              <div key={idx} className="wallet-option" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="wallet-icon">🦊</div>
                  <div className="wallet-info">
                    <div className="wallet-name">{detectProviderName(p)}</div>
                    <div className="wallet-description">Injected browser wallet</div>
                  </div>
                </div>
                <div>
                  <button onClick={() => onConnect(p)} className="btn btn-primary" disabled={connecting}>
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}

            {/* WalletConnect option (dynamic import) */}
            <div className="wallet-option" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="wallet-icon">🔗</div>
                <div className="wallet-info">
                  <div className="wallet-name">WalletConnect</div>
                  <div className="wallet-description">Scan QR or connect mobile wallets</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                {!(process.env.REACT_APP_WC_PROJECT_ID) ? (
                  <>
                    <div style={{ color: '#b14', fontSize: '12px', maxWidth: '300px', textAlign: 'right' }}>
                      WalletConnect requires a Project ID. Get one at{' '}
                      <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>
                        cloud.walletconnect.com
                      </a>
                      , then set <code>REACT_APP_WC_PROJECT_ID</code> in your <code>.env</code> and restart.
                    </div>
                    <button className="btn btn-primary" disabled style={{ opacity: 0.6 }}>
                      Connect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const mod = await import('@walletconnect/ethereum-provider');
                        const WalletConnectProvider = mod.default || mod;
                        const projectId = process.env.REACT_APP_WC_PROJECT_ID;
                        const chainId = Number(process.env.REACT_APP_CHAIN_ID || 31337);
                        const rpcUrl = process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8545';

                        // Initialize the WalletConnect v2 provider (EthereumProvider)
                        const wcProvider = await WalletConnectProvider.init({
                          projectId,
                          chains: [chainId],
                          showQrModal: true,
                          rpcMap: {
                            [chainId]: rpcUrl,
                          },
                        });

                        // Connect will show QR modal when needed
                        await wcProvider.connect();

                        // wcProvider is EIP-1193 compatible; pass to onConnect
                        await onConnect(wcProvider);
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('WalletConnect v2 connect error (ensure @walletconnect/ethereum-provider is installed and REACT_APP_WC_PROJECT_ID is set):', e);
                        alert('WalletConnect connection failed. Make sure `@walletconnect/ethereum-provider` is installed and `REACT_APP_WC_PROJECT_ID` is configured in .env.');
                      }
                    }}
                    className="btn btn-primary"
                    disabled={connecting}
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            {/* Coinbase Wallet option (dynamic import) */}
            <div className="wallet-option" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="wallet-icon">🏦</div>
                <div className="wallet-info">
                  <div className="wallet-name">Coinbase Wallet</div>
                  <div className="wallet-description">Connect with Coinbase Wallet</div>
                </div>
              </div>
              <div>
                <button
                  onClick={async () => {
                    try {
                      const coinbase = new CoinbaseWalletSDK({ appName: 'ArcCredit' });
                      const cbProvider = coinbase.makeWeb3Provider(
                        process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8545',
                        Number(process.env.REACT_APP_CHAIN_ID || 31337)
                      );
                      // request accounts from provider
                      await cbProvider.request({ method: 'eth_requestAccounts' });
                      await onConnect(cbProvider);
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error('Coinbase Wallet connect error:', e);
                      // show a helpful alert with the exception message for diagnostics
                      alert(`Coinbase Wallet connection failed: ${e && e.message ? e.message : String(e)}.`);
                    }
                  }}
                  className="btn btn-primary"
                  disabled={connecting}
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>

          </div>

          {error && (
            <div className="wallet-selector-error" style={{ marginTop: '12px' }}>
              <strong>Connection Error:</strong> {error}
            </div>
          )}

          <div style={{ marginTop: '18px', textAlign: 'right' }}>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserWalletPicker;
