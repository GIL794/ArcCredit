import React, { useState, useEffect } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../hooks/useWeb3';

function RateInfo() {
  const { signer } = useWeb3();
  const contracts = useContracts(signer);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, [contracts]);

  const fetchRates = async () => {
    if (!contracts) return;

    setLoading(true);
    try {
      const scoreRates = [];
      for (let score of [90, 75, 65, 50, 40]) {
        const rate = await contracts.rateModel.calculateBorrowRate(score);
        const rateNum = typeof rate === 'number' ? rate : Number(rate);
        scoreRates.push({
          score,
          rate: (rateNum / 100).toFixed(2),
        });
      }
      setRates(scoreRates);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Interest Rate Schedule</h2>

      <div className="alert alert-info">
        ℹ️ Interest rates are calculated based on credit score: 5% base + 0.5% per score point
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span className="loading"></span>
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
