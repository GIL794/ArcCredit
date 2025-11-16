import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';
import { useContracts } from '../hooks/useContracts';

function LoanStatus() {
  const { signer, account, provider } = useWeb3();
  const contracts = useContracts(signer, provider);
  const [loading, setLoading] = useState(false);
  const [loanStatus, setLoanStatus] = useState(null);
  const [status, setStatus] = useState(null);
  const [repaying, setRepaying] = useState(false);

  const fetchLoanStatus = useCallback(async () => {
    if (!contracts || !account) {
      console.log('⚠️ LoanStatus: Cannot fetch - contracts:', !!contracts, 'account:', !!account);
      return;
    }
    
    setLoading(true);
    try {
      console.log('📋 LoanStatus: Fetching loan status for account:', account);
      const result = await contracts.lending.getLoanStatus(account);
      console.log('📋 LoanStatus: Raw result:', result);
      
      const [collateral, borrowed, interest, score, active] = result;
      
      console.log('📋 LoanStatus: Parsed values:', {
        collateral: String(collateral),
        borrowed: String(borrowed),
        interest: String(interest),
        score: String(score),
        active: active
      });

      if (active) {
        try {
          const collateralStr = String(collateral);
          const borrowedStr = String(borrowed);
          const interestStr = String(interest);
          // eslint-disable-next-line no-undef
          const totalOwedBN = BigInt(borrowedStr) + BigInt(interestStr);
          
          const formattedStatus = {
            collateral: ethers.formatUnits(collateralStr, 6),
            borrowed: ethers.formatUnits(borrowedStr, 6),
            interest: ethers.formatUnits(interestStr, 6),
            score: typeof score === 'number' ? score : Number(score),
            active: active,
            totalOwed: ethers.formatUnits(totalOwedBN.toString(), 6),
          };
          
          console.log('✅ LoanStatus: Formatted status:', formattedStatus);
          setLoanStatus(formattedStatus);
        } catch (parseError) {
          console.error('❌ Error formatting loan status:', parseError);
          setStatus({
            type: 'error',
            message: `Error parsing loan data: ${parseError.message}`
          });
          setLoanStatus(null);
        }
      } else {
        console.log('ℹ️ LoanStatus: No active loan found');
        setLoanStatus(null);
      }
    } catch (error) {
      console.error('❌ Failed to fetch loan status:', error);
      setStatus({
        type: 'error',
        message: `Failed to fetch loan status: ${error.message}. Make sure contracts are deployed and you have an active loan.`
      });
      setLoanStatus(null);
    } finally {
      setLoading(false);
    }
  }, [contracts, account]);

  useEffect(() => {
    if (account) {
      fetchLoanStatus();
      const interval = setInterval(fetchLoanStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchLoanStatus, account]);

  const handleRepayLoan = async () => {
    if (!contracts) {
      setStatus({
        type: 'error',
        message: 'Contracts not initialized. Please check your connection.',
      });
      return;
    }

    if (!signer) {
      setStatus({
        type: 'error',
        message: 'No signer available. Circle wallets require special transaction handling. Please ensure your wallet is properly connected.',
      });
      return;
    }

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

  if (!contracts) {
    // Check if wallet is connected - if yes, contracts are loading
    // Also check localStorage as fallback
    const storedAddress = localStorage.getItem('wallet_address');
    const hasAccount = account || storedAddress;
    
    if (hasAccount) {
      const displayAccount = account || storedAddress;
      return (
        <div className="card">
          <h2 className="card-title">Loan Status</h2>
          <div className="alert alert-info">
            🔄 Loading contracts... Please wait.
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
              {account ? (
                <>Connected: {account.slice(0, 6)}...{account.slice(-4)}</>
              ) : (
                <>Restoring connection: {displayAccount?.slice(0, 6)}...{displayAccount?.slice(-4)}</>
              )}
            </div>
            {!provider && (
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#999' }}>
                ⏳ Waiting for provider... {signer ? '(has signer)' : '(no signer)'}
              </div>
            )}
            {provider && !contracts && (
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>
                ✅ Provider available, initializing contracts...
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="card">
        <h2 className="card-title">Loan Status</h2>
        <div className="alert alert-warning">
          ⚠️ Please connect your wallet first to load contract addresses.
        </div>
      </div>
    );
  }

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
          {loading && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
              Checking for loans...
            </div>
          )}
          {!loading && account && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
              If you just created a loan, it may take a moment to appear.
              <br />
              <button 
                className="btn btn-secondary" 
                onClick={fetchLoanStatus}
                style={{ marginTop: '10px', fontSize: '12px', padding: '6px 12px' }}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoanStatus;

