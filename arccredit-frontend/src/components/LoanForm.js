import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';
import { useContracts } from '../hooks/useContracts';

function LoanForm({ onLoanCreated }) {
  const { signer, account, provider, error: walletError } = useWeb3();
  const contracts = useContracts(signer, provider);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 LoanForm: State check', {
      hasAccount: !!account,
      account: account,
      hasProvider: !!provider,
      hasSigner: !!signer,
      hasContracts: !!contracts,
      walletError: walletError
    });
  }, [account, provider, signer, contracts, walletError]);
  const [collateral, setCollateral] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [stablecoin, setStablecoin] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!contracts || !account || !provider) return;
      try {
        // Skip contract existence check - just try to fetch balance
        // If contract doesn't exist, the balanceOf call will fail with a clear error
        const balance = await contracts.usdc.balanceOf(account);
        setUsdcBalance(ethers.formatUnits(String(balance), 6));
        // Clear any previous error status on success
        setStatus(null);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        
        // Check for specific error types
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode') || (error.message.includes('0x') && error.message.includes('result data'))) {
          const usdcAddress = contracts.usdc.target;
          // Check if this is a network mismatch issue
          const isBrowserProvider = provider && provider.constructor.name === 'BrowserProvider';
          if (isBrowserProvider) {
            setStatus({
              type: 'error',
              message: `Network mismatch: Your wallet is connected to a different network. Please switch to Hardhat localhost (Chain ID: 31337) or connect using the Hardhat option.`
            });
          } else {
            setStatus({
              type: 'error',
              message: `Contract not found at address ${usdcAddress.slice(0, 10)}...${usdcAddress.slice(-8)}. Please redeploy: npx hardhat run scripts/deploy.js --network localhost (Make sure Hardhat node is running: npx hardhat node)`
            });
          }
        } else if (error.message && error.message.includes('timeout')) {
          setStatus({
            type: 'error',
            message: `Connection timeout. Please check if Hardhat node is running: npx hardhat node`
          });
        } else {
          setStatus({
            type: 'error',
            message: `Failed to fetch balance: ${error.message}`
          });
        }
        setUsdcBalance('0');
      }
    };

    fetchBalance();
  }, [contracts, account, provider]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (walletError) {
      setStatus({
        type: 'error',
        message: `Wallet error: ${walletError}. Please reconnect your wallet.`,
      });
      return;
    }

    if (!contracts) {
      setStatus({
        type: 'error',
        message: 'Contracts not initialized. Please check your connection and RPC URL.',
      });
      return;
    }

    if (!signer) {
      setStatus({
        type: 'error',
        message: 'No signer available. Please ensure your wallet is properly connected.',
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const collateralAmount = ethers.parseUnits(collateral, 6);
      const borrowAmountUnits = ethers.parseUnits(borrowAmount, 6);
      const score = parseInt(creditScore);
      const stablecoinType = parseInt(stablecoin);

      console.log('📝 LoanForm: Creating loan with params:', {
        collateral: collateral,
        borrowAmount: borrowAmount,
        score: score,
        stablecoinType: stablecoinType,
        collateralAmount: collateralAmount.toString(),
        borrowAmountUnits: borrowAmountUnits.toString()
      });

      // Check and approve USDC for collateral transfer
      const lendingAddress = contracts.lending.target;
      const currentAllowance = await contracts.usdc.allowance(account, lendingAddress);
      console.log('📝 LoanForm: Current USDC allowance:', currentAllowance.toString());
      
      if (currentAllowance < collateralAmount) {
        console.log('📝 LoanForm: Approving USDC for collateral...');
        setStatus({
          type: 'info',
          message: 'Approving USDC for collateral transfer...',
        });
        
        const approveTx = await contracts.usdc.approve(lendingAddress, collateralAmount);
        await approveTx.wait();
        console.log('✅ LoanForm: USDC approved');
      }

      // Request loan
      console.log('📝 LoanForm: Calling requestLoanInStablecoin...');
      const tx = await contracts.lending.requestLoanInStablecoin(
        collateralAmount,
        borrowAmountUnits,
        score,
        stablecoinType
      );
      
      console.log('📝 LoanForm: Transaction sent:', tx.hash);

      setStatus({
        type: 'info',
        message: 'Transaction pending...',
      });

      console.log('📝 LoanForm: Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ LoanForm: Transaction confirmed:', receipt.transactionHash);

      // Verify loan was created by checking loan status
      try {
        console.log('📝 LoanForm: Verifying loan was created...');
        const [collateral, borrowed, interest, creditScore, active] = await contracts.lending.getLoanStatus(account);
        console.log('📝 LoanForm: Loan status after creation:', {
          collateral: collateral.toString(),
          borrowed: borrowed.toString(),
          interest: interest.toString(),
          creditScore: creditScore.toString(),
          active: active
        });
        
        if (active) {
          setStatus({
            type: 'success',
            message: `Loan created successfully! Borrowed: ${ethers.formatUnits(borrowed, 6)} ${stablecoinType === 0 ? 'USDC' : 'EURC'}. Tx: ${receipt.transactionHash}`,
          });
        } else {
          setStatus({
            type: 'warning',
            message: `Transaction confirmed but loan status not active. Tx: ${receipt.transactionHash}`,
          });
        }
      } catch (verifyErr) {
        console.warn('Could not verify loan status:', verifyErr);
        setStatus({
          type: 'success',
          message: `Transaction confirmed! Tx: ${receipt.transactionHash}. Please check loan status tab.`,
        });
      }

      // Refresh balance
      try {
        const balance = await contracts.usdc.balanceOf(account);
        const newBalance = ethers.formatUnits(String(balance), 6);
        setUsdcBalance(newBalance);
        console.log('✅ LoanForm: Balance refreshed:', newBalance);
        
        // Also check borrowed token balance if EURC
        if (stablecoinType === 1) {
          try {
            const eurcBalance = await contracts.eurc.balanceOf(account);
            console.log('✅ LoanForm: EURC balance:', ethers.formatUnits(String(eurcBalance), 6));
          } catch (err) {
            console.warn('Could not fetch EURC balance:', err);
          }
        }
      } catch (err) {
        console.warn('Could not refresh balance:', err);
      }

      // Reset form
      setCollateral('');
      setBorrowAmount('');
      setCreditScore('');
      setStablecoin('0');
      
      // Notify parent to refresh loan status
      if (onLoanCreated) {
        onLoanCreated();
      } else {
        // Fallback: reload page after delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
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

  if (!contracts) {
    // Check if wallet is connected - if yes, contracts are loading
    // Also check localStorage as fallback
    const storedAddress = localStorage.getItem('wallet_address');
    const hasAccount = account || storedAddress;
    
    if (hasAccount) {
      const displayAccount = account || storedAddress;
      return (
        <div className="card">
          <h2 className="card-title">Request Loan</h2>
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
                <div style={{ fontSize: '10px', marginTop: '4px', color: '#999' }}>
                  If this persists, try disconnecting and reconnecting your wallet.
                </div>
              </div>
            )}
            {provider && !contracts && (
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>
                ✅ Provider available, initializing contracts...
              </div>
            )}
            {walletError && (
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#d32f2f' }}>
                Error: {walletError}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="card">
        <h2 className="card-title">Request Loan</h2>
        <div className="alert alert-warning">
          ⚠️ Please connect your wallet first to load contract addresses.
          <div style={{ fontSize: '11px', marginTop: '8px', color: '#999' }}>
            Debug: account={account ? 'set' : 'null'}, provider={provider ? 'set' : 'null'}
            {!account && !provider && (
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
                💡 Click "Connect Wallet" in the header to connect your wallet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          disabled={loading || !contracts}
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

