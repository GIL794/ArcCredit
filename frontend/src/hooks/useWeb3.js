import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();
      
      setAccount(accounts[0]); // Set first account address as string
      setProvider(ethProvider);
      setSigner(ethSigner);
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  return { account, provider, signer, connecting, connect };
};
