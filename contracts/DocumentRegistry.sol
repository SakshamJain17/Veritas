// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Anchors cryptographic fingerprints (SHA-256 / Keccak-256) of raw public records.
 *      Notice: The raw document is NEVER stored on-chain. Only its immutable hash
 *      and issuer attestation are anchored to prove existence and tamper-evidence.
 */
contract DocumentRegistry {
    struct DocumentRecord {
        bytes32 documentHash;
        address issuer;
        uint256 timestamp;
        uint256 blockNumber;
        bool isRevoked;
        string documentType;
        bytes32 metadataCommitment; // Hash of private metadata schema
    }

    address public owner;
    mapping(bytes32 => DocumentRecord) public documents;
    bytes32[] public documentHashes;

    event DocumentRegistered(
        bytes32 indexed documentHash,
        address indexed issuer,
        string documentType,
        uint256 timestamp
    );
    event DocumentRevoked(bytes32 indexed documentHash, address indexed revoker, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "VERITAS: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Registers a document cryptographic fingerprint on-chain
     * @param documentHash The SHA-256/Keccak-256 fingerprint of the off-chain document
     * @param issuer The public address of the issuing authority
     * @param documentType Descriptive category (e.g. LandRecord, TradeLicense)
     * @param metadataCommitment Merkle root or hash of sanitized metadata
     */
    function registerDocument(
        bytes32 documentHash,
        address issuer,
        string calldata documentType,
        bytes32 metadataCommitment
    ) external {
        require(documentHash != bytes32(0), "VERITAS: invalid document hash");
        require(documents[documentHash].timestamp == 0, "VERITAS: document already registered");

        documents[documentHash] = DocumentRecord({
            documentHash: documentHash,
            issuer: issuer,
            timestamp: block.timestamp,
            blockNumber: block.number,
            isRevoked: false,
            documentType: documentType,
            metadataCommitment: metadataCommitment
        });

        documentHashes.push(documentHash);

        emit DocumentRegistered(documentHash, issuer, documentType, block.timestamp);
    }

    /**
     * @notice Verifies if a document fingerprint exists and has not been revoked
     * @param documentHash The document fingerprint to query
     */
    function verifyDocument(bytes32 documentHash)
        external
        view
        returns (
            bool exists,
            address issuer,
            uint256 timestamp,
            uint256 blockNumber,
            bool isRevoked,
            string memory documentType
        )
    {
        DocumentRecord memory doc = documents[documentHash];
        if (doc.timestamp == 0) {
            return (false, address(0), 0, 0, false, "");
        }
        return (
            true,
            doc.issuer,
            doc.timestamp,
            doc.blockNumber,
            doc.isRevoked,
            doc.documentType
        );
    }

    /**
     * @notice Revokes a registered document in case of administrative cancellation or forgery
     */
    function revokeDocument(bytes32 documentHash, string calldata reason) external {
        DocumentRecord storage doc = documents[documentHash];
        require(doc.timestamp != 0, "VERITAS: document not found");
        require(msg.sender == doc.issuer || msg.sender == owner, "VERITAS: unauthorized revoker");
        require(!doc.isRevoked, "VERITAS: already revoked");

        doc.isRevoked = true;
        emit DocumentRevoked(documentHash, msg.sender, reason);
    }

    function totalDocuments() external view returns (uint256) {
        return documentHashes.length;
    }
}
