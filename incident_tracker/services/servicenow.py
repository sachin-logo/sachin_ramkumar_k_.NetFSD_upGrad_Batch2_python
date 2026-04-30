

import base64
import json
import logging
import uuid

from utils.decorators import log_call, retry

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from config import MOCK_API, SNOW_BASE_URL, SNOW_USERNAME, SNOW_PASSWORD


SEVERITY_TO_URGENCY = {"critical": 1, "high": 1, "medium": 2, "low": 3}


@log_call
@retry(times=3, delay=1)
def create_snow_ticket(incident) -> str:
    """
    Create a ServiceNow incident ticket.
    Returns sys_id (real) or a mock ticket ID.
    """
    payload = {
        "short_description": incident.title,
        "description": incident.description,
        "urgency": SEVERITY_TO_URGENCY.get(incident.severity, 2),
        "category": incident.incident_type,
        "assignment_group": incident.assigned_team,
        "caller_id": incident.reported_by,
    }

    if MOCK_API:
        mock_id = f"MOCK-SNOW-{incident.id}"
        print(f"    [SNOW MOCK] Payload → {json.dumps(payload, indent=6)}")
        print(f"    [SNOW MOCK] Ticket created: {mock_id}")
        return mock_id

    if not REQUESTS_AVAILABLE:
        raise RuntimeError("requests library not installed. Run: pip install requests")

    auth = (SNOW_USERNAME, SNOW_PASSWORD)
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    response = requests.post(SNOW_BASE_URL, json=payload, auth=auth, headers=headers, timeout=10)
    response.raise_for_status()
    sys_id = response.json()["result"]["sys_id"]
    logging.info(f"ServiceNow ticket created: {sys_id}")
    return sys_id


@log_call
@retry(times=3, delay=1)
def update_snow_ticket(sys_id: str, status: str) -> bool:
    """PATCH the ServiceNow ticket status."""
    if MOCK_API:
        print(f"    [SNOW MOCK] Update ticket {sys_id} → status: {status}")
        return True

    if not REQUESTS_AVAILABLE:
        raise RuntimeError("requests library not installed.")

    url = f"{SNOW_BASE_URL}/{sys_id}"
    auth = (SNOW_USERNAME, SNOW_PASSWORD)
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    response = requests.patch(url, json={"state": status}, auth=auth, headers=headers, timeout=10)
    response.raise_for_status()
    return True
