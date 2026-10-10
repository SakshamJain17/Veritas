// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ClaimRegistry
 * @dev Stores cryptographic commitments of structured claims extracted from documents.
 *      Links a specific claim hash to its parent document hash and evidence commitment.
 */
contract ClaimRegistry {
    struct ClaimRecord {
        bytes32 claimHash;
        bytes32 documentHash;
        bytes32 evidenceCommitment; // Hash of (page + bounding box coordinates + OCR text snippet)
        address verifier;
        uint256 timestamp;
        uint256 blockNumber;
        bool isAttested;
        bool isRevoked;
        string predicate; // e.g. "ownedBy", "licenseNumber", "registeredArea"
    }

    address public owner;
    mapping(bytes32 => ClaimRecord) public claims;
    bytes32[] public claimHashes;

    event ClaimRegistered(
        bytes32 indexed claimHash,
        bytes32 indexed documentHash,
        string predicate,
        uint256 timestamp
    );
    event ClaimAttested(
        bytes32 indexed claimHash,
        address indexed verifier,
        uint256 timestamp
    );
    event ClaimRevoked(
        bytes32 indexed claimHash,
        address indexed revoker,
        string reason
    );

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Registers a structured claim anchored to an underlying document hash
     */
    function registerClaim(
        bytes32 claimHash,
        bytes32 documentHash,
        bytes32 evidenceCommitment,
        string calldata predicate
    ) external {
        require(claimHash != bytes32(0), "VERITAS: invalid claim hash");
        require(claims[claimHash].timestamp == 0, "VERITAS: claim already registered");

        claims[claimHash] = ClaimRecord({
            claimHash: claimHash,
            documentHash: documentHash,
            evidenceCommitment: evidenceCommitment,
            verifier: address(0),
            timestamp: block.timestamp,
            blockNumber: block.number,
            isAttested: false,
            isRevoked: false,
            predicate: predicate
        });

        claimHashes.push(claimHash);

        emit ClaimRegistered(claimHash, documentHash, predicate, block.timestamp);
    }

    /**
     * @notice Attests to an existing claim after human-in-the-loop or third-party validation
     */
    function attestClaim(bytes32 claimHash) external {
        ClaimRecord storage c = claims[claimHash];
        require(c.timestamp != 0, "VERITAS: claim not found");
        require(!c.isRevoked, "VERITAS: cannot attest revoked claim");

        c.verifier = msg.sender;
        c.isAttested = true;

        emit ClaimAttested(claimHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Revokes a claim if a conflict or forgery is confirmed
     */
    function revokeClaim(bytes32 claimHash, string calldata reason) external {
        ClaimRecord storage c = claims[claimHash];
        require(c.timestamp != 0, "VERITAS: claim not found");
        require(!c.isRevoked, "VERITAS: claim already revoked");

        c.isRevoked = true;
        emit ClaimRevoked(claimHash, msg.sender, reason);
    }

    /**
     * @notice Query claim verification status
     */
    function verifyClaim(bytes32 claimHash)
        external
        view
        returns (
            bool exists,
            bytes32 documentHash,
            bytes32 evidenceCommitment,
            address verifier,
            uint256 timestamp,
            bool isAttested,
            bool isRevoked,
            string memory predicate
        )
    {
        ClaimRecord memory c = claims[claimHash];
        if (c.timestamp == 0) {
            return (false, bytes32(0), bytes32(0), address(0), 0, false, false, "");
        }
        return (
            true,
            c.documentHash,
            c.evidenceCommitment,
            c.verifier,
            c.timestamp,
            c.isAttested,
            c.isRevoked,
            c.predicate
        );
    }

    function totalClaims() external view returns (uint256) {
        return claimHashes.length;
    }
}
