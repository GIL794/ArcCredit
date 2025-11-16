# ⚠️ Contracts Need to be Deployed

## Error: "could not decode result data (value="0x")"

This error means the contracts are not deployed at the addresses in your `.env` file.

## Quick Fix

### Step 1: Start Hardhat Node (if not running)
```bash
npx hardhat node
```
Keep this terminal open.

### Step 2: Deploy Contracts (in a new terminal)
```bash
cd C:\Users\Gabriele\Documents\GitHub\Encode_ARC_Project\ArcCredit
npx hardhat run scripts/deploy.js
```

This will:
- Deploy USDC, EURC, InterestRateModel, and ArcCreditCore contracts
- Mint 100,000 USDC and EURC to the deployer account
- Save addresses to `deployment.json`
- Update `arccredit-frontend/.env` automatically

### Step 3: Restart Frontend (if running)
```bash
cd arccredit-frontend
# Stop current server (Ctrl+C)
npm start
```

## Verify Deployment

After deployment, you should see:
```
✓ USDC deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✓ EURC deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
✓ RateModel deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
✓ ArcCreditCore deployed to: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```

## Important Notes

- **Hardhat node must be running** before deploying
- **Contracts are lost** when Hardhat node restarts - you need to redeploy
- The deployer account (first account) will have 100,000 USDC and EURC for testing

## Troubleshooting

If you still see errors after deployment:
1. Check that Hardhat node is running: `npx hardhat node`
2. Verify `.env` file has correct addresses
3. Restart frontend: `npm start`
4. Clear browser cache and reload

