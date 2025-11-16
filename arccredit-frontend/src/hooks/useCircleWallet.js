import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * useCircleWallet Hook
 * 
 * Simplified wallet hook using ethers.js
 * Works with MetaMask, Hardhat local node, and other Web3 providers
 * Circle wallet support can be added later as an optional integration
 */
export const useCircleWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const initializeProvider = useCallback(async (address) => {
    try {
      console.log('🔧 initializeProvider called with address:', address);
      const rpcUrl = process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8545';
      console.log('🔧 Creating provider for RPC:', rpcUrl);
      
      // Create provider
      const newProvider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Verify provider is working by checking network
      try {
        const network = await newProvider.getNetwork();
        console.log('✅ Provider connected to network:', network.name, network.chainId);
      } catch (networkErr) {
        console.warn('⚠️ Could not get network info:', networkErr);
        // Continue anyway - provider might still work
      }
      
      setProvider(newProvider);
      console.log('✅ Provider set in initializeProvider');
      
      // Ensure address is a string
      const addressString = typeof address === 'string' ? address : String(address);
      
      // Try to get a signer - first try by index 0 (most common for Hardhat)
      try {
        const signerByIndex = await newProvider.getSigner(0);
        const signerAddress = await signerByIndex.getAddress();
        
        if (signerAddress.toLowerCase() === addressString.toLowerCase()) {
          setSigner(signerByIndex);
          console.log('✅ Signer set using index 0, address:', signerAddress);
        } else {
          // Try by address string
          try {
            const signerByAddress = await newProvider.getSigner(addressString);
            setSigner(signerByAddress);
            console.log('✅ Signer set by address:', addressString);
          } catch (addrErr) {
            console.warn('⚠️ Could not create signer by address:', addrErr.message);
            // Still set signer by index even if address doesn't match
            setSigner(signerByIndex);
            console.log('✅ Signer set using index 0 (address mismatch, but signer available)');
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not create signer:', err.message);
        setSigner(null);
      }
    } catch (err) {
      console.error('❌ Failed to initialize provider:', err);
      setProvider(null);
      setSigner(null);
    }
  }, []);

  // Restore previous connection on mount
  useEffect(() => {
    // Only run once on mount
    const storedAddress = localStorage.getItem('wallet_address');
    const storedWalletType = localStorage.getItem('wallet_type');
    
    console.log('🔄 useCircleWallet: Checking stored connection on mount', {
      storedAddress,
      storedWalletType,
      currentAccount: account,
      currentProvider: !!provider
    });
    
    if (!storedAddress) {
      console.log('ℹ️ No stored wallet connection found');
      return;
    }
    
    // Restore Hardhat connection ONLY
    if (storedWalletType === 'hardhat' && !account) {
      console.log('🔄 Restoring Hardhat connection:', storedAddress);
      setAccount(storedAddress);
      // Initialize provider immediately
      console.log('🔄 Initializing provider for stored Hardhat connection');
      initializeProvider(storedAddress);
    } 
    // For extension wallets, clear storage - require manual reconnection
    else if (storedWalletType === 'extension') {
      console.log('ℹ️ Extension wallet found in storage - clearing to require manual reconnection');
      localStorage.removeItem('wallet_address');
      localStorage.removeItem('wallet_type');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  /**
   * Connect using browser extension (MetaMask, etc.)
   */
  const connectWithExtension = useCallback(async (injectedProvider = null) => {
    setConnecting(true);
    setError(null);
    setShowWalletSelector(false);

    try {
      const eth = injectedProvider || window.ethereum;
      if (!eth) {
        throw new Error('No Web3 wallet extension found. Please install MetaMask or similar.');
      }

      // Request account access
      const accounts = await eth.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available');
      }

      const address = accounts[0];
      const web3Provider = new ethers.BrowserProvider(eth);
      const web3Signer = await web3Provider.getSigner();

      console.log('✅ Wallet connected (Extension):', address);
      console.log('✅ Setting account, provider, and signer...');
      
      // Set all states
      setAccount(address);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setError(null);
      
      // Save to localStorage
      localStorage.setItem('wallet_address', address);
      localStorage.setItem('wallet_type', 'extension');
      
      console.log('✅ Extension wallet fully connected:', {
        account: address,
        hasProvider: !!web3Provider,
        hasSigner: !!web3Signer
      });
    } catch (err) {
      const errorMsg = err.message || 'Failed to connect to wallet extension';
      console.error('Extension connection error:', err);
      setError(errorMsg);
      throw err;
    } finally {
      setConnecting(false);
    }
  }, []);

  /**
   * Connect to local Hardhat node
   */
  const connectWithHardhat = useCallback(async () => {
    setConnecting(true);
    setError(null);
    setShowWalletSelector(false);

    try {
      const rpcUrl = process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8545';
      const newProvider = new ethers.JsonRpcProvider(rpcUrl);
      
      // For Hardhat node, we can directly use getSigner(0) to get the first account
      try {
        const newSigner = await newProvider.getSigner(0);
        const address = await newSigner.getAddress();
        
        console.log('✅ Wallet connected (Hardhat):', address);
        setAccount(address);
        setProvider(newProvider);
        setSigner(newSigner);
        localStorage.setItem('wallet_address', address);
        localStorage.setItem('wallet_type', 'hardhat');
        setError(null);
        console.log('✅ Provider and signer set for Hardhat wallet');
      } catch (signerError) {
        // If getSigner(0) fails, try alternative method
        console.warn('getSigner(0) failed, trying RPC method:', signerError);
        
        try {
          // Try to get accounts via RPC
          const accounts = await newProvider.send('eth_accounts', []);
          
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            const addressString = typeof address === 'string' ? address : String(address);
            const newSigner = await newProvider.getSigner(addressString);
            
            console.log('✅ Wallet connected (Hardhat RPC):', addressString);
            setAccount(addressString);
            setProvider(newProvider);
            setSigner(newSigner);
            localStorage.setItem('wallet_address', addressString);
            localStorage.setItem('wallet_type', 'hardhat');
            console.log('✅ Provider and signer set for Hardhat wallet (RPC method)');
          } else {
            throw new Error('No accounts available. Make sure Hardhat node is running: npx hardhat node');
          }
        } catch (rpcError) {
          throw new Error(`Could not connect to wallet. Make sure Hardhat node is running: npx hardhat node. Error: ${signerError.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to connect to Hardhat:', err);
      setError(`Connection failed: ${err.message}`);
      throw err;
    } finally {
      setConnecting(false);
    }
  }, []);

  /**
   * Show wallet selector modal
   */
  const connect = useCallback(() => {
    console.log('🔌 Connect button clicked - showing wallet selector');
    setShowWalletSelector(true);
    console.log('✅ Wallet selector state set to true');
  }, []);

  /**
   * Close wallet selector
   */
  const closeWalletSelector = useCallback(() => {
    setShowWalletSelector(false);
  }, []);

  // Force provider initialization if account is set but provider isn't
  useEffect(() => {
    if (account && !provider) {
      const storedWalletType = localStorage.getItem('wallet_type');
      
      console.log('⚠️ Account is set but provider is missing. Wallet type:', storedWalletType);
      
      // Initialize provider for Hardhat
      if (storedWalletType === 'hardhat') {
        console.log('🔧 Initializing Hardhat provider for account:', account);
        const initProvider = async () => {
          try {
            const rpcUrl = process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8545';
            const newProvider = new ethers.JsonRpcProvider(rpcUrl);
            setProvider(newProvider);
            console.log('✅ Hardhat provider created');
            
            // Try to get signer
            try {
              const signer = await newProvider.getSigner(0);
              const signerAddress = await signer.getAddress();
              if (signerAddress.toLowerCase() === account.toLowerCase()) {
                setSigner(signer);
                console.log('✅ Signer created for Hardhat');
              } else {
                // Try to get signer by address
                try {
                  const signerByAddress = await newProvider.getSigner(account);
                  setSigner(signerByAddress);
                  console.log('✅ Signer created by address');
                } catch (addrErr) {
                  console.warn('Could not create signer by address:', addrErr);
                }
              }
            } catch (err) {
              console.warn('Could not create signer:', err);
            }
          } catch (err) {
            console.error('❌ Failed to initialize Hardhat provider:', err);
          }
        };
        
        initProvider();
      } 
      // For extension wallets, don't auto-reconnect - require manual connection
      else if (storedWalletType === 'extension') {
        console.log('ℹ️ Extension wallet account found without provider - clearing to require manual reconnection');
        setAccount(null);
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('wallet_type');
      }
      // Unknown wallet type - clear connection
      else if (storedWalletType) {
        console.warn('⚠️ Unknown wallet type:', storedWalletType, '- clearing connection');
        setAccount(null);
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('wallet_type');
      }
      // No wallet type stored - clear connection
      else {
        console.warn('⚠️ Account is set but no wallet type in storage - clearing connection');
        setAccount(null);
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('wallet_type');
      }
    }
  }, [account, provider, connectWithExtension]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_type');
  }, []);

  return {
    account,
    provider,
    signer,
    connecting,
    error,
    connect,
    disconnect,
    connectWithExtension,
    connectWithHardhat,
    showWalletSelector,
    closeWalletSelector,
  };
};


