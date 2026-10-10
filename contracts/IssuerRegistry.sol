// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IssuerRegistry
 * @dev Governs trusted public authorities (Sub-Registrars, Municipalities, Universities).
 */
contract IssuerRegistry {
    struct Issuer {
        address issuerAddress;
        string name;
        string jurisdiction;
        string publicKeyURI;
        bool isVerified;
        bool isRevoked;
        uint256 registeredAt;
        uint256 documentCount;
    }

    address public admin;
    mapping(address => Issuer) public issuers;
    address[] public issuerList;

    event IssuerRegistered(address indexed issuerAddress, string name, string jurisdiction);
    event IssuerVerified(address indexed issuerAddress);
    event IssuerRevoked(address indexed issuerAddress, string reason);
    event IssuerDocumentCountIncremented(address indexed issuerAddress, uint256 newCount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "VERITAS: caller is not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerIssuer(
        address issuerAddress,
        string calldata name,
        string calldata jurisdiction,
        string calldata publicKeyURI
    ) external onlyAdmin {
        require(issuerAddress != address(0), "VERITAS: invalid address");
        require(issuers[issuerAddress].registeredAt == 0, "VERITAS: issuer already registered");

        issuers[issuerAddress] = Issuer({
            issuerAddress: issuerAddress,
            name: name,
            jurisdiction: jurisdiction,
            publicKeyURI: publicKeyURI,
            isVerified: true,
            isRevoked: false,
            registeredAt: block.timestamp,
            documentCount: 0
        });

        issuerList.push(issuerAddress);
        emit IssuerRegistered(issuerAddress, name, jurisdiction);
    }

    function verifyIssuer(address issuerAddress) external onlyAdmin {
        require(issuers[issuerAddress].registeredAt != 0, "VERITAS: issuer not found");
        issuers[issuerAddress].isVerified = true;
        issuers[issuerAddress].isRevoked = false;
        emit IssuerVerified(issuerAddress);
    }

    function revokeIssuer(address issuerAddress, string calldata reason) external onlyAdmin {
        require(issuers[issuerAddress].registeredAt != 0, "VERITAS: issuer not found");
        issuers[issuerAddress].isRevoked = true;
        issuers[issuerAddress].isVerified = false;
        emit IssuerRevoked(issuerAddress, reason);
    }

    function isIssuerActive(address issuerAddress) external view returns (bool) {
        Issuer memory issuer = issuers[issuerAddress];
        return (issuer.registeredAt != 0 && issuer.isVerified && !issuer.isRevoked);
    }

    function getIssuer(address issuerAddress) external view returns (Issuer memory) {
        return issuers[issuerAddress];
    }

    function totalIssuers() external view returns (uint256) {
        return issuerList.length;
    }
}
