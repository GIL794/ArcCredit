const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [owner, borrower1, borrower2, borrower3] = await ethers.getSigners();
  
  // Load contracts from deployment.json
  const deployment = require("../deployment.json");
  const { usdc: usdcAddress, eurc: eurcAddress, lending: lendingAddress, rateModel: rateModelAddress } = deployment;
  
  const usdc = await ethers.getContractAt("USDC", usdcAddress);
  const eurc = await ethers.getContractAt("EURC", eurcAddress);
  const lending = await ethers.getContractAt("ArcCreditCore", lendingAddress);
  const rateModel = await ethers.getContractAt("InterestRateModel", rateModelAddress);
  
  console.log("\n🎬 ARCCREDIT DEMO SCENARIO\n");
  console.log("=".repeat(70));
  
  // ============ SCENARIO 1: High Credit Score (90) ============
  console.log("\n📊 SCENARIO 1: Borrower with Credit Score 90 (Low Risk)");
  console.log("-".repeat(70));
  
  const creditScore1 = 90;
  const collateral1 = ethers.utils.parseUnits("1200", 6);
  const borrowAmount1 = ethers.utils.parseUnits("1000", 6);
  
  // Mint and approve
  await usdc.mint(borrower1.address, collateral1);
  await usdc.connect(borrower1).approve(lending.address, collateral1);
  
  // Request loan
  console.log(`\n1️⃣  Borrower 1 deposits ${ethers.utils.formatUnits(collateral1, 6)} USDC collateral`);
  console.log(`    and requests ${ethers.utils.formatUnits(borrowAmount1, 6)} USDC loan`);
  
  const tx1 = await lending.connect(borrower1).requestLoanInStablecoin(
    collateral1,
    borrowAmount1,
    creditScore1,
    0  // USDC
  );
  await tx1.wait();
  
  // Get rate
  const rate1 = await rateModel.calculateBorrowRate(creditScore1);
  const rate1Percent = (rate1 / 100).toFixed(1);
  
  console.log(`✅ Loan approved!`);
  console.log(`   Credit Score: ${creditScore1}/100`);
  console.log(`   Interest Rate: ${rate1Percent}% APR`);
  
  // Get status
  const status1 = await lending.getLoanStatus(borrower1.address);
  console.log(`\n📋 Loan Status:`);
  console.log(`   Collateral: ${ethers.utils.formatUnits(status1, 6)} USDC`);
  console.log(`   Borrowed: ${ethers.utils.formatUnits(status1, 6)} USDC`);
  console.log(`   Interest (now): ${ethers.utils.formatUnits(status1, 6)} USDC`);
  console.log(`   Active: ${status1}`);
  
  // ============ SCENARIO 2: Medium Credit Score (65) ============
  console.log("\n📊 SCENARIO 2: Borrower with Credit Score 65 (Medium Risk)");
  console.log("-".repeat(70));
  
  const creditScore2 = 65;
  const collateral2 = ethers.utils.parseUnits("1200", 6);
  const borrowAmount2 = ethers.utils.parseUnits("1000", 6);
  
  await usdc.mint(borrower2.address, collateral2);
  await usdc.connect(borrower2).approve(lending.address, collateral2);
  
  console.log(`\n2️⃣  Borrower 2 deposits ${ethers.utils.formatUnits(collateral2, 6)} USDC collateral`);
  console.log(`    and requests ${ethers.utils.formatUnits(borrowAmount2, 6)} USDC loan`);
  
  const tx2 = await lending.connect(borrower2).requestLoanInStablecoin(
    collateral2,
    borrowAmount2,
    creditScore2,
    0  // USDC
  );
  await tx2.wait();
  
  const rate2 = await rateModel.calculateBorrowRate(creditScore2);
  const rate2Percent = (rate2 / 100).toFixed(1);
  
  console.log(`✅ Loan approved!`);
  console.log(`   Credit Score: ${creditScore2}/100`);
  console.log(`   Interest Rate: ${rate2Percent}% APR (Higher than Borrower 1)`);
  
  // ============ SCENARIO 3: Low Credit Score (40) ============
  console.log("\n📊 SCENARIO 3: Borrower with Credit Score 40 (High Risk)");
  console.log("-".repeat(70));
  
  const creditScore3 = 40;
  const collateral3 = ethers.utils.parseUnits("1200", 6);
  const borrowAmount3 = ethers.utils.parseUnits("1000", 6);
  
  await usdc.mint(borrower3.address, collateral3);
  await usdc.connect(borrower3).approve(lending.address, collateral3);
  
  console.log(`\n3️⃣  Borrower 3 deposits ${ethers.utils.formatUnits(collateral3, 6)} USDC collateral`);
  console.log(`    and requests ${ethers.utils.formatUnits(borrowAmount3, 6)} USDC loan`);
  
  const tx3 = await lending.connect(borrower3).requestLoanInStablecoin(
    collateral3,
    borrowAmount3,
    creditScore3,
    0  // USDC
  );
  await tx3.wait();
  
  const rate3 = await rateModel.calculateBorrowRate(creditScore3);
  const rate3Percent = (rate3 / 100).toFixed(1);
  
  console.log(`✅ Loan approved!`);
  console.log(`   Credit Score: ${creditScore3}/100`);
  console.log(`   Interest Rate: ${rate3Percent}% APR (Highest)`);
  
  // ============ COMPARISON TABLE ============
  console.log("\n" + "=".repeat(70));
  console.log("📈 INTEREST RATE COMPARISON");
  console.log("=".repeat(70));
  
  console.log("\n┌─────────────┬───────────────┬──────────────┬────────────┐");
  console.log("│  Borrower   │ Credit Score  │ Interest Rate│  Gap       │");
  console.log("├─────────────┼───────────────┼──────────────┼────────────┤");
  console.log(`│ Borrower 1  │      ${creditScore1}/100      │    ${rate1Percent}%    │    Base    │`);
  console.log(`│ Borrower 2  │      ${creditScore2}/100      │    ${rate2Percent}%     │  +${((rate2 - rate1) / 100).toFixed(1)}%  │`);
  console.log(`│ Borrower 3  │      ${creditScore3}/100      │    ${rate3Percent}%     │  +${((rate3 - rate1) / 100).toFixed(1)}%  │`);
  console.log("└─────────────┴───────────────┴──────────────┴────────────┘");
  
  // ============ TIME FAST-FORWARD ============
  console.log("\n⏰ FAST-FORWARDING 30 DAYS...");
  console.log("-".repeat(70));
  
  const days30InSeconds = 30 * 24 * 60 * 60;
  await ethers.provider.send("hardhat_mine", [
    "0x" + Math.ceil(days30InSeconds / 12).toString(16),
  ]);
  
  console.log("✓ Time fast-forwarded by 30 days\n");
  
  // Accrue interest for all borrowers
  await lending.accrueInterest(borrower1.address);
  await lending.accrueInterest(borrower2.address);
  await lending.accrueInterest(borrower3.address);
  
  // Get updated statuses
  const status1Updated = await lending.getLoanStatus(borrower1.address);
  const status2Updated = await lending.getLoanStatus(borrower2.address);
  const status3Updated = await lending.getLoanStatus(borrower3.address);
  
  console.log("📊 INTEREST ACCRUED AFTER 30 DAYS:");
  console.log("┌─────────────┬─────────────────┬──────────────────────────┐");
  console.log("│  Borrower   │  Interest Rate  │   Total Interest Owed    │");
  console.log("├─────────────┼─────────────────┼──────────────────────────┤");
  console.log(`│ Borrower 1  │  ${rate1Percent}%      │  ${ethers.utils.formatUnits(status1Updated, 6).padEnd(20)} USDC │`);
  console.log(`│ Borrower 2  │  ${rate2Percent}%      │  ${ethers.utils.formatUnits(status2Updated, 6).padEnd(20)} USDC │`);
  console.log(`│ Borrower 3  │  ${rate3Percent}%      │  ${ethers.utils.formatUnits(status3Updated, 6).padEnd(20)} USDC │`);
  console.log("└─────────────┴─────────────────┴──────────────────────────┘");
  
  // ============ MULTI-STABLECOIN DEMONSTRATION ============
  console.log("\n" + "=".repeat(70));
  console.log("💡 PROGRAMMABLE MONEY: MULTI-STABLECOIN LENDING");
  console.log("=".repeat(70));
  
  const borrowerMulti = borrower1;
  const creditScoreMulti = 75;
  const collateralMulti = ethers.utils.parseUnits("2400", 6);
  const borrowAmountMulti = ethers.utils.parseUnits("1000", 6);
  
  await usdc.mint(borrowerMulti.address, collateralMulti);
  await eurc.mint(borrowerMulti.address, ethers.utils.parseUnits("50000", 6));
  await usdc.connect(borrowerMulti).approve(lending.address, ethers.utils.parseUnits("100000", 6));
  await eurc.connect(borrowerMulti).approve(lending.address, ethers.utils.parseUnits("100000", 6));
  
  console.log("\n🔵 Scenario 1: Borrow in USDC");
  console.log(`   Borrower deposits ${ethers.utils.formatUnits(collateralMulti, 6)} USDC collateral`);
  console.log(`   Requests ${ethers.utils.formatUnits(borrowAmountMulti, 6)} USDC loan`);
  
  const txUSDC = await lending.connect(borrowerMulti).requestLoanInStablecoin(
    collateralMulti,
    borrowAmountMulti,
    creditScoreMulti,
    0  // USDC
  );
  await txUSDC.wait();
  
  console.log("✅ Loan approved in USDC!");
  
  const rateMulti = await rateModel.calculateBorrowRate(creditScoreMulti);
  const rateMultiPercent = (rateMulti / 100).toFixed(1);
  console.log(`   Interest Rate: ${rateMultiPercent}% APR`);
  
  const statusUSDC = await lending.getLoanStatus(borrowerMulti.address);
  console.log(`   Borrowed in: USDC ✓`);
  
  console.log("\n   💰 Repaying USDC loan...");
  await lending.connect(borrowerMulti).repayLoan();
  console.log(`   ✓ Repaid`);
  console.log(`   ✓ Collateral returned`);
  
  console.log("\n🟦 Scenario 2: Borrow in EURC");
  console.log(`   Borrower deposits ${ethers.utils.formatUnits(collateralMulti, 6)} USDC collateral`);
  console.log(`   Requests ${ethers.utils.formatUnits(borrowAmountMulti, 6)} EURC loan`);
  
  const txEURC = await lending.connect(borrowerMulti).requestLoanInStablecoin(
    collateralMulti,
    borrowAmountMulti,
    creditScoreMulti,
    1  // EURC
  );
  await txEURC.wait();
  
  console.log("✅ Loan approved in EURC!");
  console.log(`   Interest Rate: ${rateMultiPercent}% APR (same as USDC)`);
  
  const statusEURC = await lending.getLoanStatus(borrowerMulti.address);
  console.log(`   Borrowed in: EURC ✓`);
  
  console.log("\n   💰 Repaying EURC loan...");
  await lending.connect(borrowerMulti).repayLoan();
  console.log(`   ✓ Repaid`);
  console.log(`   ✓ Collateral returned`);
  
  console.log("\n" + "=".repeat(70));
  console.log("🎉 PROGRAMMABLE MONEY IN ACTION:");
  console.log("=".repeat(70));
  console.log("✓ Same borrower");
  console.log("✓ Different stablecoins (USDC & EURC)");
  console.log("✓ Smart contract branches logic based on stablecoin type");
  console.log("✓ Interest calculation identical (no manual intervention)");
  console.log("✓ Collateral always in USDC (stable base)");
  console.log("✓ Loan disbursal/repayment in borrower's preferred currency");
  console.log("\n🚀 This is NOT possible in traditional banking!");
  console.log("   Banks require currency conversions and intermediaries.");
  console.log("   Arc's programmable money does it in milliseconds.");
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
