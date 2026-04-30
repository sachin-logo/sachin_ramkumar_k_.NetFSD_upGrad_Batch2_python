

import argparse
import json
import logging
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  

from models.incident import create_incident, batch_incidents, IncidentIterator
from models.report import ReportGenerator
from services.servicenow import create_snow_ticket
from services.jira import create_jira_issue
from services.azure_boards import create_azure_workitem
from utils.helpers import (
    get_critical_incidents,
    count_by_team,
    count_by_type,
    count_by_severity,
    get_incidents_by_severity,
)



def load_incidents(path: str):
    """Load and parse incidents from a JSON file."""
    with open(path, encoding="utf-8") as f:
        records = json.load(f)
    incidents = []
    for record in records:
        try:
            inc = create_incident(record)
            inc.classify()
            incidents.append(inc)
        except (ValueError, KeyError) as e:
            logging.warning(f"Skipping invalid record: {e}")
    return incidents


def push_to_platforms(incident):
    """Push one incident to all three platforms and store ticket IDs."""
    print(f"\n  ── {incident.id}: {incident.title[:60]}")
    print(f"     Type: {incident.incident_type} | Severity: {incident.severity}")

    snow_id  = create_snow_ticket(incident)
    jira_id  = create_jira_issue(incident)
    azure_id = create_azure_workitem(incident)

    incident.ticket_ids["snow"]  = snow_id
    incident.ticket_ids["jira"]  = jira_id
    incident.ticket_ids["azure"] = azure_id

    print(f"     Tickets → SNOW: {snow_id} | JIRA: {jira_id} | AZURE: {azure_id}")



def run(data_path: str, severity_filter: str = None, batch_size: int = 3):
    print("\n" + "="*65)
    print("  ⚡ IT Incident Auto-Triage & Tracker — Starting Pipeline")
    print("="*65)

    
    print(f"\n[1/4] Loading incidents from {data_path} ...")
    all_incidents = load_incidents(data_path)
    print(f"      Loaded {len(all_incidents)} incidents.")

    
    if severity_filter:
        incidents = get_incidents_by_severity(all_incidents, severity_filter)
        print(f"      Filtered to {len(incidents)} '{severity_filter}' incidents (--severity flag).")
    else:
        incidents = all_incidents

    if not incidents:
        print("      No incidents to process. Exiting.")
        return

    
    print(f"\n[2/4] Processing incidents in batches of {batch_size} ...")
    for batch_num, batch in enumerate(batch_incidents(incidents, batch_size), start=1):
        print(f"\n  ── Batch {batch_num} ({'–'.join(i.id for i in batch)}) ──")
        for incident in batch:
            push_to_platforms(incident)

    
    print("\n[3/4] Summary statistics ...")
    by_sev  = count_by_severity(incidents)
    by_type = count_by_type(incidents)
    by_team = count_by_team(incidents)

    print(f"      By severity : {by_sev}")
    print(f"      By type     : {by_type}")
    print(f"      By team     : {by_team}")

    criticals = get_critical_incidents(incidents)
    if criticals:
        print(f"\n      ⚠  Critical incidents ({len(criticals)}):")
        for ci in criticals:
            print(f"         {ci}")

    
    print("\n[4/4] Generating reports ...")
    reporter = ReportGenerator(incidents)
    html_path = reporter.generate_html("output/report.html")
    json_path = reporter.export_json("output/report.json")

    
    print("\n" + "="*65)
    print("  ✅ Pipeline complete!")
    print(f"     HTML Report : {html_path}")
    print(f"     JSON Report : {json_path}")
    print("="*65 + "\n")



def main():
    parser = argparse.ArgumentParser(
        description="IT Incident Auto-Triage & Tracker"
    )
    parser.add_argument(
        "--data",
        default="data/incidents.json",
        help="Path to the incidents JSON file (default: data/incidents.json)",
    )
    parser.add_argument(
        "--severity",
        choices=["critical", "high", "medium", "low"],
        default=None,
        help="Only process incidents of this severity level",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=3,
        help="Number of incidents to process per batch (default: 3)",
    )
    args = parser.parse_args()

    run(
        data_path=args.data,
        severity_filter=args.severity,
        batch_size=args.batch_size,
    )


if __name__ == "__main__":
    main()
