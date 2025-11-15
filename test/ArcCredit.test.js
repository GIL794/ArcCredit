const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArcCredit Lending Protocol", function () {
  let usdc, eurc, rateModel, lending;
  let owner, borrower, lender;
  
  beforeEach(async function () {
    [owner, borrower, lender] = await ethers.getSigners();
    
    // Deploy USDC
    const USDC = await ethers.getContractFactory("USDC");
    usdc = await USDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    
    // Deploy EURC
    const EURC = await ethers.getContractFactory("EURC");
    eurc = await EURC.deploy();
    await eurc.waitForDeployment();
    const eurcAddress = await eurc.getAddress();
    
    // Mint USDC to borrower
    await usdc.mint(borrower.address, ethers.parseUnits("10000", 6));
    
    // Mint EURC to borrower
    await eurc.mint(borrower.address, ethers.parseUnits("10000", 6));
    
    // Deploy RateModel
    const RateModel = await ethers.getContractFactory("InterestRateModel");
    rateModel = await RateModel.deploy();
    await rateModel.waitForDeployment();
    const rateModelAddress = await rateModel.getAddress();
    
    // Deploy Lending
    const Lending = await ethers.getContractFactory("ArcCreditCore");
    lending = await Lending.deploy(usdcAddress, eurcAddress, rateModelAddress);
    await lending.waitForDeployment();
    const lendingAddress = await lending.getAddress();
    
    // Approve lending contract to spend USDC and EURC
    await usdc.connect(borrower).approve(lendingAddress, ethers.parseUnits("10000", 6));
    await eurc.connect(borrower).approve(lendingAddress, ethers.parseUnits("10000", 6));
  });
  
  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const lendingAddress = await lending.getAddress();
      const usdcAddress = await usdc.getAddress();
      const eurcAddress = await eurc.getAddress();
      const rateModelAddress = await rateModel.getAddress();
      
      expect(lendingAddress).to.not.equal(ethers.ZeroAddress);
      expect(usdcAddress).to.not.equal(ethers.ZeroAddress);
      expect(eurcAddress).to.not.equal(ethers.ZeroAddress);
      expect(rateModelAddress).to.not.equal(ethers.ZeroAddress);
    });
  });
  
  describe("Loan Origination", function () {
    it("Should allow borrower to request loan in USDC", async function () {
      const collateral = ethers.parseUnits("1200", 6);
      const borrowAmount = ethers.parseUnits("1000", 6);
      const creditScore = 70;
      
      await expect(
        lending.connect(borrower).requestLoanInStablecoin(
          collateral,
          borrowAmount,
          creditScore,
          0  // USDC
        )
      ).to.emit(lending, "LoanCreated");
      
      const [col, borrowed, interest, score, active] = await lending.getLoanStatus(borrower.address);
      expect(borrowed).to.equal(borrowAmount);
      expect(score).to.equal(creditScore);
      expect(active).to.be.true;
    });
    
    it("Should allow borrower to request loan in EURC", async function () {
      const collateral = ethers.parseUnits("1200", 6);
      const borrowAmount = ethers.parseUnits("1000", 6);
      const creditScore = 70;
      
      await expect(
        lending.connect(borrower).requestLoanInStablecoin(
          collateral,
          borrowAmount,
          creditScore,
          1  // EURC
        )
      ).to.emit(lending, "LoanCreated");
      
      const [col, borrowed, interest, score, active] = await lending.getLoanStatus(borrower.address);
      expect(borrowed).to.equal(borrowAmount);
      expect(score).to.equal(creditScore);
      expect(active).to.be.true;
    });
    
    it("Should reject loan with insufficient collateral", async function () {
      const collateral = ethers.parseUnits("100", 6);
      const borrowAmount = ethers.parseUnits("1000", 6);
      const creditScore = 70;
      
      await expect(
        lending.connect(borrower).requestLoanInStablecoin(
          collateral,
          borrowAmount,
          creditScore,
          0
        )
      ).to.be.revertedWith("Insufficient collateral");
    });
    
    it("Should reject duplicate active loans", async function () {
      const collateral = ethers.parseUnits("1200", 6);
      const borrowAmount = ethers.parseUnits("1000", 6);
      const creditScore = 70;
      
      // First loan
      await lending.connect(borrower).requestLoanInStablecoin(
        collateral,
        borrowAmount,
        creditScore,
        0
      );
      
      // Try second loan (should fail)
      await expect(
        lending.connect(borrower).requestLoanInStablecoin(
          collateral,
          borrowAmount,
          creditScore,
          0
        )
      ).to.be.revertedWith("Active loan exists");
    });
  });
  
  describe("Interest Accrual", function () {
    beforeEach(async function () {
      // Create a loan
      const collateral = ethers.parseUnits("1200", 6);
      const borrowAmount = ethers.parseUnits("1000", 6);
      
      await lending.connect(borrower).requestLoanInStablecoin(
        collateral,
        borrowAmount,
        70,
        0
      );
    });
    
    it("Should calculate correct interest rate for credit score 70", async function () {
      const rate = await rateModel.calculateBorrowRate(70);
      // Base 5% + (100-70) * 0.5% = 5% + 15% = 20%
      expect(rate).to.equal(2000); // 20% in basis points
    });
    
    it("Should accrue interest over time", async function () {
      const [, , interestBefore] = await lending.getLoanStatus(borrower.address);
      
      // Fast-forward 30 days
      await ethers.provider.send("hardhat_mine", ["0x9600"]);
      
      await lending.accrueInterest(borrower.address);
      
      const [, , interestAfter] = await lending.getLoanStatus(borrower.address);
      expect(interestAfter).to.be.gt(interestBefore);
    });
  });
  
  describe("Loan Repayment", function () {
    beforeEach(async function () {
      const collateral = ethers.parseUnits("1200", 6);
      const borrowAmount = ethers.parseUnits("1000", 6);
      
      await lending.connect(borrower).requestLoanInStablecoin(
        collateral,
        borrowAmount,
        70,
        0
      );
    });
    
    it("Should allow borrower to repay loan", async function () {
      await expect(
        lending.connect(borrower).repayLoan()
      ).to.emit(lending, "LoanRepaid");
      
      const [, , , , active] = await lending.getLoanStatus(borrower.address);
      expect(active).to.be.false;
    });
  });
  
  describe("Multi-Stablecoin Lending", function () {
    it("Should handle USDC and EURC loans correctly", async function () {
      const lendingAddress = await lending.getAddress();
      const collateral = ethers.parseUnits("2400", 6);
      const borrowAmount = ethers.parseUnits("1000", 6);
      const creditScore = 75;
      
      // Borrow in USDC
      await lending.connect(borrower).requestLoanInStablecoin(
        collateral,
        borrowAmount,
        creditScore,
        0  // USDC
      );
      
      let status = await lending.getLoanStatus(borrower.address);
      expect(status.borrowed).to.equal(borrowAmount);
      expect(status.active).to.be.true;
      
      // Repay USDC loan
      await lending.connect(borrower).repayLoan();
      
      status = await lending.getLoanStatus(borrower.address);
      expect(status.active).to.be.false;
      
      // Approve again for EURC loan
      await eurc.connect(borrower).approve(lendingAddress, ethers.parseUnits("50000", 6));
      
      // Borrow in EURC
      await lending.connect(borrower).requestLoanInStablecoin(
        collateral,
        borrowAmount,
        creditScore,
        1  // EURC
      );
      
      status = await lending.getLoanStatus(borrower.address);
      expect(status.borrowed).to.equal(borrowAmount);
      expect(status.active).to.be.true;
      
      // Repay EURC loan
      await lending.connect(borrower).repayLoan();
      
      status = await lending.getLoanStatus(borrower.address);
      expect(status.active).to.be.false;
    });
  });
});
// Note: The above code assumes the existence of USDC, EURC, InterestRateModel, and ArcCreditCore contracts.