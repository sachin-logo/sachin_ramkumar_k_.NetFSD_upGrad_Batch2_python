

import base64
import json
import logging

from utils.decorators import log_call, retry

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from config import MOCK_API, AZURE_BASE_URL, AZURE_PAT


SEVERITY_TO_PRIORITY = {
    "critical": 1,
    "high":     2,
    "medium":   3,
    "low":      4,
}


def _azure_auth_header():
    token = base64.b64encode(f":{AZURE_PAT}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


@log_call
@retry(times=3, delay=1)
def create_azure_workitem(incident) -> str:
    """
    Create an Azure Boards Bug work item for the incident.
    Uses JSON Patch format as required by the Azure DevOps API.
    Returns work item ID or a mock ID.
    """
    payload = [
        {"op": "add", "path": "/fields/System.Title",
         "value": incident.title},
        {"op": "add", "path": "/fields/Microsoft.VSTS.Common.Priority",
         "value": SEVERITY_TO_PRIORITY.get(incident.severity, 3)},
        {"op": "add", "path": "/fields/System.AssignedTo",
         "value": incident.assigned_team},
        {"op": "add", "path": "/fields/System.Description",
         "value": incident.description},
    ]

    if MOCK_API:
        mock_id = f"MOCK-AZURE-{incident.id}"
        print(f"    [AZURE MOCK] Payload → {json.dumps(payload, indent=6)}")
        print(f"    [AZURE MOCK] Work item created: {mock_id}")
        return mock_id

    if not REQUESTS_AVAILABLE:
        raise RuntimeError("requests library not installed. Run: pip install requests")

    headers = {
        **_azure_auth_header(),
        "Content-Type": "application/json-patch+json",
    }
    response = requests.post(AZURE_BASE_URL, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
    work_item_id = str(response.json()["id"])
    logging.info(f"Azure Boards work item created: {work_item_id}")
    return work_item_id
