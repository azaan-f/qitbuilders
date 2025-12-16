from dotenv import load_dotenv
load_dotenv()

import os
os.environ.setdefault("AWS_REGION", "us-east-1")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.routers import health, circuits, run

import re
import math
from dataclasses import dataclass
from typing import List, Optional, Tuple

from qiskit import QuantumCircuit
from qiskit_braket_provider import BraketProvider

import boto3
from braket.aws import AwsSession

AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
BKT_RESULTS_BUCKET = os.environ.get("BKT_RESULTS_BUCKET")
BKT_RESULTS_PREFIX = os.environ.get("BKT_RESULTS_PREFIX", "qitbuilder/results")

if not BKT_RESULTS_BUCKET:
    raise RuntimeError(
        "Missing BKT_RESULTS_BUCKET in environment. "
        "Set it in backend/fastapi/.env, e.g. BKT_RESULTS_BUCKET=qitbuilder-braket-results"
    )

app = FastAPI(
    title="Qit Builder Backend",
    description="Backend API for Qit Builder quantum circuit platform using FastAPI and AWS Braket",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(circuits.router)
app.include_router(run.router)


@app.get("/")
def root():
    return {"message": "Qit Builder Backend is running"}

class SubmitPayload(BaseModel):
    code: str


@app.post("/submit")
def submit(payload: SubmitPayload):
    return {
        "ok": True,
        "received_chars": len(payload.code),
        "preview": payload.code[:120],
    }

@dataclass
class Op:
    name: str
    args: List[float]


HEADER_RE = re.compile(r"^\s*from\s+qiskit\s+import\s+QuantumCircuit\s*$")
QC_RE = re.compile(r"^\s*qc\s*=\s*QuantumCircuit\(\s*(\d+)\s*\)\s*$")

GATE_1Q_RE = re.compile(r"^\s*qc\.(x|y|z|h|s|t)\(\s*(\d+)\s*\)\s*$")
GATE_PARAM_RE = re.compile(r"^\s*qc\.(rx|ry|rz)\(\s*([^,]+)\s*,\s*(\d+)\s*\)\s*$")

MEASURE_ALL_RE = re.compile(r"^\s*qc\.measure_all\(\s*\)\s*$")
DRAW_RE = re.compile(r"^\s*qc\.draw\(\s*['\"]text['\"]\s*\)\s*$")

COMMENT_RE = re.compile(r"^\s*#")
BLANK_RE = re.compile(r"^\s*$")


def parse_theta(expr: str) -> float:
    s = expr.strip().replace(" ", "")
    s = s.replace("math.pi", "pi")

    try:
        return float(s)
    except ValueError:
        pass

    pi = math.pi

    if s == "pi":
        return pi
    if s == "-pi":
        return -pi

    m = re.fullmatch(r"([+-]?\d+)\*pi", s)
    if m:
        return int(m.group(1)) * pi

    m = re.fullmatch(r"pi/(\d+)", s)
    if m:
        return pi / int(m.group(1))

    m = re.fullmatch(r"([+-]?\d+)\*pi/(\d+)", s)
    if m:
        return int(m.group(1)) * pi / int(m.group(2))

    raise ValueError(f"Unsupported theta expression: {expr!r}")


def parse_generated_qiskit(code: str) -> Tuple[int, List[Op], bool]:
    n_qubits: Optional[int] = None
    ops: List[Op] = []
    has_measure_all = False
    seen_header = False

    for raw in code.splitlines():
        line = raw.strip()

        if BLANK_RE.match(line) or COMMENT_RE.match(line):
            continue

        if HEADER_RE.match(line):
            seen_header = True
            continue

        m = QC_RE.match(line)
        if m:
            n_qubits = int(m.group(1))
            continue

        if MEASURE_ALL_RE.match(line):
            has_measure_all = True
            continue

        if DRAW_RE.match(line):
            continue

        m = GATE_1Q_RE.match(line)
        if m:
            gate, q = m.group(1), int(m.group(2))
            ops.append(Op(gate, [q]))
            continue

        m = GATE_PARAM_RE.match(line)
        if m:
            gate = m.group(1)
            theta_expr = m.group(2)
            q = int(m.group(3))
            theta = parse_theta(theta_expr)
            ops.append(Op(gate, [theta, q]))
            continue

        raise ValueError(f"Rejected line: {raw!r}")

    if not seen_header:
        raise ValueError("Missing `from qiskit import QuantumCircuit`.")
    if n_qubits is None:
        raise ValueError("Missing `qc = QuantumCircuit(N)`.")

    return n_qubits, ops, has_measure_all


class BraketRunPayload(BaseModel):
    code: str
    backend: str = "SV1"
    shots: int = 100


@app.post("/braket/run")
def braket_run(payload: BraketRunPayload):
    try:
        n_qubits, ops, has_measure_all = parse_generated_qiskit(payload.code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    qc = QuantumCircuit(n_qubits)
    for op in ops:
        if op.name in {"x", "y", "z", "h", "s", "t"}:
            getattr(qc, op.name)(int(op.args[0]))
        elif op.name in {"rx", "ry", "rz"}:
            theta = float(op.args[0])
            q = int(op.args[1])
            getattr(qc, op.name)(theta, q)
        else:
            raise HTTPException(status_code=500, detail=f"Unsupported op: {op.name}")

    if not has_measure_all:
        qc.measure_all()

    try:
        boto_sess = boto3.Session(region_name=AWS_REGION)
        aws_sess = AwsSession(boto_session=boto_sess, default_bucket=BKT_RESULTS_BUCKET)

        provider = BraketProvider()
        backend = provider.get_backend(payload.backend)

        try:
            job = backend.run(qc, shots=payload.shots, s3_folder=(BKT_RESULTS_BUCKET, BKT_RESULTS_PREFIX))
        except TypeError:
            job = backend.run(qc, shots=payload.shots)

        result = job.result()
        counts = result.get_counts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Braket run failed: {e}")

    return {
        "ok": True,
        "backend": payload.backend,
        "shots": payload.shots,
        "counts": counts,
    }
