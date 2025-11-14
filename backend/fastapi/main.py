import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from app.services.braket_service import run_bell_state_on_sv1, BraketError

logger = logging.getLogger(__name__)

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}


class SimulatorRunRequest(BaseModel):
    code: Optional[str] = None
    shots: int = Field(default=1000, ge=1, le=1_00_000)


@app.post("/run/simulator")
def run_simulator(req: SimulatorRunRequest):
    """
    Run a Bell test circuit on the Amazon SV1 simulator and return measurement counts.

    Right now we ignore `code` and just use a fixed circuit. Later, this will translate
    Qiskit code or visual circuit JSON into a Braket Circuit.
    """
    try:
        counts = run_bell_state_on_sv1(shots=req.shots)
        return {
            "shots": req.shots,
            "counts": counts,
        }
    except BraketError as e:
        # Our own custom "nice" error, e.g. missing envs
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # For now, show the real AWS/Braket error so we can debug
        logger.exception("Unexpected Braket error")
        raise HTTPException(status_code=500, detail=str(e))
