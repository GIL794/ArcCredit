import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import USDC_ABI from '../abis/USDC.json';
import EURC_ABI from '../abis/EURC.json';
import RATE_MODEL_ABI from '../abis/InterestRateModel.json';
import LENDING_ABI from '../abis/ArcCreditCore.json';

const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS;
const EURC_ADDRESS = process.env.REACT_APP_EURC_ADDRESS;
const RATE_MODEL_ADDRESS = process.env.REACT_APP_RATE_MODEL_ADDRESS;
const LENDING_ADDRESS = process.env.REACT_APP_LENDING_ADDRESS;

export const useContracts = (signer) => {
  const [contracts, setContracts] = useState(null);

  useEffect(() => {
    if (!signer) {
      setContracts(null);
      return;
    }

    // Check if addresses are configured
    if (!USDC_ADDRESS || !EURC_ADDRESS || !RATE_MODEL_ADDRESS || !LENDING_ADDRESS) {
      console.warn('Contract addresses not configured. Set REACT_APP_USDC_ADDRESS, REACT_APP_EURC_ADDRESS, REACT_APP_RATE_MODEL_ADDRESS, and REACT_APP_LENDING_ADDRESS environment variables.');
      setContracts(null);
      return;
    }

    try {
      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const eurc = new ethers.Contract(EURC_ADDRESS, EURC_ABI, signer);
      const rateModel = new ethers.Contract(RATE_MODEL_ADDRESS, RATE_MODEL_ABI, signer);
      const lending = new ethers.Contract(LENDING_ADDRESS, LENDING_ABI, signer);

      setContracts({ usdc, eurc, rateModel, lending });
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      setContracts(null);
    }
  }, [signer]);

  return contracts;
};
