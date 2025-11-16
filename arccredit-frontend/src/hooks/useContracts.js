import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import USDC_ABI from '../abis/USDC.json';
import EURC_ABI from '../abis/EURC.json';
import RATE_MODEL_ABI from '../abis/InterestRateModel.json';
import LENDING_ABI from '../abis/ArcCreditCore.json';

// Addresses will be loaded from deployment.json dynamically if env vars are missing

// Get addresses from environment variables (primary source)
let USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS;
let EURC_ADDRESS = process.env.REACT_APP_EURC_ADDRESS;
let RATE_MODEL_ADDRESS = process.env.REACT_APP_RATE_MODEL_ADDRESS;
let LENDING_ADDRESS = process.env.REACT_APP_LENDING_ADDRESS;

// Try to load from deployment.json immediately (synchronous if possible, async as fallback)
let deploymentDataLoaded = false;
let deploymentData = null;

// Load deployment.json immediately on module load
(async () => {
  try {
    const response = await fetch('/deployment.json');
    if (response.ok) {
      deploymentData = await response.json();
      deploymentDataLoaded = true;
      
      // Use deployment.json addresses if env vars are missing
      if (!USDC_ADDRESS && deploymentData.usdc) {
        USDC_ADDRESS = deploymentData.usdc;
        console.log('✅ Loaded USDC address from deployment.json');
      }
      if (!EURC_ADDRESS && deploymentData.eurc) {
        EURC_ADDRESS = deploymentData.eurc;
        console.log('✅ Loaded EURC address from deployment.json');
      }
      if (!RATE_MODEL_ADDRESS && deploymentData.rateModel) {
        RATE_MODEL_ADDRESS = deploymentData.rateModel;
        console.log('✅ Loaded RateModel address from deployment.json');
      }
      if (!LENDING_ADDRESS && deploymentData.lending) {
        LENDING_ADDRESS = deploymentData.lending;
        console.log('✅ Loaded Lending address from deployment.json');
      }
    }
  } catch (e) {
    // deployment.json not accessible, that's okay - will try again in hook
  }
})();

// Function to load addresses from deployment.json if env vars are missing (fallback)
const loadAddressesFromDeployment = async () => {
  // If already loaded, return cached data
  if (deploymentDataLoaded && deploymentData) {
    return {
      usdc: deploymentData.usdc,
      eurc: deploymentData.eurc,
      rateModel: deploymentData.rateModel,
      lending: deploymentData.lending,
    };
  }
  
  try {
    const response = await fetch('/deployment.json');
    if (response.ok) {
      const data = await response.json();
      deploymentData = data;
      deploymentDataLoaded = true;
      return {
        usdc: data.usdc,
        eurc: data.eurc,
        rateModel: data.rateModel,
        lending: data.lending,
      };
    }
  } catch (e) {
    // deployment.json not accessible, that's okay
  }
  return null;
};

// Environment variable validation (only log in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Contract addresses loaded:', {
    USDC_ADDRESS: USDC_ADDRESS ? `${USDC_ADDRESS.slice(0, 6)}...${USDC_ADDRESS.slice(-4)}` : 'NOT SET',
    EURC_ADDRESS: EURC_ADDRESS ? `${EURC_ADDRESS.slice(0, 6)}...${EURC_ADDRESS.slice(-4)}` : 'NOT SET',
    RATE_MODEL_ADDRESS: RATE_MODEL_ADDRESS ? `${RATE_MODEL_ADDRESS.slice(0, 6)}...${RATE_MODEL_ADDRESS.slice(-4)}` : 'NOT SET',
    LENDING_ADDRESS: LENDING_ADDRESS ? `${LENDING_ADDRESS.slice(0, 6)}...${LENDING_ADDRESS.slice(-4)}` : 'NOT SET',
  });
}

export const useContracts = (signer, provider = null) => {
  const [contracts, setContracts] = useState(null);

  useEffect(() => {
    // For Circle wallets, we can use provider even without signer for read operations
    // Signer is optional - we'll use provider for read-only operations
    const contractProvider = signer || provider;

    console.log('🔗 useContracts: Effect triggered', {
      hasSigner: !!signer,
      hasProvider: !!provider,
      hasContractProvider: !!contractProvider,
      signerType: signer ? signer.constructor.name : 'null',
      providerType: provider ? provider.constructor.name : 'null'
    });

    if (!contractProvider) {
      console.log('⚠️ useContracts: No provider or signer available yet');
      console.log('⚠️ This means contracts cannot be initialized. Waiting for provider...');
      setContracts(null);
      return;
    }
    
    console.log('🔗 useContracts: Provider available, initializing contracts...');
    console.log('🔗 Contract provider type:', contractProvider.constructor.name);

    // Initialize contracts asynchronously
    const initializeContracts = async () => {
      try {
        console.log('📋 Starting contract initialization...');
        
        // Skip connectivity check - it can cause timeouts
        // Contracts will work if provider is valid, and will fail with clear errors if not
        console.log('📋 Initializing contracts without connectivity check (will verify on first use)');
      
        // Get addresses - try env vars first, then deployment.json
        let usdcAddress = USDC_ADDRESS;
        let eurcAddress = EURC_ADDRESS;
        let rateModelAddress = RATE_MODEL_ADDRESS;
        let lendingAddress = LENDING_ADDRESS;

        console.log('📋 Initial addresses:', {
          usdc: usdcAddress ? `${usdcAddress.slice(0, 6)}...${usdcAddress.slice(-4)}` : 'NOT SET',
          eurc: eurcAddress ? `${eurcAddress.slice(0, 6)}...${eurcAddress.slice(-4)}` : 'NOT SET',
          rateModel: rateModelAddress ? `${rateModelAddress.slice(0, 6)}...${rateModelAddress.slice(-4)}` : 'NOT SET',
          lending: lendingAddress ? `${lendingAddress.slice(0, 6)}...${lendingAddress.slice(-4)}` : 'NOT SET',
        });

        // If env vars are missing, try to load from deployment.json
        if (!usdcAddress || !eurcAddress || !rateModelAddress || !lendingAddress) {
          console.log('📡 Some addresses missing, trying to load from deployment.json...');
          const deploymentData = await loadAddressesFromDeployment();
          
          if (deploymentData) {
            console.log('✅ Loaded addresses from deployment.json:', {
              usdc: deploymentData.usdc ? `${deploymentData.usdc.slice(0, 6)}...${deploymentData.usdc.slice(-4)}` : 'missing',
              eurc: deploymentData.eurc ? `${deploymentData.eurc.slice(0, 6)}...${deploymentData.eurc.slice(-4)}` : 'missing',
              rateModel: deploymentData.rateModel ? `${deploymentData.rateModel.slice(0, 6)}...${deploymentData.rateModel.slice(-4)}` : 'missing',
              lending: deploymentData.lending ? `${deploymentData.lending.slice(0, 6)}...${deploymentData.lending.slice(-4)}` : 'missing',
            });
            usdcAddress = usdcAddress || deploymentData.usdc;
            eurcAddress = eurcAddress || deploymentData.eurc;
            rateModelAddress = rateModelAddress || deploymentData.rateModel;
            lendingAddress = lendingAddress || deploymentData.lending;
          } else {
            console.warn('⚠️ Could not load deployment.json. Make sure it exists in public folder.');
          }
        }

        // Check if addresses are configured
        const missingAddresses = [];
        if (!usdcAddress) missingAddresses.push('REACT_APP_USDC_ADDRESS');
        if (!eurcAddress) missingAddresses.push('REACT_APP_EURC_ADDRESS');
        if (!rateModelAddress) missingAddresses.push('REACT_APP_RATE_MODEL_ADDRESS');
        if (!lendingAddress) missingAddresses.push('REACT_APP_LENDING_ADDRESS');
        
        if (missingAddresses.length > 0) {
          console.error('❌ Missing contract addresses:', missingAddresses.join(', '));
          console.error('Please set these environment variables in arccredit-frontend/.env or ensure deployment.json is accessible');
          setContracts(null);
          return;
        }

        // Use signer if available (for write operations), otherwise use provider (read-only)
        const usdc = new ethers.Contract(usdcAddress, USDC_ABI, contractProvider);
        const eurc = new ethers.Contract(eurcAddress, EURC_ABI, contractProvider);
        const rateModel = new ethers.Contract(rateModelAddress, RATE_MODEL_ABI, contractProvider);
        const lending = new ethers.Contract(lendingAddress, LENDING_ABI, contractProvider);

        // Skip contract verification - it's causing timeouts and contracts will work anyway
        // Verification is optional and non-critical - actual contract calls will fail if contracts don't exist
        console.log('📋 Skipping contract verification (non-blocking) - contracts will be initialized immediately');
        console.log('📋 Contract addresses:', {
          usdc: usdcAddress,
          eurc: eurcAddress,
          rateModel: rateModelAddress,
          lending: lendingAddress
        });
        console.log('💡 If contract calls fail, verify Hardhat node is running: npx hardhat node');

        setContracts({ usdc, eurc, rateModel, lending });
        console.log('✅ Contracts initialized successfully', {
          usdc: usdcAddress,
          eurc: eurcAddress,
          rateModel: rateModelAddress,
          lending: lendingAddress
        });
      } catch (error) {
        console.error('❌ Failed to initialize contracts:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack?.substring(0, 200)
        });
        setContracts(null);
      }
    };

    // Add timeout for entire initialization
    const initPromise = initializeContracts();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Contract initialization timeout after 15 seconds')), 15000)
    );
    
    Promise.race([initPromise, timeoutPromise]).catch(err => {
      console.error('❌ Contract initialization error:', err);
      console.error('💡 This might mean:');
      console.error('   1. Hardhat node is not running or not accessible');
      console.error('   2. Network connection is slow');
      console.error('   3. Contract addresses are incorrect');
      console.error('💡 Try: Check if Hardhat node is running: npx hardhat node');
      setContracts(null);
    });
  }, [signer, provider]);

  return contracts;
};

