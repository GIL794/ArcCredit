import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';
import { useContracts } from '../hooks/useContracts';

function LoanStatus() {
  const { signer } = useWeb3();
  const contracts = useContracts(signer);
  const [loading, setLoading] = useState(false);
  const [loanStatus, setLoanStatus] = useState(null);
  const [status, setStatus] = useState(null);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    fetchLoanStatus();
    const interval = setInterval(fetchLoanStatus, 10000);
    return () => clearInterval(interval);
  }, [contracts, signer]);

  const fetchLoanStatus = async () => {
    if (!contracts || !signer) return;
    
    setLoading(true);
    try {
      const address = await signer.getAddress();
      const [collateral, borrowed, interest, score, active] = await contracts.lending.getLoanStatus(address);

      if (active) {
        try {
          const collateralStr = String(collateral);
          const borrowedStr = String(borrowed);
          const interestStr = String(interest);
          const totalOwedBN = BigInt(borrowedStr) + BigInt(interestStr);
          
          setLoanStatus({
            collateral: ethers.formatUnits(collateralStr, 6),
            borrowed: ethers.formatUnits(borrowedStr, 6),
            interest: ethers.formatUnits(interestStr, 6),
            score: typeof score === 'number' ? score : Number(score),
            active: active,
            totalOwed: ethers.formatUnits(totalOwedBN.toString(), 6),
          });
        } catch (parseError) {
          console.error('Error formatting loan status:', parseError);
          setLoanStatus(null);
        }
      } else {
        setLoanStatus(null);
      }
    } catch (error) {
      console.error('Failed to fetch loan status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async () => {
    if (!contracts) return;

    setRepaying(true);
    setStatus(null);

    try {
      const tx = await contracts.lending.repayLoan();

      setStatus({
        type: 'info',
        message: 'Repayment pending...',
      });

      const receipt = await tx.wait();

      setStatus({
        type: 'success',
        message: `Loan repaid successfully! Tx: ${receipt.transactionHash}`,
      });

      await fetchLoanStatus();
    } catch (error) {
      console.error('Repayment failed:', error);
      setStatus({
        type: 'error',
        message: `Error: ${error.message}`,
      });
    } finally {
      setRepaying(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Loan Status</h2>

      {status && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      {loading && !loanStatus && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span className="loading"></span>
        </div>
      )}

      {loanStatus ? (
        <div>
          <div className="loan-info">
            <div className="loan-info-row">
              <span className="loan-info-label">USDC Collateral:</span>
              <span className="loan-info-value">{parseFloat(loanStatus.collateral).toFixed(2)} USDC</span>
            </div>
            <div className="loan-info-row">
              <span className="loan-info-label">Amount Borrowed:</span>
              <span className="loan-info-value">{parseFloat(loanStatus.borrowed).toFixed(2)} USDC</span>
            </div>
            <div className="loan-info-row">
              <span className="loan-info-label">Interest Accrued:</span>
              <span className="loan-info-value">{parseFloat(loanStatus.interest).toFixed(6)} USDC</span>
            </div>
            <div className="loan-info-row">
              <span className="loan-info-label">Credit Score:</span>
              <span className="loan-info-value">{loanStatus.score}/100</span>
            </div>
            <div className="divider"></div>
            <div className="loan-info-row">
              <span className="loan-info-label" style={{ fontSize: '16px' }}>Total Owed:</span>
              <span className="loan-info-value" style={{ fontSize: '16px', color: '#667eea' }}>
                {parseFloat(loanStatus.totalOwed).toFixed(6)} USDC
              </span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRepayLoan}
            disabled={repaying}
          >
            {repaying ? 'Repaying...' : 'Repay Loan'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={fetchLoanStatus}
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            Refresh Status
          </button>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No active loans</p>
        </div>
      )}
    </div>
  );
}

export default LoanStatus;
