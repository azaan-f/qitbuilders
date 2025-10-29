from fastapi import APIRouter, HTTPException
from app.db.dynamo_client import get_table
from app.models.circuit_model import Circuit
from datetime import datetime

router = APIRouter(
    prefix="/circuits",
    tags=["Circuits"]
)

table = get_table()

@router.post("/")
def create_circuit(circuit: Circuit):
    circuit.created_at = datetime.utcnow().isoformat()
    item = circuit.dict()
    table.put_item(Item=item)
    return {"message": "Circuit created successfully", "circuit": item}

@router.get("/{circuit_id}")
def get_circuit(circuit_id: str):
    response = table.get_item(Key={"circuit_id": circuit_id})
    if "Item" not in response:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return response["Item"]
