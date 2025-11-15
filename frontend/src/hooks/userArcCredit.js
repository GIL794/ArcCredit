import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function requestLoan(uint256 _collateral, uint256 _borrow, uint256 _score) external",
  "function repayLoan() external",
  "function getLoanStatus(address _borrower) external view returns (uint256, uint256, uint256, uint256, bool)",
  "function accrueInterest(address _borrower) public",
];

export function useArcCredit(contractAddress, provider, signer) {
  const [loanStatus, setLoanStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer || provider);
  
  // Fetch loan status
  const fetchLoanStatus = async (address) => {
    try {
      const status = await contract.getLoanStatus(address);
      setLoanStatus({
        collateral: ethers.utils.formatUnits(status, 6),
        borrowed: ethers.utils.formatUnits(status, 6),
        interest: ethers.utils.formatUnits(status, 6),
        creditScore: status.toString(),
        active: status,
      });
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Request loan
  const requestLoan = async (collateral, borrowAmount, creditScore) => {
    try {
      setLoading(true);
      const collateralWei = ethers.utils.parseUnits(collateral, 6);
      const borrowWei = ethers.utils.parseUnits(borrowAmount, 6);
      
      const tx = await contract.requestLoan(collateralWei, borrowWei, creditScore);
      await tx.wait();
      
      // Refresh loan status
      fetchLoanStatus(signer.getAddress());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Repay loan
  const repayLoan = async () => {
    try {
      setLoading(true);
      const tx = await contract.repayLoan();
      await tx.wait();
      
      fetchLoanStatus(signer.getAddress());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loanStatus,
    loading,
    error,
    fetchLoanStatus,
    requestLoan,
    repayLoan,
  };
}
