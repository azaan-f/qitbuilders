import os
from typing import Dict

from braket.aws import AwsDevice
from braket.circuits import Circuit


# Amazon SV1 simulator ARN (region-agnostic)
BRAKET_DEVICE_ARN = "arn:aws:braket:::device/quantum-simulator/amazon/sv1"


class BraketError(Exception):
    """Custom exception for Braket-related errors."""
    pass


def run_bell_state_on_sv1(shots: int = 1000) -> Dict[str, int]:
    """
    Build a simple Bell state circuit, run it on Amazon SV1,
    and return measurement counts like {"00": 500, "11": 500}.
    """

    # |00> -> H on qubit 0 -> CNOT(0,1) => entangled Bell state
    circuit = Circuit()
    circuit.h(0)
    circuit.cnot(0, 1)
    circuit.measure(0)
    circuit.measure(1)

    # Use the default Braket device and default S3 bucket
    device = AwsDevice(BRAKET_DEVICE_ARN)

    try:
        # IMPORTANT: no s3_destination_folder here – Braket uses its default bucket
        task = device.run(
            circuit,     # positional argument: task_specification
            shots=shots,
        )
    except Exception as e:
        raise BraketError(f"Failed to submit Braket task: {e}")

    try:
        result = task.result()
    except Exception as e:
        raise BraketError(f"Failed to fetch Braket result: {e}")

    counts = result.measurement_counts  # mapping bitstring -> count
    return dict(counts or {})
