# ArcCredit Deployment Guide

Complete step-by-step guide for deploying ArcCredit smart contracts and configuring the frontend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Network Configuration](#network-configuration)
3. [Local Hardhat Deployment](#local-hardhat-deployment)
4. [Circle Faucet Testnet Deployment](#circle-faucet-testnet-deployment)
5. [Arc Network Deployment](#arc-network-deployment)
6. [Frontend Configuration](#frontend-configuration)
7. [Testing the Deployment](#testing-the-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: latest version

### Install Dependencies

```bash
cd ArcCredit
npm install
cd arccredit-frontend
npm install
cd ..
```


### Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate or import a test private key:**
   - For local testing: Use any key (Hardhat provides test accounts)
   - For testnet: Import a wallet with testnet funds
   
   ```bash
   # Edit .env and set:
   PRIVATE_KEY=your_private_key_here
   ```

---

## Network Configuration

### Supported Networks

| Network | Chain ID | RPC URL | Use Case |
|---------|----------|---------|----------|
| **Hardhat (Local)** | 31337 | http://127.0.0.1:8545 | Development & Testing |
| **Circle Faucet** | 5042002 | https://rpc.usdc.circle.com | Testnet with USDC |
| **Arc Testnet** | TBD | https://rpc.testnet.arc.network | Production-like testing |
| **Arc Mainnet** | TBD | https://rpc.mainnet.arc.network | Mainnet deployment |

### Update Network Configuration

Edit `hardhat.config.ts` to add or modify networks:

```typescript
networks: {
  hardhat: {
    chainId: 31337
  },
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337
  },
  "faucet-testnet": {
    url: process.env.FAUCET_RPC || "https://rpc.usdc.circle.com",
    chainId: parseInt(process.env.FAUCET_CHAIN_ID || "5042002"),
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
  }
}
```

---

## Local Hardhat Deployment

### Option 1: Using Built-in Hardhat Network (Fastest)

```bash
# Deploy contracts to built-in Hardhat network
npx hardhat run scripts/deploy.js

# Output includes contract addresses for frontend
```

**Expected Output:**
```
Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

1. Deploying USDC Mock...
✓ USDC deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

1B. Deploying EURC Mock...
✓ EURC deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

2. Deploying InterestRateModel...
✓ RateModel deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

3. Deploying ArcCreditCore...
✓ ArcCreditCore deployed to: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

✓ Deployment saved to deployment.json
```

### Option 2: Using Local Hardhat Node (For Persistent Development)

**Terminal 1 - Start Hardhat Node:**
```bash
npx hardhat node
```

**Terminal 2 - Deploy to Node:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

---

## Circle Faucet Testnet Deployment

### Step 1: Get Testnet Funds

1. Visit [Circle Faucet](https://faucet.circle.com/)
2. Enter your wallet address
3. Request USDC test tokens

### Step 2: Configure Environment

Update `.env`:
```env
PRIVATE_KEY=your_wallet_private_key
FAUCET_RPC=https://rpc.usdc.circle.com
FAUCET_CHAIN_ID=5042002
```

### Step 3: Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network faucet-testnet
```

### Step 4: Save Contract Addresses

The deployment script outputs contract addresses in this format:
```
REACT_APP_USDC_ADDRESS=0x...
REACT_APP_EURC_ADDRESS=0x...
REACT_APP_RATE_MODEL_ADDRESS=0x...
REACT_APP_LENDING_ADDRESS=0x...
```

Copy these values to `arccredit-frontend/.env`.

---

## Arc Network Deployment

### When Arc Network is Ready

1. **Get Arc Testnet Details:**
   - RPC URL: https://rpc.testnet.arc.network
   - Chain ID: [Check Arc documentation]
   - Faucet: [Check Arc documentation]

2. **Update `.env`:**
   ```env
   ARC_TESTNET_RPC=https://rpc.testnet.arc.network
   ARC_CHAIN_ID=your_arc_chain_id
   ```

3. **Update `hardhat.config.ts`:**
   ```typescript
   "arc-testnet": {
     url: process.env.ARC_TESTNET_RPC || "https://rpc.testnet.arc.network",
     chainId: parseInt(process.env.ARC_CHAIN_ID || "10"),
     accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
   }
   ```

4. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.js --network arc-testnet
   ```

---

## Frontend Configuration

### Step 1: Update Environment Variables

Edit `arccredit-frontend/.env` with deployed contract addresses:

```env
# Contract Addresses (from deployment output)
REACT_APP_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_EURC_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
REACT_APP_RATE_MODEL_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
REACT_APP_LENDING_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

# Network Configuration (match your deployment network)
REACT_APP_CHAIN_ID=31337
REACT_APP_RPC_URL=http://127.0.0.1:8545

# For Circle Faucet:
# REACT_APP_CHAIN_ID=5042002
# REACT_APP_RPC_URL=https://rpc.usdc.circle.com
```

### Step 2: Start Frontend Development Server

```bash
cd arccredit-frontend
npm start
```

The app will open at `http://localhost:3000`

### Step 3: Configure MetaMask

1. Open MetaMask extension
2. Add custom network:
   - **Network Name**: ArcCredit Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency**: ETH

3. For Circle Faucet:
   - **Network Name**: Circle Faucet Testnet
   - **RPC URL**: https://rpc.usdc.circle.com
   - **Chain ID**: 5042002
   - **Currency**: USDC

---

## Testing the Deployment

### 1. Verify Smart Contracts

```bash
# Compile contracts (checks for syntax errors)
npx hardhat compile

# Run contract tests
npx hardhat test
```

### 2. Verify Frontend Connection

1. Open browser console (F12)
2. Check for errors related to contract addresses
3. Click "Connect Wallet" button
4. Confirm MetaMask connection to correct network

### 3. Test Lending Functions

- **Create Loan**: Borrow USDC by providing collateral
- **Loan Status**: View active loans and repayment terms
- **Interest Rates**: Check current interest rate model

---

## Troubleshooting

### Issue: "Network not supported"
**Solution**: Ensure `REACT_APP_CHAIN_ID` in frontend `.env` matches deployment network

### Issue: "Cannot connect to RPC"
**Solution**: 
- Check RPC URL is correct
- Verify network is online
- For local Hardhat, run `npx hardhat node` in another terminal

### Issue: "Contract address is invalid"
**Solution**: 
- Re-deploy contracts: `npx hardhat run scripts/deploy.js`
- Copy all 4 addresses to frontend `.env`
- Restart frontend: `npm start`

### Issue: "MetaMask cannot connect"
**Solution**:
- Ensure MetaMask has correct network configured
- Verify RPC URL matches deployment network
- Try clearing MetaMask cache: Settings → Advanced → Clear Activity Tab Data

### Issue: "Insufficient gas"
**Solution**: 
- For local Hardhat: Use default accounts (have unlimited gas)
- For testnet: Request more funds from faucet

### Issue: npm dependency errors
**Solution**:
```bash
# Clean install
rm -r node_modules package-lock.json
npm install
```

---

## Deployment Checklist

- [ ] Node.js and npm installed
- [ ] Dependencies installed: `npm install`
- [ ] `.env` file configured with `PRIVATE_KEY`
- [ ] Network RPC URL verified
- [ ] Contracts compile: `npx hardhat compile`
- [ ] Deployment successful: `npx hardhat run scripts/deploy.js`
- [ ] Contract addresses copied to `arccredit-frontend/.env`
- [ ] Frontend `.env` has correct `REACT_APP_CHAIN_ID` and `REACT_APP_RPC_URL`
- [ ] MetaMask configured for target network
- [ ] Frontend starts: `cd arccredit-frontend && npm start`
- [ ] Wallet connection works in browser
- [ ] Contract addresses display in frontend UI

---

## Quick Start Commands

### Local Development (Fastest)
```bash
# Terminal 1: Deploy contracts
npx hardhat run scripts/deploy.js

# Terminal 2: Start frontend
cd arccredit-frontend
npm start
```

### With Persistent Node
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start frontend
cd arccredit-frontend
npm start
```

### Deploy to Circle Testnet
```bash
# 1. Update .env with testnet config
# 2. Deploy
npx hardhat run scripts/deploy.js --network faucet-testnet

# 3. Update frontend .env with new addresses
# 4. Start frontend
cd arccredit-frontend
npm start
```

---

## Support & Resources

- **Hardhat Docs**: https://hardhat.org/
- **Ethers.js v6**: https://docs.ethers.org/v6/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **MetaMask**: https://metamask.io/
- **USDC**: https://www.circle.com/usdc

