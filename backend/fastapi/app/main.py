from fastapi import FastAPI
from app.routers import health, circuits, run

app = FastAPI(
    title="Qit Builder Backend",
    description="Backend API for Qit Builder quantum circuit platform using FastAPI and DynamoDB",
    version="0.1.0"
)

# Register routers
app.include_router(health.router)
app.include_router(circuits.router)
app.include_router(run.router)

@app.get("/")
def root():
    return {"message": "Qit Builder Backend is running"}
