import { Document, Claim, Contradiction, Issuer, AuditEvent, PublicVerificationPackage, EvidenceGraphData } from './types';

export const INITIAL_ISSUERS: Issuer[] = [
  {
    id: 'iss-1',
    name: 'Sub-Registrar Office (Land Revenue Dept)',
    jurisdiction: 'Central District / Land Registration Division',
    address: '0x71C2B9a0189A4eF3320c028a1F228498893181aB',
    publicKeyUri: 'https://veritas.network/keys/iss-1.pub',
    isVerified: true,
    isRevoked: false,
    registeredAt: '2024-01-15T09:00:00Z',
    documentsIssued: 428,
    claimsIssued: 2140,
    revocationCount: 0
    ,status: 'VERIFIED', demoRecord: true
  },
  {
    id: 'iss-2',
    name: 'Municipal Corporation (Urban Licensing Bureau)',
    jurisdiction: 'Metropolitan Administrative Council',
    address: '0x24BC772fA1829037418A375c329482910399fE42',
    publicKeyUri: 'https://veritas.network/keys/iss-2.pub',
    isVerified: true,
    isRevoked: false,
    registeredAt: '2024-02-01T10:30:00Z',
    documentsIssued: 612,
    claimsIssued: 3672,
    revocationCount: 1
    ,status: 'VERIFIED', demoRecord: true
  },
  {
    id: 'iss-3',
    name: 'National University Registrar (Credential Board)',
    jurisdiction: 'Higher Education Accreditation Council',
    address: '0x89D429188491A82749210B38491029481944cC19',
    publicKeyUri: 'https://veritas.network/keys/iss-3.pub',
    isVerified: true,
    isRevoked: false,
    registeredAt: '2024-03-10T14:15:00Z',
    documentsIssued: 244,
    claimsIssued: 976,
    revocationCount: 0
    ,status: 'VERIFIED', demoRecord: true
  }
];

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Land Ownership Certificate #LC-1842',
    documentType: 'Land Record',
    language: 'English / Hindi Bilingual',
    pageCount: 4,
    fileSizeKb: 1840,
    hashSha256: '0x7a829f0b12c4d8e5719329410385bf71829a91f2495810239103984102938174',
    uploadedAt: '2026-09-29T08:15:00Z',
    status: 'ANCHORED',
    claimsCount: 5,
    issuerId: 'iss-1',
    issuerName: 'Sub-Registrar Office (Land Revenue Dept)',
    issuerAddress: '0x71C2B9a0189A4eF3320c028a1F228498893181aB',
    isAnchored: true,
    blockchainTx: '0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b',
    thumbnailUrl: '/docs/land_certificate.png',
    previewPages: [
      'Page 1: Title Header & Seals',
      'Page 2: Ownership Schedule & Survey Details',
      'Page 3: Encumbrance & Boundary Cert',
      'Page 4: Attestation & Sub-Registrar Signature'
    ]
  },
  {
    id: 'doc-2',
    title: 'Municipal Trade License #LIC-92381',
    documentType: 'License',
    language: 'English',
    pageCount: 2,
    fileSizeKb: 920,
    hashSha256: '0x3c99a81e9d2847a1029384759102938410293847510293847510293847510293',
    uploadedAt: '2026-09-29T08:22:00Z',
    status: 'ANCHORED',
    claimsCount: 4,
    issuerId: 'iss-2',
    issuerName: 'Municipal Corporation (Urban Licensing Bureau)',
    issuerAddress: '0x24BC772fA1829037418A375c329482910399fE42',
    isAnchored: true,
    blockchainTx: '0x4b782910e19a820c741b2e9834019a82c3d4e5f60718293a4b5c6d7e8f901a2b',
    thumbnailUrl: '/docs/trade_license.png',
    previewPages: [
      'Page 1: Trade License Authorization & Entity Name',
      'Page 2: Statutory Terms & Conditions'
    ]
  },
  {
    id: 'doc-3',
    title: 'Land Record Mutation Extract #MR-2021-99',
    documentType: 'Land Record',
    language: 'Hindi / English',
    pageCount: 1,
    fileSizeKb: 760,
    hashSha256: '0x9e12034871928374019283740192837401928374019283740192837401928374',
    uploadedAt: '2026-09-29T08:35:00Z',
    status: 'CONFLICT_DETECTED',
    claimsCount: 3,
    issuerId: 'iss-1',
    issuerName: 'Sub-Registrar Office (Land Revenue Dept)',
    issuerAddress: '0x71C2B9a0189A4eF3320c028a1F228498893181aB',
    isAnchored: false,
    blockchainTx: null,
    thumbnailUrl: '/docs/mutation_extract.png',
    previewPages: ['Page 1: Mutation Register Entry & Disputed Title']
  },
  {
    id: 'doc-4',
    title: 'Property Tax Assessment Receipt #PTR-5520',
    documentType: 'Receipt',
    language: 'English',
    pageCount: 1,
    fileSizeKb: 540,
    hashSha256: '0x4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c',
    uploadedAt: '2026-09-29T08:40:00Z',
    status: 'ANCHORED',
    claimsCount: 2,
    issuerId: 'iss-2',
    issuerName: 'Municipal Corporation (Urban Licensing Bureau)',
    issuerAddress: '0x24BC772fA1829037418A375c329482910399fE42',
    isAnchored: true,
    blockchainTx: '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809',
    thumbnailUrl: '/docs/tax_receipt.png',
    previewPages: ['Page 1: Annual Property Tax Assessment & Payment Slip']
  },
  {
    id: 'doc-5',
    title: 'University Degree Certificate #DEG-8819',
    documentType: 'Certificate',
    language: 'English / Latin',
    pageCount: 1,
    fileSizeKb: 1250,
    hashSha256: '0x1f2e3d4c5b6a708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809',
    uploadedAt: '2026-09-29T08:50:00Z',
    status: 'ANCHORED',
    claimsCount: 2,
    issuerId: 'iss-3',
    issuerName: 'National University Registrar (Credential Board)',
    issuerAddress: '0x89D429188491A82749210B38491029481944cC19',
    isAnchored: true,
    blockchainTx: '0x6f7e8d9c0b1a23456789abcdef0123456789abcdef0123456789abcdef012345',
    thumbnailUrl: '/docs/university_degree.png',
    previewPages: ['Page 1: Degree of Bachelor of Technology with Hologram & Seal']
  }
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'claim-1',
    subject: 'Land Parcel 184/2',
    predicate: 'ownedBy',
    object: 'Rahul Sharma',
    confidence: 0.97,
    confidenceTier: 'HIGH',
    sourceDocumentId: 'doc-1',
    sourceDocumentName: 'Land Certificate #LC-1842',
    sourcePage: 2,
    evidenceRegion: {
      page: 2,
      x: 12.0,
      y: 28.5,
      width: 64.0,
      height: 9.2
    },
    rawSnippet: 'SCHEDULE II - REVENUE TITLE: Registered Titleholder certified as RAHUL SHARMA S/O O.P. SHARMA, resident of Sector 14.',
    issuerId: 'iss-1',
    issuerName: 'Sub-Registrar Office',
    issuerVerified: true,
    createdAt: '2026-09-29T08:16:10Z',
    integrityStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    blockchainAnchor: {
      isAnchored: true,
      network: 'VERITAS Demo Network (EVM Simulated)',
      txHash: '0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b',
      blockNumber: 18472921,
      timestamp: '2026-09-29T08:18:04Z',
      status: 'IMMUTABLE ANCHOR',
      gasUsed: 48210,
      contractAddress: '0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332'
    },
    hasConflict: true,
    conflictId: 'conf-1'
  },
  {
    id: 'claim-2',
    subject: 'Land Parcel 184/2',
    predicate: 'surveyNumber',
    object: '184/2',
    confidence: 0.99,
    confidenceTier: 'HIGH',
    sourceDocumentId: 'doc-1',
    sourceDocumentName: 'Land Certificate #LC-1842',
    sourcePage: 2,
    evidenceRegion: {
      page: 2,
      x: 12.0,
      y: 41.0,
      width: 45.0,
      height: 7.5
    },
    rawSnippet: 'Cadastral Survey Unit Ident: 184/2, Ward 7, Revenue Circle South.',
    issuerId: 'iss-1',
    issuerName: 'Sub-Registrar Office',
    issuerVerified: true,
    createdAt: '2026-09-29T08:16:11Z',
    integrityStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    blockchainAnchor: {
      isAnchored: true,
      network: 'VERITAS Demo Network (EVM Simulated)',
      txHash: '0x77d1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f',
      blockNumber: 18472921,
      timestamp: '2026-09-29T08:18:04Z',
      status: 'IMMUTABLE ANCHOR',
      gasUsed: 39120,
      contractAddress: '0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332'
    },
    hasConflict: false,
    conflictId: null
  },
  {
    id: 'claim-3',
    subject: 'Land Parcel 184/2',
    predicate: 'registeredArea',
    object: '2.4 acres',
    confidence: 0.94,
    confidenceTier: 'HIGH',
    sourceDocumentId: 'doc-1',
    sourceDocumentName: 'Land Certificate #LC-1842',
    sourcePage: 2,
    evidenceRegion: {
      page: 2,
      x: 12.0,
      y: 51.5,
      width: 38.0,
      height: 7.5
    },
    rawSnippet: 'Total Extent of Land Parcel: 2.40 Acres (Two point four zero acres) arable agricultural land.',
    issuerId: 'iss-1',
    issuerName: 'Sub-Registrar Office',
    issuerVerified: true,
    createdAt: '2026-09-29T08:16:12Z',
    integrityStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    blockchainAnchor: {
      isAnchored: true,
      network: 'VERITAS Demo Network (EVM Simulated)',
      txHash: '0x55c1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f',
      blockNumber: 18472922,
      timestamp: '2026-09-29T08:18:06Z',
      status: 'IMMUTABLE ANCHOR',
      gasUsed: 38500,
      contractAddress: '0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332'
    },
    hasConflict: false,
    conflictId: null
  },
  {
    id: 'claim-4',
    subject: 'Land Certificate LC-1842',
    predicate: 'registrationDate',
    object: '14 June 2019',
    confidence: 0.98,
    confidenceTier: 'HIGH',
    sourceDocumentId: 'doc-1',
    sourceDocumentName: 'Land Certificate #LC-1842',
    sourcePage: 1,
    evidenceRegion: {
      page: 1,
      x: 58.0,
      y: 14.0,
      width: 34.0,
      height: 7.0
    },
    rawSnippet: 'Registration Date & Entry Stamp: 14-JUN-2019 / Reg No. LC-1842/2019',
    issuerId: 'iss-1',
    issuerName: 'Sub-Registrar Office',
    issuerVerified: true,
    createdAt: '2026-09-29T08:16:14Z',
    integrityStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    blockchainAnchor: {
      isAnchored: true,
      network: 'VERITAS Demo Network (EVM Simulated)',
      txHash: '0x99b1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f',
      blockNumber: 18472922,
      timestamp: '2026-09-29T08:18:06Z',
      status: 'IMMUTABLE ANCHOR',
      gasUsed: 37900,
      contractAddress: '0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332'
    },
    hasConflict: false,
    conflictId: null
  },
  {
    id: 'claim-5',
    subject: 'Trade License LIC-92381',
    predicate: 'licenseeName',
    object: 'Rahul Sharma',
    confidence: 0.98,
    confidenceTier: 'HIGH',
    sourceDocumentId: 'doc-2',
    sourceDocumentName: 'Trade License #LIC-92381',
    sourcePage: 1,
    evidenceRegion: {
      page: 1,
      x: 16.0,
      y: 27.0,
      width: 55.0,
      height: 8.0
    },
    rawSnippet: 'Primary Licensee: RAHUL SHARMA, Managing Director & Authorized Signatory',
    issuerId: 'iss-2',
    issuerName: 'Municipal Corporation',
    issuerVerified: true,
    createdAt: '2026-09-29T08:23:05Z',
    integrityStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    blockchainAnchor: {
      isAnchored: true,
      network: 'VERITAS Demo Network (EVM Simulated)',
      txHash: '0x4b782910e19a820c741b2e9834019a82c3d4e5f60718293a4b5c6d7e8f901a2b',
      blockNumber: 18472940,
      timestamp: '2026-09-29T08:24:12Z',
      status: 'IMMUTABLE ANCHOR',
      gasUsed: 46100,
      contractAddress: '0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332'
    },
    hasConflict: false,
    conflictId: null
  },
  {
    id: 'claim-6',
    subject: 'Trade License LIC-92381',
    predicate: 'licenseNumber',
    object: 'LIC-92381',
    confidence: 0.99,
    confidenceTier: 'HIGH',
    sourceDocumentId: 'doc-2',
    sourceDocumentName: 'Trade License #LIC-92381',
    sourcePage: 1,
    evidenceRegion: {
      page: 1,
      x: 56.0,
      y: 14.5,
      width: 35.0,
      height: 7.0
    },
    rawSnippet: 'Municipal Regulatory Permit No: LIC-92381-COMM-2024',
    issuerId: 'iss-2',
    issuerName: 'Municipal Corporation',
    issuerVerified: true,
    createdAt: '2026-09-29T08:23:06Z',
    integrityStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    blockchainAnchor: {
      isAnchored: true,
      network: 'VERITAS Demo Network (EVM Simulated)',
      txHash: '0x33e1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f',
      blockNumber: 18472940,
      timestamp: '2026-09-29T08:24:12Z',
      status: 'IMMUTABLE ANCHOR',
      gasUsed: 38100,
      contractAddress: '0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332'
    },
    hasConflict: false,
    conflictId: null
  },
  {
    id: 'claim-9',
    subject: 'Land Parcel 184/2',
    predicate: 'ownedBy',
    object: 'Rohan Sharma',
    confidence: 0.91,
    confidenceTier: 'HIGH',
    sourceDocumentId: 'doc-3',
    sourceDocumentName: 'Mutation Extract #MR-2021-99',
    sourcePage: 1,
    evidenceRegion: {
      page: 1,
      x: 14.0,
      y: 32.0,
      width: 62.0,
      height: 9.0
    },
    rawSnippet: 'MUTATION SLIP 2021: Noted Occupant Transferee: ROHAN SHARMA',
    issuerId: 'iss-1',
    issuerName: 'Sub-Registrar Office',
    issuerVerified: true,
    createdAt: '2026-09-29T08:35:40Z',
    integrityStatus: 'VERIFIED',
    verificationStatus: 'CONFLICT',
    blockchainAnchor: {
      isAnchored: false,
      network: 'VERITAS Demo Network (EVM Simulated)',
      txHash: null,
      blockNumber: null,
      timestamp: null,
      status: 'UNANCHORED'
    },
    hasConflict: true,
    conflictId: 'conf-1'
  }
];

export const INITIAL_CONTRADICTIONS: Contradiction[] = [
  {
    id: 'conf-1',
    field: 'Owner',
    entitySubject: 'Land Parcel 184/2',
    valuesFound: [
      {
        value: 'Rahul Sharma',
        docCount: 2,
        docIds: ['doc-1', 'doc-4'],
        docNames: ['Land Certificate #LC-1842', 'Property Tax Receipt #PTR-5520'],
        pages: [2, 1]
      },
      {
        value: 'Rohan Sharma',
        docCount: 1,
        docIds: ['doc-3'],
        docNames: ['Mutation Extract #MR-2021-99'],
        pages: [1]
      }
    ],
    status: 'REQUIRES HUMAN REVIEW',
    severity: 'HIGH',
    explanation: 'VERITAS detected inconsistent claims across records. It does not determine legal ownership.',
    detectedAt: '2026-09-29T08:35:42Z',
    reviewAction: null,
    reviewerNotes: null
  }
];
