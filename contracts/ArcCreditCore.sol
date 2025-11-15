// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IInterestRateModel {
    function calculateBorrowRate(uint256 creditScore) external pure returns (uint256);
    function calculateInterest(uint256 principal, uint256 rate, uint256 duration) external pure returns (uint256);
}

contract ArcCreditCore is ReentrancyGuard, AccessControl {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // ============ Types ============
    
    enum StablecoinType { USDC, EURC }
    
    // ============ State ============
    
    IERC20 public immutable usdc; // Arc's USDC
    IERC20 public immutable eurc; // Arc's EURC
    IInterestRateModel public interestModel;
    
    struct Loan {
        address borrower;
        uint256 collateral;
        uint256 borrowed;
        uint256 creditScore;
        uint256 createdAt;
        uint256 lastInterestUpdate;
        uint256 accumulatedInterest;
        StablecoinType stablecoin;
        bool active;
    }
    
    mapping(address => Loan) public loans;
    
    uint256 public constant MIN_COLLATERAL_RATIO = 120; // 120%
    uint256 public constant MAX_LOAN_DURATION = 365 days;
    
    // ============ Events ============
    
    event LoanCreated(address indexed borrower, uint256 collateral, uint256 borrowed, uint256 creditScore);
    event InterestAccrued(address indexed borrower, uint256 interest, uint256 totalOwed);
    event LoanRepaid(address indexed borrower, uint256 principal, uint256 interest);
    event CreditScoreUpdated(address indexed borrower, uint256 newScore);
    
    // ============ Constructor ============
    
    constructor(address _usdc, address _eurc, address _rateModel) {
        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        interestModel = IInterestRateModel(_rateModel);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Request a loan in USDC or EURC
     * @param _collateralAmount USDC to lock as collateral
     * @param _borrowAmount Amount to borrow
     * @param _creditScore Credit score (0-100)
     * @param _borrowStablecoin Which stablecoin to borrow: 0=USDC, 1=EURC
     */
    function requestLoanInStablecoin(
        uint256 _collateralAmount,
        uint256 _borrowAmount,
        uint256 _creditScore,
        uint8 _borrowStablecoin  // 0 = USDC, 1 = EURC
    ) external nonReentrant {
        require(_collateralAmount > 0, "Invalid collateral");
        require(_borrowAmount > 0, "Invalid borrow amount");
        require(!loans[msg.sender].active, "Active loan exists");
        require(_creditScore > 0 && _creditScore <= 100, "Invalid score");
        require(_borrowStablecoin <= 1, "Invalid stablecoin type");
        
        // Verify collateralization ratio
        uint256 minCollateral = (_borrowAmount * MIN_COLLATERAL_RATIO) / 100;
        require(_collateralAmount >= minCollateral, "Insufficient collateral");
        
        // Transfer USDC collateral from borrower
        require(
            usdc.transferFrom(msg.sender, address(this), _collateralAmount),
            "Collateral transfer failed"
        );
        
        // Create loan record
        StablecoinType stablecoinType = _borrowStablecoin == 0 ? StablecoinType.USDC : StablecoinType.EURC;
        
        loans[msg.sender] = Loan({
            borrower: msg.sender,
            collateral: _collateralAmount,
            borrowed: _borrowAmount,
            creditScore: _creditScore,
            createdAt: block.timestamp,
            lastInterestUpdate: block.timestamp,
            accumulatedInterest: 0,
            stablecoin: stablecoinType,
            active: true
        });
        
        // Disburse loan in chosen stablecoin
        IERC20 disbursementToken = stablecoinType == StablecoinType.USDC ? usdc : eurc;
        
        require(
            disbursementToken.transfer(msg.sender, _borrowAmount),
            "Loan disbursement failed"
        );
        
        emit LoanCreated(msg.sender, _collateralAmount, _borrowAmount, _creditScore);
    }
    
    /**
     * @notice Accrue interest on active loan
     */
    function accrueInterest(address _borrower) public {
        Loan storage loan = loans[_borrower];
        require(loan.active, "No active loan");
        
        uint256 timeElapsed = block.timestamp - loan.lastInterestUpdate;
        if (timeElapsed == 0) return;
        
        uint256 daysElapsed = timeElapsed / 1 days;
        uint256 borrowRate = interestModel.calculateBorrowRate(loan.creditScore);
        
        uint256 newInterest = IInterestRateModel(address(interestModel)).calculateInterest(
            loan.borrowed,
            borrowRate,
            daysElapsed
        );
        
        loan.accumulatedInterest += newInterest;
        loan.lastInterestUpdate = block.timestamp;
        
        emit InterestAccrued(_borrower, newInterest, loan.borrowed + loan.accumulatedInterest);
    }
    
    /**
     * @notice Repay loan principal + interest
     */
    function repayLoan() external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "No active loan");
        
        // Accrue any pending interest
        accrueInterest(msg.sender);
        
        uint256 totalRepayment = loan.borrowed + loan.accumulatedInterest;
        
        // Repay in the same stablecoin that was borrowed
        IERC20 repaymentToken = loan.stablecoin == StablecoinType.USDC ? usdc : eurc;
        
        // Transfer repayment from borrower
        require(
            repaymentToken.transferFrom(msg.sender, address(this), totalRepayment),
            "Repayment transfer failed"
        );
        
        // Return collateral
        require(
            usdc.transfer(msg.sender, loan.collateral),
            "Collateral return failed"
        );
        
        // Emit event before deletion
        uint256 principal = loan.borrowed;
        uint256 interest = loan.accumulatedInterest;
        
        // Mark loan as inactive
        loan.active = false;
        
        emit LoanRepaid(msg.sender, principal, interest);
    }
    
    /**
     * @notice Get loan status
     */
    function getLoanStatus(address _borrower) 
        external 
        view 
        returns (
            uint256 collateral,
            uint256 borrowed,
            uint256 interest,
            uint256 creditScore,
            bool active
        ) 
    {
        Loan storage loan = loans[_borrower];
        return (
            loan.collateral,
            loan.borrowed,
            loan.accumulatedInterest,
            loan.creditScore,
            loan.active
        );
    }
    
    /**
     * @notice Update credit score (called by oracle)
     */
    function updateCreditScore(address _borrower, uint256 _newScore) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(loans[_borrower].active, "No active loan");
        require(_newScore > 0 && _newScore <= 100, "Invalid score");
        
        loans[_borrower].creditScore = _newScore;
        emit CreditScoreUpdated(_borrower, _newScore);
    }
}
