const hre = require("hardhat");
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Get network name (defaults to localhost if not specified)
  const networkName = hre.network.name;
  console.log(`\n📡 Deploying to network: ${networkName}`);
  
  // Warn if deploying to in-memory hardhat network
  if (networkName === 'hardhat') {
    console.warn('\n⚠️  WARNING: Deploying to in-memory Hardhat network!');
    console.warn('   Contracts will be lost when script ends.');
    console.warn('   For persistent deployment, use: npx hardhat run scripts/deploy.js --network localhost');
    console.warn('   (Make sure Hardhat node is running: npx hardhat node)\n');
  }
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // 1. Deploy USDC Mock
  console.log("\n1. Deploying USDC Mock...");
  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✓ USDC deployed to:", usdcAddress);
  
  // Mint some USDC to deployer for testing
  await usdc.mint(deployer.address, ethers.parseUnits("100000", 6));
  console.log("✓ Minted 100,000 USDC to deployer");
  
  // 1B. Deploy EURC Mock
  console.log("\n1B. Deploying EURC Mock...");
  const EURC = await ethers.getContractFactory("EURC");
  const eurc = await EURC.deploy();
  await eurc.waitForDeployment();
  const eurcAddress = await eurc.getAddress();
  console.log("✓ EURC deployed to:", eurcAddress);
  
  // Mint some EURC to deployer for testing
  await eurc.mint(deployer.address, ethers.parseUnits("100000", 6));
  console.log("✓ Minted 100,000 EURC to deployer");
  
  // 2. Deploy Interest Rate Model
  console.log("\n2. Deploying InterestRateModel...");
  const RateModel = await ethers.getContractFactory("InterestRateModel");
  const rateModel = await RateModel.deploy();
  await rateModel.waitForDeployment();
  const rateModelAddress = await rateModel.getAddress();
  console.log("✓ RateModel deployed to:", rateModelAddress);
  
  // 3. Deploy ArcCreditCore
  console.log("\n3. Deploying ArcCreditCore...");
  const Lending = await ethers.getContractFactory("ArcCreditCore");
  const lending = await Lending.deploy(usdcAddress, eurcAddress, rateModelAddress);
  await lending.waitForDeployment();
  const lendingAddress = await lending.getAddress();
  console.log("✓ ArcCreditCore deployed to:", lendingAddress);
  
  // 4. Save deployment addresses
  const blockNumber = await ethers.provider.getBlockNumber();
  const deploymentAddresses = {
    usdc: usdcAddress,
    eurc: eurcAddress,
    rateModel: rateModelAddress,
    lending: lendingAddress,
    deployer: deployer.address,
    deploymentBlock: blockNumber,
    timestamp: new Date().toISOString(),
  };
  
  const fs = require("fs");
  const path = require("path");
  
  // Save to root deployment.json
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentAddresses, null, 2)
  );
  console.log("\n✓ Deployment saved to deployment.json");
  
  // Also copy to frontend public folder for automatic loading
  const frontendPublicPath = path.join(__dirname, "..", "arccredit-frontend", "public", "deployment.json");
  try {
    fs.writeFileSync(
      frontendPublicPath,
      JSON.stringify(deploymentAddresses, null, 2)
    );
    console.log("✓ Deployment addresses copied to arccredit-frontend/public/deployment.json");
    console.log("  (Frontend can now automatically load addresses when wallet connects)");
  } catch (copyError) {
    console.warn("⚠️  Could not copy to frontend public folder:", copyError.message);
    console.warn("   You can manually copy deployment.json to arccredit-frontend/public/");
  }
  
  // 5. Print summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  Object.entries(deploymentAddresses).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log("=".repeat(60));
  
  // 6. Print frontend env variables
  console.log("\n" + "=".repeat(60));
  console.log("ADD THESE TO arccredit-frontend/.env.local:");
  console.log("=".repeat(60));
  console.log(`REACT_APP_USDC_ADDRESS=${usdcAddress}`);
  console.log(`REACT_APP_EURC_ADDRESS=${eurcAddress}`);
  console.log(`REACT_APP_RATE_MODEL_ADDRESS=${rateModelAddress}`);
  console.log(`REACT_APP_LENDING_ADDRESS=${lendingAddress}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
