from fastapi import APIRouter
from app.data import db

router = APIRouter(prefix="/api/graph", tags=["graph"])

@router.get("")
def get_evidence_graph():
    nodes = []
    edges = []
    node_ids = set()

    def add_node(nid, label, ntype, metadata):
        if nid not in node_ids:
            nodes.append({
                "id": nid,
                "label": label,
                "type": ntype,
                "metadata": metadata
            })
            node_ids.add(nid)

    # Add Issuers
    for iss in db.issuers:
        add_node(
            f"issuer-{iss['id']}",
            iss["name"],
            "ISSUER",
            {
                "id": iss["id"],
                "jurisdiction": iss["jurisdiction"],
                "address": iss["address"],
                "isVerified": iss["isVerified"]
            }
        )

    # Add Documents
    for doc in db.documents:
        doc_node_id = f"doc-{doc['id']}"
        add_node(
            doc_node_id,
            doc["title"],
            "DOCUMENT",
            {
                "id": doc["id"],
                "type": doc["documentType"],
                "hash": doc["hashSha256"],
                "status": doc["status"]
            }
        )
        # Edge from Document to Issuer
        edges.append({
            "id": f"e-doc-iss-{doc['id']}",
            "source": doc_node_id,
            "target": f"issuer-{doc['issuerId']}",
            "label": "issuedBy"
        })

    # Add Claims, Entities, Evidence Regions & Anchors
    for c in db.claims:
        claim_node_id = f"claim-{c['id']}"
        add_node(
            claim_node_id,
            f"{c['predicate']}: {c['object']}",
            "CLAIM",
            {
                "id": c["id"],
                "subject": c["subject"],
                "predicate": c["predicate"],
                "object": c["object"],
                "confidence": c["confidence"],
                "status": c["verificationStatus"]
            }
        )

        # Edge from Document to Claim
        edges.append({
            "id": f"e-doc-clm-{c['id']}",
            "source": f"doc-{c['sourceDocumentId']}",
            "target": claim_node_id,
            "label": "extractedClaim"
        })

        # Add Entity node
        entity_id = f"entity-{c['subject'].replace(' ', '_').lower()}"
        add_node(
            entity_id,
            c["subject"],
            "ENTITY",
            {"subject": c["subject"]}
        )
        edges.append({
            "id": f"e-clm-ent-{c['id']}",
            "source": claim_node_id,
            "target": entity_id,
            "label": "assertsRegarding"
        })

        # Add Evidence Region node
        evidence_id = f"ev-{c['id']}"
        add_node(
            evidence_id,
            f"Page {c['sourcePage']} Region",
            "EVIDENCE",
            {
                "page": c["sourcePage"],
                "coordinates": c["evidenceRegion"],
                "snippet": c["rawSnippet"]
            }
        )
        edges.append({
            "id": f"e-clm-ev-{c['id']}",
            "source": claim_node_id,
            "target": evidence_id,
            "label": "supportedBy"
        })

        # Add Blockchain Anchor node if anchored
        if c["blockchainAnchor"]["isAnchored"]:
            anchor_id = f"bc-{c['id']}"
            add_node(
                anchor_id,
                f"Block #{c['blockchainAnchor']['blockNumber']}",
                "BLOCKCHAIN RECORD",
                {
                    "txHash": c["blockchainAnchor"]["txHash"],
                    "block": c["blockchainAnchor"]["blockNumber"],
                    "network": c["blockchainAnchor"]["network"],
                    "timestamp": c["blockchainAnchor"]["timestamp"]
                }
            )
            edges.append({
                "id": f"e-clm-bc-{c['id']}",
                "source": claim_node_id,
                "target": anchor_id,
                "label": "anchoredOn"
            })

    return {"nodes": nodes, "edges": edges}
