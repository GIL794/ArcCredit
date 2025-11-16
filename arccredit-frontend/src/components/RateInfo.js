import React, { useState, useEffect, useCallback } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../hooks/useWeb3';

function RateInfo() {
  const { signer, provider, account } = useWeb3();
  const contracts = useContracts(signer, provider);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = useCallback(async () => {
    if (!contracts) {
      console.log('⚠️ RateInfo: Contracts not available');
      setLoading(false);
      return;
    }

    if (!contracts.rateModel) {
      console.error('❌ RateInfo: rateModel contract not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('📊 RateInfo: Fetching interest rates...');
      const scoreRates = [];
      for (let score of [90, 75, 65, 50, 40]) {
        try {
          const rate = await contracts.rateModel.calculateBorrowRate(score);
          console.log(`📊 RateInfo: Score ${score}, raw rate:`, rate);
          
          // Rate is returned in basis points (e.g., 2000 = 20%)
          // Convert to percentage: divide by 100 to get percentage
          let rateNum;
          if (typeof rate === 'bigint') {
            rateNum = Number(rate);
          } else if (typeof rate === 'object' && rate.toString) {
            rateNum = Number(rate.toString());
          } else {
            rateNum = Number(rate);
          }
          
          // Basis points to percentage: 2000 basis points = 20%
          const ratePercent = (rateNum / 100).toFixed(2);
          
          console.log(`📊 RateInfo: Score ${score}, rate: ${ratePercent}%`);
          scoreRates.push({
            score,
            rate: ratePercent,
          });
        } catch (scoreError) {
          console.error(`❌ Failed to fetch rate for score ${score}:`, scoreError);
          // Continue with other scores
        }
      }
      
      if (scoreRates.length > 0) {
        console.log('✅ RateInfo: Rates fetched successfully:', scoreRates);
        setRates(scoreRates);
      } else {
        console.error('❌ RateInfo: No rates fetched');
        setRates([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch rates:', error);
      setRates([]);
    } finally {
      setLoading(false);
    }
  }, [contracts]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  if (!contracts) {
    // Check if wallet is connected - if yes, contracts are loading
    // Also check localStorage as fallback
    const storedAddress = localStorage.getItem('wallet_address');
    const hasAccount = account || storedAddress;
    
    if (hasAccount) {
      const displayAccount = account || storedAddress;
      return (
        <div className="card">
          <h2 className="card-title">Interest Rate Schedule</h2>
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
        <h2 className="card-title">Interest Rate Schedule</h2>
        <div className="alert alert-warning">
          ⚠️ Please connect your wallet first to load contract addresses.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Interest Rate Schedule</h2>

      <div className="alert alert-info">
        ℹ️ Interest rates are calculated based on credit score: 5% base + 0.5% per score point
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span className="loading"></span>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Loading interest rates...
          </div>
        </div>
      ) : rates.length === 0 ? (
        <div className="alert alert-warning">
          ⚠️ Could not load interest rates. Please check your connection and try again.
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
            Make sure contracts are deployed and the rate model contract is accessible.
          </div>
        </div>
      ) : (
        <div>
          <table className="rate-table">
            <thead>
              <tr>
                <th>Credit Score</th>
                <th>Interest Rate (APR)</th>
                <th>30-Day Cost</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.score}/100</td>
                  <td style={{ color: '#667eea', fontWeight: 600 }}>{item.rate}%</td>
                  <td>
                    {(1000 * (parseFloat(item.rate) / 100) * (30 / 365)).toFixed(2)} USDC
                    <br />
                    <small style={{ color: '#999' }}>on 1000 USDC loan</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="alert alert-warning" style={{ marginTop: '20px' }}>
            ⚠️ Interest accrues daily and is compounded on repayment
          </div>

          <div className="loan-info" style={{ marginTop: '20px' }}>
            <p style={{ marginBottom: '10px', fontWeight: 600 }}>Key Features:</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Variable rates based on creditworthiness</li>
              <li>Lower rates for higher credit scores</li>
              <li>Fair pricing reflecting actual risk</li>
              <li>Better than traditional finance (15-25%)</li>
              <li>Multi-stablecoin support (USDC & EURC)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default RateInfo;

