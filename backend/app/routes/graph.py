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
                "status": iss.get("status", "VERIFIED" if iss.get("isVerified") else "SUSPENDED"),
                "statusReason": iss.get("statusReason"),
                "statusChangedAt": iss.get("statusChangedAt")
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
        if f"issuer-{doc['issuerId']}" in node_ids:
            edges.append({
            "id": f"e-doc-iss-{doc['id']}",
            "source": doc_node_id,
            "target": f"issuer-{doc['issuerId']}",
            "label": "issuedBy"
            })

    # Add Claims, Entities, Evidence Regions & Anchors
    for c in db.claims:
        if not any(d["id"] == c.get("sourceDocumentId") for d in db.documents):
            continue
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

        # Add evidence only when the extractor produced a real source mapping.
        evidence_id = f"ev-{c['id']}"
        evidence_available = bool(c.get("rawSnippet") and c.get("evidenceRegion") and c.get("evidenceMappingStatus", "MAPPED") == "MAPPED")
        add_node(evidence_id, f"Page {c.get('sourcePage', '?')} evidence" if evidence_available else "Evidence unavailable", "EVIDENCE", {"claimId": c["id"], "documentId": c["sourceDocumentId"], "documentTitle": c["sourceDocumentName"], "page": c.get("sourcePage"), "coordinates": c.get("evidenceRegion") if evidence_available else None, "snippet": c.get("rawSnippet") if evidence_available else None, "available": evidence_available})
        edges.append({"id": f"e-clm-ev-{c['id']}", "source": claim_node_id, "target": evidence_id, "label": "supportedBy" if evidence_available else "evidenceUnavailable"})

        # Add Blockchain Anchor node if anchored
        if c["blockchainAnchor"]["isAnchored"]:
            anchor_id = f"bc-{c['id']}"
            add_node(
                anchor_id,
                "Simulated anchor" if "Simulated" in c["blockchainAnchor"].get("network", "") else f"Block #{c['blockchainAnchor'].get('blockNumber')}",
                "BLOCKCHAIN RECORD",
                {
                    "txHash": c["blockchainAnchor"]["txHash"],
                    "block": c["blockchainAnchor"]["blockNumber"],
                    "network": c["blockchainAnchor"]["network"],
                    "timestamp": c["blockchainAnchor"]["timestamp"],
                    "mode": "SIMULATED" if "Simulated" in c["blockchainAnchor"].get("network", "") else "NETWORK_TRANSACTION",
                    "claimId": c["id"]
                }
            )
            edges.append({
                "id": f"e-clm-bc-{c['id']}",
                "source": claim_node_id,
                "target": anchor_id,
                "label": "anchoredOn"
            })

    return {"nodes": nodes, "edges": edges}
