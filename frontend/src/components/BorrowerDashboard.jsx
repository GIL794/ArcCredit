// src/BorrowerDashboard.jsx
export function BorrowerDashboard() {
  const [loanData, setLoanData] = useState(null);
  const { library, account } = useWeb3React();
  
  useEffect(() => {
    if (account && library) {
      fetchLoanStatus(account);
    }
  }, [account, library]);
  
  return (
    <div>
      <h2>Your Loan</h2>
      {loanData && (
        <>
          <p>Collateral: {loanData.collateral} USDC</p>
          <p>Borrowed: {loanData.borrowed} USDC</p>
          <p>Interest: {loanData.interest} USDC</p>
          <p>Credit Score: {loanData.creditScore}</p>
          <button onClick={handleRepayLoan}>Repay Loan</button>
        </>
      )}
    </div>
  );
}
