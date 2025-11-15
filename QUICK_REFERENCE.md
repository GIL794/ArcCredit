# ArcCredit - Quick Reference Card

## 🚀 Quick Start (60 seconds)

### For Windows:
```powershell
# Option 1: Automatic setup
.\setup.ps1

# Option 2: Manual setup
npx hardhat run scripts/deploy.js
cd arccredit-frontend
npm start
```

### For macOS/Linux:
```bash
# Deploy and start frontend
npx hardhat run scripts/deploy.js
cd arccredit-frontend && npm start
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `deployment.json` | Deployed contract addresses (auto-generated) |
| `DEPLOYMENT_SUMMARY.md` | Quick overview & next steps |
| `docs/DEPLOYMENT_GUIDE.md` | Complete deployment documentation |
| `.env` | Network configuration & private key |
| `.env.example` | Template for .env |
| `arccredit-frontend/.env` | Frontend contract addresses |
| `setup.ps1` / `setup.bat` | Automated setup script |

---

## 🔗 Deployed Contracts (Local Hardhat)

```
USDC:             0x5FbDB2315678afecb367f032d93F642f64180aa3
EURC:             0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
InterestRateModel: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
ArcCreditCore:    0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```

---

## 🛠 Common Commands

```bash
# Deploy contracts
npx hardhat run scripts/deploy.js                    # Local (built-in)
npx hardhat run scripts/deploy.js --network faucet-testnet    # Circle testnet
npx hardhat node                                     # Start persistent node

# Compile & test
npx hardhat compile                                  # Compile Solidity
npx hardhat test                                     # Run tests

# Frontend
cd arccredit-frontend && npm start                  # Start dev server (port 3000)
npm run build                                       # Build for production

# Clean
npx hardhat clean                                    # Remove build artifacts
rm -r node_modules && npm install                  # Fresh install
```

---

## 🔐 MetaMask Setup

**Network:** ArcCredit Dev  
**RPC:** http://127.0.0.1:8545  
**Chain ID:** 31337  
**Currency:** ETH  

Steps:
1. MetaMask → Networks → Add Custom Network
2. Fill in values above → Save
3. Connect to app

---

## 📊 Network Reference

| Network | Chain ID | RPC | Status |
|---------|----------|-----|--------|
| Local Hardhat | 31337 | http://127.0.0.1:8545 | ✅ Active |
| Circle Faucet | 5042002 | https://rpc.usdc.circle.com | ⏳ Testnet |
| Arc Mainnet | TBD | TBD | 🔮 Future |

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | `npm install` |
| "Cannot connect to RPC" | Check RPC URL in .env or frontend/.env |
| "MetaMask network error" | Add custom network in MetaMask |
| "Invalid contract address" | Re-run deployment, update .env |
| "Gas limit exceeded" | Use local Hardhat (unlimited gas) |

---

## 📚 Documentation

- **Full Guide:** `docs/DEPLOYMENT_GUIDE.md`
- **Summary:** `DEPLOYMENT_SUMMARY.md`
- **API Reference:** `docs/API.md`
- **Architecture:** `docs/ARCHITECTURE.md`

---

## 💾 Project Structure

```
ArcCredit/
├── contracts/                    # Smart contracts (Solidity)
├── scripts/
│   └── deploy.js                # Deployment script
├── test/                        # Test files
├── frontend/                    # React app
├── arccredit-frontend/          # React app (CRA)
├── docs/
│   ├── DEPLOYMENT_GUIDE.md      # Complete guide
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SCHEMA.md
├── deployment.json              # Contract addresses
├── .env                         # Environment config
├── setup.ps1                    # PowerShell setup
├── setup.bat                    # Batch setup
└── README.md                    # Project overview
```

---

## 🎯 Workflow

1. **Setup** → Run `setup.ps1` or manual commands
2. **Deploy** → `npx hardhat run scripts/deploy.js`
3. **Configure** → Update frontend `.env` with addresses
4. **Run** → `cd arccredit-frontend && npm start`
5. **Connect** → Click wallet button, approve MetaMask
6. **Test** → Use Create Loan, Loan Status tabs

---

## 🌐 Useful Links

- [Hardhat Docs](https://hardhat.org/)
- [Ethers.js v6](https://docs.ethers.org/v6/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [MetaMask](https://metamask.io/)
- [Circle USDC](https://www.circle.com/usdc)

---

## ✅ Deployment Checklist

- [ ] Dependencies installed: `npm install`
- [ ] `.env` configured with `PRIVATE_KEY`
- [ ] Contracts compile: `npx hardhat compile`
- [ ] Deploy successful: `npx hardhat run scripts/deploy.js`
- [ ] Frontend `.env` updated with contract addresses
- [ ] MetaMask configured for network
- [ ] Frontend starts: `npm start`
- [ ] Wallet connection works

