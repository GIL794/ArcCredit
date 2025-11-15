// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @notice Provides credit scores for borrowers
 * Core idea: Business submits ZK-proofs of bank balance, invoice history, payment patterns
 * Chainlink Functions evaluates proofs and returns encrypted credit score
 */
contract CreditOracle is AccessControl {
    
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    // Store credit scores keyed by borrower address
    mapping(address => uint256) public creditScores;
    mapping(address => uint256) public lastScoreUpdate;
    
    // Mock Chainlink config (for future integration)
    bytes32 public jobId;
    uint256 public fee;
    
    event CreditScoreUpdated(address indexed borrower, uint256 score, uint256 timestamp);
    
    constructor(
        bytes32 _jobId,
        uint256 _fee
    ) {
        jobId = _jobId;
        fee = _fee;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @notice Set credit score for a borrower (admin/oracle only)
     * @param _borrower Borrower's address
     * @param _score Credit score (0-100)
     */
    function setCreditScore(
        address _borrower,
        uint256 _score
    ) external onlyRole(ORACLE_ROLE) {
        require(_score > 0 && _score <= 100, "Score must be between 1-100");
        creditScores[_borrower] = _score;
        lastScoreUpdate[_borrower] = block.timestamp;
        emit CreditScoreUpdated(_borrower, _score, block.timestamp);
    }
    
    /**
     * @notice Get stored credit score for a borrower
     */
    function getCreditScore(address _borrower) external view returns (uint256) {
        uint256 score = creditScores[_borrower];
        // Return default score if not set (useful for demo)
        if (score == 0) {
            return 65; // Default mid-range score
        }
        return score;
    }
    
    /**
     * @notice Request credit score evaluation via Chainlink Functions (stub for future)
     * @param _borrower Borrower's address
     * @param _vrfProofHash VRF-verified hash of business documents
     */
    function requestCreditScore(
        address _borrower,
        bytes32 _vrfProofHash
    ) external onlyRole(ORACLE_ROLE) returns (bytes32 requestId) {
        // TODO: Integrate with Chainlink Functions API when available
        // For now, this is a placeholder
        requestId = keccak256(abi.encodePacked(_borrower, _vrfProofHash, block.timestamp));
        return requestId;
    }
}
