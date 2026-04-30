

import base64
import json
import logging

from utils.decorators import log_call, retry

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from config import MOCK_API, JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY


SEVERITY_TO_PRIORITY = {
    "critical": "Highest",
    "high":     "High",
    "medium":   "Medium",
    "low":      "Low",
}


def _jira_auth_header():
    token = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_API_TOKEN}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


@log_call
@retry(times=3, delay=1)
def create_jira_issue(incident) -> str:
    """
    Create a Jira issue (Bug) for the incident.
    Returns the issue key (e.g. PROJ-42) or a mock ID.
    """
    payload = {
        "fields": {
            "summary": incident.title,
            "description": {
                "type": "doc",
                "version": 1,
                "content": [{
                    "type": "paragraph",
                    "content": [{"type": "text", "text": incident.description}]
                }]
            },
            "issuetype": {"name": "Bug"},
            "priority": {"name": SEVERITY_TO_PRIORITY.get(incident.severity, "Medium")},
            "project": {"key": JIRA_PROJECT_KEY},
            "labels": [incident.incident_type, incident.severity],
        }
    }

    if MOCK_API:
        mock_id = f"MOCK-JIRA-{incident.id}"
        print(f"    [JIRA MOCK] Payload → {json.dumps(payload, indent=6)}")
        print(f"    [JIRA MOCK] Issue created: {mock_id}")
        return mock_id

    if not REQUESTS_AVAILABLE:
        raise RuntimeError("requests library not installed. Run: pip install requests")

    headers = {**_jira_auth_header(), "Content-Type": "application/json"}
    response = requests.post(JIRA_BASE_URL, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
    key = response.json()["key"]
    logging.info(f"Jira issue created: {key}")
    return key


@log_call
@retry(times=3, delay=1)
def update_jira_issue(issue_key: str, priority: str) -> bool:
    """PUT to update a Jira issue's priority."""
    if MOCK_API:
        print(f"    [JIRA MOCK] Update issue {issue_key} → priority: {priority}")
        return True

    if not REQUESTS_AVAILABLE:
        raise RuntimeError("requests library not installed.")

    url = f"{JIRA_BASE_URL}/{issue_key}"
    headers = {**_jira_auth_header(), "Content-Type": "application/json"}
    payload = {"fields": {"priority": {"name": priority}}}
    response = requests.put(url, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
    return True
