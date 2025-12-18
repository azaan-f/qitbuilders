# Introduction
## What is QitBuilder?

QitBuilder is an application aimed towards both students and professionals to easily learn quantum computing. In the current ecosystem for consumer quantum computing tooling, most software is behind a steep learning curve as well as a paywall. We wanted to help fix this issue, so we created QitBuilder.

QitBuilder consists of a code editor and a circuit editor. Users can drag and drop quantum gates such as X, H, S, and CX. They can then see how their Qiskit code changes in real time, and they can run their circuit on not only simulators, but actual quantum hardware! They can then review the outcome of their circuit both visually as well as the raw results.

## What is quantum computing?
Quantum computers use qubits instead of regular bits. Unlike a normal bit that’s either 0 or 1, a qubit is a probability of both, and qubits can also be entangled. This lets quantum computers try many possibilities at the same time, so they can be much faster for certain problems. A powerful quantum computer could break one of today’s most common encryption, RSA, exposing banks, companies and governments. That’s national security and every major company’s data on the line. Because of this risk, governments and Big Tech are investing billions to build quantum machines and to create “quantum-safe” encryption before it’s too late


# Technical Architecture
<img width="1710" height="1368" alt="unnamed" src="https://github.com/user-attachments/assets/926e64ad-086c-4135-ac4c-55e171dcc7a0" />

# Developers
- Ali Mohammed - Backend and project lead
- Azaan Farooq - Frontend and feature integration
- Diego Valle - Backend and project architecture
- Sayam Ghani - Frontend and UX designer

# Environment setup
## Frontend
To run the frontend, run the following commands from the parent folder:
```
cd frontend
npm run dev
```
## Backend
To run the backend, run the following commands from the parent folder:
```
cd backend/fastapi
source venv/bin/activate
pip install -r requirements.txt
```
Then, create a .env file in `backend/fastapi`, and include the following:
```
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY

AWS_REGION=YOUR_AWS_REGION
AWS_DEFAULT_REGION=us-east-1

BKT_RESULTS_BUCKET=YOUR_S3_BUCKET_NAME
BKT_RESULTS_PREFIX=YOUR_S3_BUCKET_PREFIX
```
Then, run the following command in the python venv
```
uvicorn app.main:app --reload
```
