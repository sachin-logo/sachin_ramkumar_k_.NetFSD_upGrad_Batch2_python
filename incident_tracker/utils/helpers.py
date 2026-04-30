

from functools import reduce


def get_critical_incidents(incidents):
    """Return only incidents with severity == 'critical'."""
    return list(filter(lambda i: i.severity == "critical", incidents))


def get_incidents_by_severity(incidents, severity):
    """Return incidents matching a given severity level."""
    return list(filter(lambda i: i.severity == severity, incidents))


def build_jira_payloads(incidents):
    """Map incidents to their dict representation for Jira payloads."""
    return list(map(lambda i: i.to_dict(), incidents))


def count_by_team(incidents):
    """Reduce incidents into a {team_name: count} dict."""
    return reduce(
        lambda acc, i: {**acc, i.assigned_team: acc.get(i.assigned_team, 0) + 1},
        incidents,
        {}
    )


def count_by_type(incidents):
    """Reduce incidents into a {incident_type: count} dict."""
    return reduce(
        lambda acc, i: {**acc, i.incident_type: acc.get(i.incident_type, 0) + 1},
        incidents,
        {}
    )


def count_by_severity(incidents):
    """Reduce incidents into a {severity: count} dict."""
    return reduce(
        lambda acc, i: {**acc, i.severity: acc.get(i.severity, 0) + 1},
        incidents,
        {}
    )
