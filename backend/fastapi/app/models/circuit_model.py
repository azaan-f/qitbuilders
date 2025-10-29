from pydantic import BaseModel
from typing import Dict, Any, Optional

class Circuit(BaseModel):
    circuit_id: str
    name: str
    code: str  # Qiskit code
    visual: Optional[Dict[str, Any]] = None  # JSON structure for visual layout
    created_at: Optional[str] = None  # ISO timestamp
