# Wallet Connection Setup Guide

## Overview

The ArcCredit frontend now supports multiple wallet connection methods:

1. **Browser Extensions** (MetaMask, Trust Wallet, etc.)
2. **Local Hardhat Node** (for development)
3. **Direct RPC Connection** (configured via environment variables)

## Setup Instructions

### Option 1: Using MetaMask Browser Extension (Recommended)

#### Prerequisites
- Install [MetaMask](https://metamask.io/) browser extension
- Have some ETH or USDC on the network you want to use

#### Steps
1. Install MetaMask from the official website
2. Create or import a wallet
3. Go to http://localhost:3000
4. Click "Connect Wallet" button
5. MetaMask will prompt you to authorize the connection
6. Approve and you're connected!

#### Network Configuration in MetaMask
For local development, add Hardhat as a custom network:

**For Local Hardhat Node:**
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

### Option 2: Using Local Hardhat Node

#### Prerequisites
- Have Hardhat installed (`npm install -g hardhat`)
- Terminal 1 running: `npx hardhat node`

#### Steps
1. Start Hardhat node in a separate terminal
2. Go to http://localhost:3000
3. Click "Connect Wallet" button
4. The app will automatically detect and connect to the local node
5. It will use the first available account from Hardhat

#### Starting Hardhat Node
```bash
cd /path/to/ArcCredit
npx hardhat node
```

The console will show 20 test accounts with private keys. You can import any of these into MetaMask if needed.

### Option 3: Using Environment Variables

If you want to specify a custom RPC URL, create `.env.local` in the `arccredit-frontend` directory:

```env
REACT_APP_RPC_URL=http://your-rpc-url:8545
REACT_APP_CHAIN_ID=31337
```

## Environment Variables Reference

Create `arccredit-frontend/.env` or `arccredit-frontend/.env.local`:

```env
# Smart Contract Addresses (Required for functionality)
REACT_APP_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_EURC_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
REACT_APP_RATE_MODEL_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
REACT_APP_LENDING_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

# Network Configuration (Optional, defaults to local Hardhat)
REACT_APP_RPC_URL=http://127.0.0.1:8545
REACT_APP_CHAIN_ID=31337
```

## Troubleshooting

### "No Web3 wallet extension found"
- **Solution**: Install MetaMask or configure a local Hardhat node
- **Installation**: https://metamask.io/

### "No accounts available on local node"
- **Solution**: Make sure Hardhat node is running: `npx hardhat node`
- **Location**: Run in a separate terminal in the project root directory

### "Failed to connect to local node"
- **Check**: Is Hardhat node running on http://127.0.0.1:8545?
- **Solution**: Start it with: `npx hardhat node`
- **Verify**: You should see 20 accounts listed in the terminal

### "Contract addresses not configured"
- **Solution**: Deploy contracts first: `npx hardhat run scripts/deploy.js`
- **Then**: Copy the output addresses to `arccredit-frontend/.env`

### Connection keeps failing
1. Clear browser cache and local storage
2. Disable any VPN or proxy
3. Check browser console (F12) for detailed error messages
4. Ensure MetaMask is unlocked
5. Verify contract addresses are correct in `.env`

## Development Workflow

### Terminal 1: Smart Contracts & Node
```bash
cd ArcCredit
npx hardhat node
```

### Terminal 2: Frontend
```bash
cd ArcCredit/arccredit-frontend
npm start
```

The frontend will automatically:
1. Try to connect via MetaMask (if installed)
2. Fallback to local Hardhat node
3. Display helpful error messages if neither works

## Supported Networks

| Network | Setup | Use Case |
|---------|-------|----------|
| Local Hardhat | `npx hardhat node` | Development & Testing |
| MetaMask | Browser Extension | Production-like Testing |
| Hardhat (Built-in) | Automatic | Quick Testing |

## Security Notes

- **Development Only**: The .env file contains test contract addresses. These are for local development only.
- **Never Share Private Keys**: Don't commit private keys to version control
- **Test Accounts**: Hardhat provides unlimited test accounts for development
- **Browser Extension**: MetaMask stores your keys securely in the browser

## Getting Test Funds

### For Local Hardhat
- Automatically get 10,000 ETH on startup
- No additional setup needed

### For Testnet (if deploying to Circle/Arc Network)
- Check the network's official faucet
- Usually provides free test USDC/EURC
