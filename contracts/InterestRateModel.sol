// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @notice Calculates variable borrow rates based on credit score
 * 
 * Formula: baseRate + (100 - creditScore) * riskPremium
 * 
 * Examples:
 * - Score 90: 5% + 10 * 0.5% = 5.5% APR
 * - Score 70: 5% + 30 * 0.5% = 20% APR
 * - Score 50: 5% + 50 * 0.5% = 30% APR
 */
contract InterestRateModel {
    
    uint256 public constant BASE_RATE = 500; // 5% in basis points
    uint256 public constant RISK_PREMIUM = 50; // 0.5% per score point
    uint256 public constant ONE_YEAR = 365 days;
    
    /**
     * @notice Calculate annual interest rate in basis points
     * @param creditScore Borrower credit score (0-100)
     * @return rate Annual rate in basis points (e.g., 1000 = 10%)
     */
    function calculateBorrowRate(uint256 creditScore) 
        external 
        pure 
        returns (uint256) 
    {
        require(creditScore > 0 && creditScore <= 100, "Invalid score");
        
        uint256 riskComponent = (100 - creditScore) * RISK_PREMIUM;
        return BASE_RATE + riskComponent;
    }
    
    /**
     * @notice Calculate daily interest accrual
     * @param principal Loan principal in USDC
     * @param annualRate Annual rate in basis points
     * @param daysElapsed Days since last accrual
     * @return dailyInterest Interest accrued
     */
    function calculateInterest(
        uint256 principal,
        uint256 annualRate,
        uint256 daysElapsed
    ) external pure returns (uint256) {
        // Interest = Principal * (Rate / 10000) * (Days / 365)
        return (principal * annualRate * daysElapsed) / (10000 * ONE_YEAR);
    }
}
