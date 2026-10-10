import hashlib
import time
import random
from typing import Dict, Any

def compute_sha256(content: bytes) -> str:
    h = hashlib.sha256(content).hexdigest()
    return f"0x{h}"

def generate_tx_hash(seed: str) -> str:
    h = hashlib.sha256(f"{seed}-{time.time()}-{random.randint(1000, 9999)}".encode()).hexdigest()
    return f"0x{h}"

def anchor_to_ledger(identifier: str, item_type: str = "DOCUMENT") -> Dict[str, Any]:
    """
    Simulates anchoring a cryptographic hash onto the EVM smart contracts
    (DocumentRegistry.sol / ClaimRegistry.sol).
    In real testnet mode, this can be linked via Web3 RPC.
    """
    tx_hash = generate_tx_hash(identifier)
    block_num = 18472900 + random.randint(50, 200)
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    gas_used = random.randint(35000, 52000)

    return {
        "isAnchored": True,
        "network": "VERITAS Demo Network (EVM Simulated)",
        "txHash": tx_hash,
        "blockNumber": block_num,
        "timestamp": now_iso,
        "status": "IMMUTABLE ANCHOR",
        "gasUsed": gas_used,
        "contractAddress": "0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332"
    }
