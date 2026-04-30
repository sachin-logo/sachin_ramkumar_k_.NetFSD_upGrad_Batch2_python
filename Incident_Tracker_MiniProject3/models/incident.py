# models/incident.py — Incident base class, subclasses, iterator, and batch generator

import json
from datetime import datetime
from utils.classifier import detect_type, detect_severity

SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}

class Incident:
    def __init__(self, id, title, description, reported_by, timestamp, assigned_team):
        self.id = id
        self.title = title
        self.description = description
        self.reported_by = reported_by
        self.timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        self.assigned_team = assigned_team
        self._severity = None       # private — set by classify()
        self.ticket_ids = {}        # populated after API calls
        self.incident_type = "general"

    @staticmethod
    def validate_schema(record: dict) -> bool:
        """Validates that a JSON record has all required fields."""
        required = {"id", "title", "description", "reported_by", "timestamp", "assigned_team"}
        missing = required - set(record.keys())
        if missing:
            raise ValueError(f"Incident record {record.get('id', '?')} missing fields: {missing}")
        return True

    def classify(self):
        """Must be overridden by subclasses."""
        raise NotImplementedError("Subclasses must implement classify()")

    @property
    def severity(self):
        return self._severity

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "reported_by": self.reported_by,
            "timestamp": self.timestamp.isoformat(),
            "assigned_team": self.assigned_team,
            "severity": self._severity,
            "incident_type": self.incident_type,
            "ticket_ids": self.ticket_ids,
        }

    def __str__(self):
        return f"[{self.id}] {self.title} | Type: {self.incident_type} | Severity: {self._severity}"

    def __repr__(self):
        return f"<{self.__class__.__name__} id={self.id} severity={self._severity}>"

    def __lt__(self, other):
        """Enable sorting by severity (critical first)."""
        return SEVERITY_ORDER.get(self._severity, 99) < SEVERITY_ORDER.get(other._severity, 99)


class NetworkIncident(Incident):
    def __init__(self, affected_host="", protocol="", **kwargs):
        super().__init__(**kwargs)
        self.affected_host = affected_host
        self.protocol = protocol
        self.incident_type = "network"

    def classify(self):
        combined = f"{self.title} {self.description}"
        self._severity = detect_severity(combined)

    def escalate(self):
        """Page the on-call network team."""
        print(f"  [ESCALATE] Paging on-call network team for incident {self.id}: {self.title}")
        return f"On-call paged for {self.id}"


class AppIncident(Incident):
    def __init__(self, app_name="", error_code="", **kwargs):
        super().__init__(**kwargs)
        self.app_name = app_name
        self.error_code = error_code
        self.incident_type = "app"

    def classify(self):
        combined = f"{self.title} {self.description}"
        self._severity = detect_severity(combined)

    def get_stack_trace(self):
        """Return a snippet from the description simulating a stack trace."""
        snippet = self.description[:200] if len(self.description) > 200 else self.description
        return f"[Stack Trace for {self.id}]\n{snippet}\n..."


class SecurityIncident(Incident):
    def __init__(self, threat_type="", source_ip="", **kwargs):
        super().__init__(**kwargs)
        self.threat_type = threat_type
        self.source_ip = source_ip
        self.incident_type = "security"

    def classify(self):
        combined = f"{self.title} {self.description}"
        self._severity = detect_severity(combined)

    def notify_soc(self):
        """Send a SOC alert for this security incident."""
        print(f"  [SOC ALERT] Security incident {self.id} flagged: {self.title} | Threat: {self.threat_type}")
        return f"SOC alerted for {self.id}"


def create_incident(record: dict) -> Incident:
    """
    Given a raw JSON record, detect its type and return the appropriate subclass.
    Uses the classifier to determine type from title + description.
    """
    Incident.validate_schema(record)
    combined = f"{record['title']} {record['description']}"
    itype = detect_type(combined)

    base_kwargs = {
        "id": record["id"],
        "title": record["title"],
        "description": record["description"],
        "reported_by": record["reported_by"],
        "timestamp": record["timestamp"],
        "assigned_team": record["assigned_team"],
    }

    if itype == "network":
        return NetworkIncident(
            affected_host=record.get("affected_host", ""),
            protocol=record.get("protocol", ""),
            **base_kwargs
        )
    elif itype == "security":
        return SecurityIncident(
            threat_type=record.get("threat_type", ""),
            source_ip=record.get("source_ip", ""),
            **base_kwargs
        )
    elif itype == "app":
        return AppIncident(
            app_name=record.get("app_name", ""),
            error_code=record.get("error_code", ""),
            **base_kwargs
        )
    else:
        # fallback — generic Incident
        inc = Incident(**base_kwargs)
        # Override classify so it doesn't raise NotImplementedError
        inc.incident_type = "general"
        inc._severity = detect_severity(combined)
        # Monkey-patch classify to be a no-op since already classified
        inc.classify = lambda: None
        return inc

class IncidentIterator:
    """
    Iterator protocol over a list of incidents.
    Supports optional severity filtering so callers can iterate
    only over, e.g., 'critical' incidents.
    """
    def __init__(self, incidents, severity_filter=None):
        self._incidents = (
            [i for i in incidents if i.severity == severity_filter]
            if severity_filter
            else list(incidents)
        )
        self._index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self._index >= len(self._incidents):
            raise StopIteration
        incident = self._incidents[self._index]
        self._index += 1
        return incident


# ── Batch generator ───────────────────────────────────────────────────────────
def batch_incidents(incidents, batch_size=3):
    """
    Yield incidents in batches of batch_size.
    Using a generator here avoids building a list of all batches in memory —
    especially useful when processing large volumes of incidents.
    """
    for i in range(0, len(incidents), batch_size):
        yield incidents[i: i + batch_size]
