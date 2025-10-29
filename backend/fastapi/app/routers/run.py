from fastapi import APIRouter

router = APIRouter(
    prefix="/run",
    tags=["Execution"]
)

@router.post("/simulator")
def run_simulator():
    return {"message": "Simulator execution endpoint (to be implemented)"}

@router.post("/hardware")
def run_hardware():
    return {"message": "Hardware execution endpoint (to be implemented)"}
