# script/live-demo.sh
echo "Starting ArcCredit Live Demo..."
echo "1. Deploying contracts..."
npx hardhat run scripts/deploy.js --network arc-testnet

echo "2. Setting up test borrowers..."
npx hardhat run scripts/setup-borrowers.js --network arc-testnet

echo "3. Running scenarios..."
npx hardhat test --network arc-testnet

echo "4. Opening dashboard..."
npm start