import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';
import { useContracts } from '../hooks/useContracts';

function LoanForm() {
  const { signer } = useWeb3();
  const contracts = useContracts(signer);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [collateral, setCollateral] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [stablecoin, setStablecoin] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!contracts || !signer) return;
      try {
        const address = await signer.getAddress();
        const balance = await contracts.usdc.balanceOf(address);
        setUsdcBalance(ethers.formatUnits(String(balance), 6));
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [contracts, signer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contracts) return;

    setLoading(true);
    setStatus(null);

    try {
      const collateralAmount = ethers.parseUnits(collateral, 6);
      const borrowAmountUnits = ethers.parseUnits(borrowAmount, 6);
      const score = parseInt(creditScore);
      const stablecoinType = parseInt(stablecoin);

      // Request loan
      const tx = await contracts.lending.requestLoanInStablecoin(
        collateralAmount,
        borrowAmountUnits,
        score,
        stablecoinType
      );

      setStatus({
        type: 'info',
        message: 'Transaction pending...',
      });

      const receipt = await tx.wait();

      setStatus({
        type: 'success',
        message: `Loan created successfully! Tx: ${receipt.transactionHash}`,
      });

      // Reset form
      setCollateral('');
      setBorrowAmount('');
      setCreditScore('');
      setStablecoin('0');
    } catch (error) {
      console.error('Loan creation failed:', error);
      setStatus({
        type: 'error',
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaxCollateral = () => {
    setCollateral(usdcBalance);
  };

  return (
    <div className="card">
      <h2 className="card-title">Request Loan</h2>

      {status && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>USDC Collateral (Max: {usdcBalance})</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              placeholder="Enter collateral amount"
              step="0.01"
              disabled={loading}
              required
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMaxCollateral}
              style={{ flex: 0, padding: '12px 16px', width: 'auto' }}
              disabled={loading}
            >
              Max
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Borrow Amount</label>
          <input
            type="number"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="Enter borrow amount"
            step="0.01"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>Credit Score (0-100)</label>
          <input
            type="number"
            value={creditScore}
            onChange={(e) => setCreditScore(e.target.value)}
            placeholder="Enter credit score"
            min="0"
            max="100"
            disabled={loading}
            required
          />
          <small style={{ color: '#999', marginTop: '5px' }}>
            Higher score = lower interest rate
          </small>
        </div>

        <div className="form-group">
          <label>Borrow Currency</label>
          <select
            value={stablecoin}
            onChange={(e) => setStablecoin(e.target.value)}
            disabled={loading}
          >
            <option value="0">USDC</option>
            <option value="1">EURC</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <span className="loading"></span> : 'Create Loan'}
        </button>
      </form>

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        ℹ️ Collateral ratio must be at least 120% of borrow amount
      </div>
    </div>
  );
}

export default LoanForm;
