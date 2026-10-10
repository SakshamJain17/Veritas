from typing import List, Dict, Any
import hashlib
import copy
from app.storage import load_state, save_state, local_persistence_enabled

DEMO_ISSUERS: List[Dict[str, Any]] = [
    {
        "id": "iss-1",
        "name": "Sub-Registrar Office (Land Revenue Dept)",
        "jurisdiction": "Central District / Land Registration Division",
        "address": "0x71C2B9a0189A4eF3320c028a1F228498893181aB",
        "publicKeyUri": "https://veritas.network/keys/iss-1.pub",
        "isVerified": True,
        "isRevoked": False,
        "registeredAt": "2024-01-15T09:00:00Z",
        "documentsIssued": 428,
        "claimsIssued": 2140,
        "revocationCount": 0
    },
    {
        "id": "iss-2",
        "name": "Municipal Corporation (Urban Licensing Bureau)",
        "jurisdiction": "Metropolitan Administrative Council",
        "address": "0x24BC772fA1829037418A375c329482910399fE42",
        "publicKeyUri": "https://veritas.network/keys/iss-2.pub",
        "isVerified": True,
        "isRevoked": False,
        "registeredAt": "2024-02-01T10:30:00Z",
        "documentsIssued": 612,
        "claimsIssued": 3672,
        "revocationCount": 1
    },
    {
        "id": "iss-3",
        "name": "National University Registrar (Credential Board)",
        "jurisdiction": "Higher Education Accreditation Council",
        "address": "0x89D429188491A82749210B38491029481944cC19",
        "publicKeyUri": "https://veritas.network/keys/iss-3.pub",
        "isVerified": True,
        "isRevoked": False,
        "registeredAt": "2024-03-10T14:15:00Z",
        "documentsIssued": 244,
        "claimsIssued": 976,
        "revocationCount": 0
    }
]

DEMO_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "doc-1",
        "title": "Land Ownership Certificate #LC-1842",
        "documentType": "Land Record",
        "language": "English / Hindi Bilingual",
        "pageCount": 4,
        "fileSizeKb": 1840,
        "hashSha256": "0x" + hashlib.sha256(b"veritas-demo-land-certificate").hexdigest(),
        "uploadedAt": "2026-09-29T08:15:00Z",
        "status": "ANCHORED",
        "claimsCount": 5,
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office (Land Revenue Dept)",
        "issuerAddress": "0x71C2B9a0189A4eF3320c028a1F228498893181aB",
        "isAnchored": True,
        "blockchainTx": "0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b",
        "thumbnailUrl": "/docs/land_certificate.png",
        "previewPages": ["Page 1: Title Header & Seals", "Page 2: Ownership Schedule & Survey Details", "Page 3: Encumbrance & Boundary Cert", "Page 4: Attestation & Sub-Registrar Signature"]
    },
    {
        "id": "doc-2",
        "title": "Municipal Trade License #LIC-92381",
        "documentType": "License",
        "language": "English",
        "pageCount": 2,
        "fileSizeKb": 920,
        "hashSha256": "0x" + hashlib.sha256(b"veritas-demo-trade-license").hexdigest(),
        "uploadedAt": "2026-09-29T08:22:00Z",
        "status": "ANCHORED",
        "claimsCount": 4,
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation (Urban Licensing Bureau)",
        "issuerAddress": "0x24BC772fA1829037418A375c329482910399fE42",
        "isAnchored": True,
        "blockchainTx": "0x4b782910e19a820c741b2e9834019a82c3d4e5f60718293a4b5c6d7e8f901a2b",
        "thumbnailUrl": "/docs/trade_license.png",
        "previewPages": ["Page 1: Trade License Authorization & Entity Name", "Page 2: Statutory Terms & Conditions"]
    },
    {
        "id": "doc-3",
        "title": "Mutation Extract Extract #MR-2021-99",
        "documentType": "Land Record",
        "language": "Hindi / English",
        "pageCount": 1,
        "fileSizeKb": 760,
        "hashSha256": "0x" + hashlib.sha256(b"veritas-demo-mutation-extract").hexdigest(),
        "uploadedAt": "2026-09-29T08:35:00Z",
        "status": "CONFLICT_DETECTED",
        "claimsCount": 3,
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office (Land Revenue Dept)",
        "issuerAddress": "0x71C2B9a0189A4eF3320c028a1F228498893181aB",
        "isAnchored": False,
        "blockchainTx": None,
        "thumbnailUrl": "/docs/mutation_extract.png",
        "previewPages": ["Page 1: Mutation Register Entry & Disputed Title"]
    },
    {
        "id": "doc-4",
        "title": "Property Tax Assessment Receipt #PTR-5520",
        "documentType": "Receipt",
        "language": "English",
        "pageCount": 1,
        "fileSizeKb": 540,
        "hashSha256": "0x" + hashlib.sha256(b"veritas-demo-property-tax-receipt").hexdigest(),
        "uploadedAt": "2026-09-29T08:40:00Z",
        "status": "ANCHORED",
        "claimsCount": 3,
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation (Urban Licensing Bureau)",
        "issuerAddress": "0x24BC772fA1829037418A375c329482910399fE42",
        "isAnchored": True,
        "blockchainTx": "0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
        "thumbnailUrl": "/docs/tax_receipt.png",
        "previewPages": ["Page 1: Annual Property Tax Assessment & Payment Slip"]
    },
    {
        "id": "doc-5",
        "title": "University Degree Certificate #DEG-8819",
        "documentType": "Certificate",
        "language": "English / Latin",
        "pageCount": 1,
        "fileSizeKb": 1250,
        "hashSha256": "0x" + hashlib.sha256(b"veritas-demo-university-certificate").hexdigest(),
        "uploadedAt": "2026-09-29T08:50:00Z",
        "status": "ANCHORED",
        "claimsCount": 3,
        "issuerId": "iss-3",
        "issuerName": "National University Registrar (Credential Board)",
        "issuerAddress": "0x89D429188491A82749210B38491029481944cC19",
        "isAnchored": True,
        "blockchainTx": "0x6f7e8d9c0b1a23456789abcdef0123456789abcdef0123456789abcdef012345",
        "thumbnailUrl": "/docs/university_degree.png",
        "previewPages": ["Page 1: Degree of Bachelor of Technology with Hologram & Seal"]
    }
]

DEMO_CLAIMS: List[Dict[str, Any]] = [
    {
        "id": "claim-1",
        "subject": "Land Parcel 184/2",
        "predicate": "ownedBy",
        "object": "Rahul Sharma",
        "confidence": 0.97,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-1",
        "sourceDocumentName": "Land Certificate #LC-1842",
        "sourcePage": 2,
        "evidenceRegion": {
            "page": 2,
            "x": 12.0,
            "y": 28.5,
            "width": 64.0,
            "height": 9.2
        },
        "rawSnippet": "SCHEDULE II - REVENUE TITLE: Registered Titleholder certified as RAHUL SHARMA S/O O.P. SHARMA, resident of Sector 14.",
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:16:10Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b",
            "blockNumber": 18472921,
            "timestamp": "2026-09-29T08:18:04Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 48210,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": True,
        "conflictId": "conf-1"
    },
    {
        "id": "claim-2",
        "subject": "Land Parcel 184/2",
        "predicate": "surveyNumber",
        "object": "184/2",
        "confidence": 0.99,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-1",
        "sourceDocumentName": "Land Certificate #LC-1842",
        "sourcePage": 2,
        "evidenceRegion": {
            "page": 2,
            "x": 12.0,
            "y": 41.0,
            "width": 45.0,
            "height": 7.5
        },
        "rawSnippet": "Cadastral Survey Unit Ident: 184/2, Ward 7, Revenue Circle South.",
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:16:11Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x77d1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f",
            "blockNumber": 18472921,
            "timestamp": "2026-09-29T08:18:04Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 39120,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-3",
        "subject": "Land Parcel 184/2",
        "predicate": "registeredArea",
        "object": "2.4 acres",
        "confidence": 0.94,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-1",
        "sourceDocumentName": "Land Certificate #LC-1842",
        "sourcePage": 2,
        "evidenceRegion": {
            "page": 2,
            "x": 12.0,
            "y": 51.5,
            "width": 38.0,
            "height": 7.5
        },
        "rawSnippet": "Total Extent of Land Parcel: 2.40 Acres (Two point four zero acres) arable agricultural land.",
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:16:12Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x55c1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f",
            "blockNumber": 18472922,
            "timestamp": "2026-09-29T08:18:06Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 38500,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-4",
        "subject": "Land Certificate LC-1842",
        "predicate": "registrationDate",
        "object": "14 June 2019",
        "confidence": 0.98,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-1",
        "sourceDocumentName": "Land Certificate #LC-1842",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 58.0,
            "y": 14.0,
            "width": 34.0,
            "height": 7.0
        },
        "rawSnippet": "Registration Date & Entry Stamp: 14-JUN-2019 / Reg No. LC-1842/2019",
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:16:14Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x99b1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f",
            "blockNumber": 18472922,
            "timestamp": "2026-09-29T08:18:06Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 37900,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-5",
        "subject": "Trade License LIC-92381",
        "predicate": "licenseeName",
        "object": "Rahul Sharma",
        "confidence": 0.98,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-2",
        "sourceDocumentName": "Trade License #LIC-92381",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 16.0,
            "y": 27.0,
            "width": 55.0,
            "height": 8.0
        },
        "rawSnippet": "Primary Licensee: RAHUL SHARMA, Managing Director & Authorized Signatory",
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:23:05Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x4b782910e19a820c741b2e9834019a82c3d4e5f60718293a4b5c6d7e8f901a2b",
            "blockNumber": 18472940,
            "timestamp": "2026-09-29T08:24:12Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 46100,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-6",
        "subject": "Trade License LIC-92381",
        "predicate": "licenseNumber",
        "object": "LIC-92381",
        "confidence": 0.99,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-2",
        "sourceDocumentName": "Trade License #LIC-92381",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 56.0,
            "y": 14.5,
            "width": 35.0,
            "height": 7.0
        },
        "rawSnippet": "Municipal Regulatory Permit No: LIC-92381-COMM-2024",
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:23:06Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x33e1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f",
            "blockNumber": 18472940,
            "timestamp": "2026-09-29T08:24:12Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 38100,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-7",
        "subject": "Trade License LIC-92381",
        "predicate": "businessTitle",
        "object": "Sharma Agro Logistics",
        "confidence": 0.96,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-2",
        "sourceDocumentName": "Trade License #LIC-92381",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 16.0,
            "y": 38.0,
            "width": 60.0,
            "height": 8.0
        },
        "rawSnippet": "Registered Enterprise: SHARMA AGRO LOGISTICS PRIVATE LIMITED",
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:23:07Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x22a1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f",
            "blockNumber": 18472941,
            "timestamp": "2026-09-29T08:24:14Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 39500,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-8",
        "subject": "Trade License LIC-92381",
        "predicate": "validThrough",
        "object": "31 March 2027",
        "confidence": 0.95,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-2",
        "sourceDocumentName": "Trade License #LIC-92381",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 16.0,
            "y": 48.0,
            "width": 45.0,
            "height": 7.0
        },
        "rawSnippet": "Effective Validity Window: 01-APR-2024 to 31-MAR-2027",
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:23:08Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x11f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f",
            "blockNumber": 18472941,
            "timestamp": "2026-09-29T08:24:14Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 37100,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-9",
        "subject": "Land Parcel 184/2",
        "predicate": "ownedBy",
        "object": "Rohan Sharma",
        "confidence": 0.91,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-3",
        "sourceDocumentName": "Mutation Extract #MR-2021-99",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 14.0,
            "y": 32.0,
            "width": 62.0,
            "height": 9.0
        },
        "rawSnippet": "MUTATION SLIP 2021: Noted Occupant Transferee: ROHAN SHARMA",
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:35:40Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "CONFLICT",
        "blockchainAnchor": {
            "isAnchored": False,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": None,
            "blockNumber": None,
            "timestamp": None,
            "status": "UNANCHORED",
            "gasUsed": None,
            "contractAddress": None
        },
        "hasConflict": True,
        "conflictId": "conf-1"
    },
    {
        "id": "claim-10",
        "subject": "Property Tax MUN-PR-1842",
        "predicate": "taxpayerName",
        "object": "Rahul Sharma",
        "confidence": 0.98,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-4",
        "sourceDocumentName": "Tax Receipt #PTR-5520",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 14.0,
            "y": 24.0,
            "width": 52.0,
            "height": 7.5
        },
        "rawSnippet": "Assessed Ratepayer: RAHUL SHARMA, Property Reference: MUN-PR-1842",
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:41:00Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
            "blockNumber": 18472955,
            "timestamp": "2026-09-29T08:42:15Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 39800,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-11",
        "subject": "Property Tax MUN-PR-1842",
        "predicate": "paidAmount",
        "object": "₹14,850",
        "confidence": 0.99,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-4",
        "sourceDocumentName": "Tax Receipt #PTR-5520",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 14.0,
            "y": 42.0,
            "width": 38.0,
            "height": 7.0
        },
        "rawSnippet": "Total Remitted Amount: INR 14,850.00 / Status: Fully Paid & Cleared",
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:41:01Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x55a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
            "blockNumber": 18472955,
            "timestamp": "2026-09-29T08:42:15Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 36700,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-12",
        "subject": "Academic Credential DEG-8819",
        "predicate": "graduateName",
        "object": "Rahul Sharma",
        "confidence": 0.99,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-5",
        "sourceDocumentName": "University Degree #DEG-8819",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 18.0,
            "y": 35.0,
            "width": 64.0,
            "height": 8.0
        },
        "rawSnippet": "By resolution of Senate, hereby confers upon RAHUL SHARMA the degree of",
        "issuerId": "iss-3",
        "issuerName": "National University Registrar",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:51:00Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x6f7e8d9c0b1a23456789abcdef0123456789abcdef0123456789abcdef012345",
            "blockNumber": 18472970,
            "timestamp": "2026-09-29T08:52:19Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 45300,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-13",
        "subject": "Academic Credential DEG-8819",
        "predicate": "degreeConferred",
        "object": "Bachelor of Technology (Civil Engineering)",
        "confidence": 0.98,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-5",
        "sourceDocumentName": "University Degree #DEG-8819",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 18.0,
            "y": 45.0,
            "width": 64.0,
            "height": 8.5
        },
        "rawSnippet": "Degree: BACHELOR OF TECHNOLOGY in CIVIL ENGINEERING with all rights and honors.",
        "issuerId": "iss-3",
        "issuerName": "National University Registrar",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:51:02Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x88f2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
            "blockNumber": 18472970,
            "timestamp": "2026-09-29T08:52:19Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 39200,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-14",
        "subject": "Land Parcel 184/2",
        "predicate": "encumbranceStatus",
        "object": "Clear / Nil Encumbrance",
        "confidence": 0.92,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-1",
        "sourceDocumentName": "Land Certificate #LC-1842",
        "sourcePage": 3,
        "evidenceRegion": {
            "page": 3,
            "x": 14.0,
            "y": 48.0,
            "width": 55.0,
            "height": 7.5
        },
        "rawSnippet": "ENCUMBRANCE SEARCH CERTIFICATE: Nil prior mortgage, lien, or court attachment registered.",
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:16:15Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x44d2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
            "blockNumber": 18472923,
            "timestamp": "2026-09-29T08:18:10Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 37800,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-15",
        "subject": "Municipal Permit",
        "predicate": "operationalZone",
        "object": "Zone 4 Urban Sector",
        "confidence": 0.95,
        "confidenceTier": "HIGH",
        "sourceDocumentId": "doc-2",
        "sourceDocumentName": "Trade License #LIC-92381",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 16.0,
            "y": 58.0,
            "width": 46.0,
            "height": 6.8
        },
        "rawSnippet": "Designated Commercial Jurisdiction: Zone 4 Urban Logistics Corridor",
        "issuerId": "iss-2",
        "issuerName": "Municipal Corporation",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:23:09Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "VERIFIED",
        "blockchainAnchor": {
            "isAnchored": True,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": "0x22c2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
            "blockNumber": 18472941,
            "timestamp": "2026-09-29T08:24:14Z",
            "status": "IMMUTABLE ANCHOR",
            "gasUsed": 36100,
            "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
        },
        "hasConflict": False,
        "conflictId": None
    },
    {
        "id": "claim-16",
        "subject": "Land Parcel 184/2",
        "predicate": "mutationEntryDate",
        "object": "03 August 2021",
        "confidence": 0.89,
        "confidenceTier": "MEDIUM",
        "sourceDocumentId": "doc-3",
        "sourceDocumentName": "Mutation Extract #MR-2021-99",
        "sourcePage": 1,
        "evidenceRegion": {
            "page": 1,
            "x": 55.0,
            "y": 15.0,
            "width": 38.0,
            "height": 7.0
        },
        "rawSnippet": "Entry recorded under register vol 44 folio 99 on 03-AUG-2021",
        "issuerId": "iss-1",
        "issuerName": "Sub-Registrar Office",
        "issuerVerified": True,
        "createdAt": "2026-09-29T08:35:41Z",
        "integrityStatus": "VERIFIED",
        "verificationStatus": "PENDING_REVIEW",
        "blockchainAnchor": {
            "isAnchored": False,
            "network": "VERITAS Demo Network (EVM Simulated)",
            "txHash": None,
            "blockNumber": None,
            "timestamp": None,
            "status": "UNANCHORED",
            "gasUsed": None,
            "contractAddress": None
        },
        "hasConflict": False,
        "conflictId": None
    }
]

DEMO_CONTRADICTIONS: List[Dict[str, Any]] = [
    {
        "id": "conf-1",
        "field": "Owner",
        "entitySubject": "Land Parcel 184/2",
        "valuesFound": [
            {
                "value": "Rahul Sharma",
                "docCount": 2,
                "docIds": ["doc-1", "doc-4"],
                "docNames": ["Land Certificate #LC-1842", "Property Tax Receipt #PTR-5520"],
                "pages": [2, 1]
            },
            {
                "value": "Rohan Sharma",
                "docCount": 1,
                "docIds": ["doc-3"],
                "docNames": ["Mutation Extract #MR-2021-99"],
                "pages": [1]
            }
        ],
        "status": "REQUIRES HUMAN REVIEW",
        "severity": "HIGH",
        "explanation": "VERITAS detected inconsistent claims across records. It does not determine legal ownership.",
        "detectedAt": "2026-09-29T08:35:42Z",
        "reviewAction": None,
        "reviewerNotes": None
    }
]

DEMO_AUDIT_TRAIL: List[Dict[str, Any]] = [
    {
        "id": "aud-1",
        "timestamp": "2026-09-29T08:15:00Z",
        "actor": "System Ingestion",
        "action": "DOCUMENT_UPLOADED",
        "object": "Land Ownership Certificate #LC-1842",
        "details": "Seeded demo record indexed. In the prototype, uploaded file bytes are hashed and discarded.",
        "txHash": None,
        "blockNumber": None
    },
    {
        "id": "aud-2",
        "timestamp": "2026-09-29T08:15:20Z",
        "actor": "OCR & Extraction Pipeline",
        "action": "OCR_EXTRACTION_COMPLETED",
        "object": "Land Certificate #LC-1842",
        "details": "Bilingual visual OCR (English/Hindi) completed with 97.4% average character confidence.",
        "txHash": None,
        "blockNumber": None
    },
    {
        "id": "aud-3",
        "timestamp": "2026-09-29T08:16:10Z",
        "actor": "Claim Engine",
        "action": "CLAIMS_STRUCTURED",
        "object": "5 Structured Claims",
        "details": "Generated discrete claims for Owner, Survey Number, Area, Registration Date, and Encumbrance.",
        "txHash": None,
        "blockNumber": None
    },
    {
        "id": "aud-4",
        "timestamp": "2026-09-29T08:17:02Z",
        "actor": "Integrity Service",
        "action": "SHA256_FINGERPRINT_GENERATED",
        "object": "doc-1",
        "details": "SHA-256 fingerprint generated: 0x7a829f0b12c4d8e5719329410385bf71829a91f2495810239103984102938174",
        "txHash": None,
        "blockNumber": None
    },
    {
        "id": "aud-5",
        "timestamp": "2026-09-29T08:18:04Z",
        "actor": "Blockchain Anchor Service",
        "action": "DOCUMENT_ANCHORED",
        "object": "DocumentRegistry.sol",
        "details": "Anchored document hash & issuer public key attestation. Zero PII uploaded to public ledger.",
        "txHash": "0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b",
        "blockNumber": 18472921
    },
    {
        "id": "aud-6",
        "timestamp": "2026-09-29T08:35:42Z",
        "actor": "Contradiction Engine",
        "action": "CROSS_DOCUMENT_CONFLICT_DETECTED",
        "object": "Land Parcel 184/2: Owner",
        "details": "Conflict detected: 'Rahul Sharma' (2 records) vs 'Rohan Sharma' (1 record). Flagged for Human-in-the-Loop review.",
        "txHash": None,
        "blockNumber": None
    },
    {
        "id": "aud-7",
        "timestamp": "2026-09-29T08:52:19Z",
        "actor": "Blockchain Anchor Service",
        "action": "CLAIM_ATTESTED",
        "object": "ClaimRegistry.sol",
        "details": "Anchored claim hash for Academic Credential DEG-8819 under National University Registrar.",
        "txHash": "0x6f7e8d9c0b1a23456789abcdef0123456789abcdef0123456789abcdef012345",
        "blockNumber": 18472970
    },
    {
        "id": "aud-8",
        "timestamp": "2026-09-29T09:10:14Z",
        "actor": "External Verifier (Third-Party)",
        "action": "PUBLIC_VERIFICATION_PERFORMED",
        "object": "claim-1 (Owner = Rahul Sharma)",
        "details": "Seeded demo verification event. Selected evidence is shown without the full document; the anchor is simulated.",
        "txHash": "0x12c4b8e5719329410385bf71829a91f24958102391039841029381748a2f1c4e",
        "blockNumber": 18472985
    }
]

class VeritasDatabase:
    def __init__(self):
        self.documents = copy.deepcopy(DEMO_DOCUMENTS)
        for document in self.documents:
            document["advisorConsent"] = True
        self.claims = copy.deepcopy(DEMO_CLAIMS)
        self.issuers = copy.deepcopy(DEMO_ISSUERS)
        self.contradictions = copy.deepcopy(DEMO_CONTRADICTIONS)
        self.audit_trail = copy.deepcopy(DEMO_AUDIT_TRAIL)
        self.advisor_reports = []
        self.correction_requests = []
        self.network_mode = "demo"  # "demo" or "testnet"
        self._normalise_seed_data()
        saved = load_state()
        if saved:
            for key in ("documents", "claims", "issuers", "contradictions", "audit_trail", "advisor_reports", "correction_requests", "network_mode"):
                if key in saved:
                    setattr(self, key, saved[key])

    def _normalise_seed_data(self):
        for issuer in self.issuers:
            issuer.setdefault("status", "REVOKED" if issuer.get("isRevoked") else "VERIFIED")
            issuer.setdefault("demoRecord", True)
            issuer.setdefault("statusChangedAt", issuer.get("registeredAt"))
            issuer.setdefault("statusReason", "Seeded fictional demonstration authority")
            issuer.setdefault("revokedAt", None)
            issuer.setdefault("statusHistory", [])
        for document in self.documents:
            document.setdefault("fileAvailable", False)
            document.setdefault("fileAccess", "NOT_RETAINED")
            document.setdefault("mimeType", None)
            document.setdefault("fileUrl", None)
            document.setdefault("extractionSummary", None)

    @property
    def persistence_mode(self):
        return "SQLITE_LOCAL" if local_persistence_enabled() else "EPHEMERAL_SERVERLESS"

    def persist(self):
        save_state({
            "documents": self.documents,
            "claims": self.claims,
            "issuers": self.issuers,
            "contradictions": self.contradictions,
            "audit_trail": self.audit_trail,
            "advisor_reports": self.advisor_reports,
            "correction_requests": self.correction_requests,
            "network_mode": self.network_mode,
        })

    def reset(self):
        self.documents = copy.deepcopy(DEMO_DOCUMENTS)
        for document in self.documents:
            document["advisorConsent"] = True
        self.claims = copy.deepcopy(DEMO_CLAIMS)
        self.issuers = copy.deepcopy(DEMO_ISSUERS)
        self.contradictions = copy.deepcopy(DEMO_CONTRADICTIONS)
        self.audit_trail = copy.deepcopy(DEMO_AUDIT_TRAIL)
        self.advisor_reports = []
        self.correction_requests = []
        self.network_mode = "demo"
        self._normalise_seed_data()
        self.persist()

db = VeritasDatabase()
