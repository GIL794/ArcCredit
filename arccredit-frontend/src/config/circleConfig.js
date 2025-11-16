// Circle Wallet Configuration
// Note: You'll need to set up a backend server to generate user tokens
// For local development, the app will fallback to standard provider/signer

export const circleConfig = {
  apiKey: process.env.REACT_APP_CIRCLE_API_KEY || '',
  // For local development, you may need to set up a local backend
  // that generates user tokens for Circle wallets
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
  // Supported blockchains - using ETH for mainnet, ETH-SEPOLIA for testnet
  // For local Hardhat (31337), we'll use a fallback
  blockchain: process.env.REACT_APP_CHAIN_ID === '31337' ? 'ETH-SEPOLIA' : 'ETH',
  // Allow local development without Circle API key
  allowLocalFallback: true,
};

