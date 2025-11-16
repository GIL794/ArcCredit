// This file now re-exports Circle wallet hook
// MetaMask support has been replaced with Circle wallets
// For local development, Circle wallet falls back to Hardhat node
export { useCircleWallet as useWeb3 } from './useCircleWallet';


