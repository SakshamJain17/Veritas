from fastapi import APIRouter
from app.data import db

router = APIRouter(prefix="/api/audit", tags=["audit"])

@router.get("")
def get_audit_trail():
    return db.audit_trail
