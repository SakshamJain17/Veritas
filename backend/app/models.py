from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class BoundingRegion(BaseModel):
    page: int
    x: float  # percentage 0-100 or px
    y: float
    width: float
    height: float

class BlockchainAnchor(BaseModel):
    isAnchored: bool = False
    network: str = "VERITAS Demo Network (EVM Simulated)"
    txHash: Optional[str] = None
    blockNumber: Optional[int] = None
    timestamp: Optional[str] = None
    status: str = "UNANCHORED"  # UNANCHORED, PENDING, IMMUTABLE ANCHOR
    gasUsed: Optional[int] = None
    contractAddress: Optional[str] = None

class Claim(BaseModel):
    id: str
    subject: str
    predicate: str
    object: str
    confidence: float  # 0.0 to 1.0 (e.g. 0.97)
    confidenceTier: str = "HIGH"  # HIGH, MEDIUM, LOW
    sourceDocumentId: str
    sourceDocumentName: str
    sourcePage: int
    evidenceRegion: BoundingRegion
    rawSnippet: str
    issuerId: str
    issuerName: str
    issuerVerified: bool = True
    createdAt: str
    integrityStatus: str = "VERIFIED"  # VERIFIED, UNVERIFIED, TAMPER_SUSPECT
    verificationStatus: str = "VERIFIED"  # VERIFIED, PENDING_REVIEW, CONFLICT, REVOKED
    blockchainAnchor: BlockchainAnchor
    hasConflict: bool = False
    conflictId: Optional[str] = None

class Document(BaseModel):
    id: str
    title: str
    documentType: str  # Land Record, License, Receipt, Certificate, Identity, Permit
    language: str  # English, Hindi, Bengali, Tamil, Marathi, Multilingual
    pageCount: int
    fileSizeKb: int
    hashSha256: str
    uploadedAt: str
    status: str  # INGESTED, EXTRACTED, ANCHORED, CONFLICT_DETECTED
    claimsCount: int
    issuerId: str
    issuerName: str
    issuerAddress: str
    isAnchored: bool = False
    blockchainTx: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    previewPages: List[str] = []

class ContradictionValue(BaseModel):
    value: str
    docCount: int
    docIds: List[str]
    docNames: List[str]
    pages: List[int]

class Contradiction(BaseModel):
    id: str
    field: str
    entitySubject: str
    valuesFound: List[ContradictionValue]
    status: str = "REQUIRES HUMAN REVIEW"  # REQUIRES HUMAN REVIEW, RESOLVED, DISMISSED
    severity: str = "HIGH"  # HIGH, MEDIUM, LOW
    explanation: str
    detectedAt: str
    reviewAction: Optional[str] = None
    reviewerNotes: Optional[str] = None

class Issuer(BaseModel):
    id: str
    name: str
    jurisdiction: str
    address: str
    publicKeyUri: str
    isVerified: bool = True
    isRevoked: bool = False
    registeredAt: str
    documentsIssued: int
    claimsIssued: int
    revocationCount: int = 0
    status: str = "PENDING_VERIFICATION"
    demoRecord: bool = False
    statusChangedAt: Optional[str] = None
    statusReason: Optional[str] = None
    revokedAt: Optional[str] = None
    statusHistory: List[Dict[str, Any]] = []

class AuditEvent(BaseModel):
    id: str
    timestamp: str
    actor: str
    action: str
    object: str
    details: str
    txHash: Optional[str] = None
    blockNumber: Optional[int] = None

class VerificationPackage(BaseModel):
    claimId: str
    subject: str
    predicate: str
    object: str
    claimHash: str
    documentHash: str
    sourceDocumentName: str
    sourcePage: int
    evidenceRegion: BoundingRegion
    rawSnippet: str
    issuer: Dict[str, Any]
    integrityStatus: str
    verificationStatus: str
    blockchainRecord: BlockchainAnchor
    crossDocumentValidation: Dict[str, Any]
    verifiedAt: str
    privacyNotice: str = "Original document remains off-chain and private. Only cryptographic commitments and targeted evidence snippets are disclosed."
