// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VerificationRegistry
 * @dev Records third-party verification events, proofs, and audit logs.
 */
contract VerificationRegistry {
    struct VerificationEvent {
        bytes32 claimHash;
        address verifier;
        uint256 timestamp;
        bool isAuthentic;
        bytes32 evidenceCommitment;
        string verificationMethod; // e.g. "PUBLIC_PORTAL", "QR_MOBILE_SCAN", "API_CROSS_CHECK"
    }

    VerificationEvent[] public verifications;
    mapping(bytes32 => uint256[]) public claimVerificationIndices;

    event VerificationLogged(
        bytes32 indexed claimHash,
        address indexed verifier,
        bool isAuthentic,
        string verificationMethod,
        uint256 timestamp
    );

    function logVerification(
        bytes32 claimHash,
        bool isAuthentic,
        bytes32 evidenceCommitment,
        string calldata verificationMethod
    ) external returns (uint256) {
        uint256 eventIndex = verifications.length;

        verifications.push(VerificationEvent({
            claimHash: claimHash,
            verifier: msg.sender,
            timestamp: block.timestamp,
            isAuthentic: isAuthentic,
            evidenceCommitment: evidenceCommitment,
            verificationMethod: verificationMethod
        }));

        claimVerificationIndices[claimHash].push(eventIndex);

        emit VerificationLogged(
            claimHash,
            msg.sender,
            isAuthentic,
            verificationMethod,
            block.timestamp
        );

        return eventIndex;
    }

    function getVerificationsCountForClaim(bytes32 claimHash) external view returns (uint256) {
        return claimVerificationIndices[claimHash].length;
    }

    function totalVerifications() external view returns (uint256) {
        return verifications.length;
    }
}
