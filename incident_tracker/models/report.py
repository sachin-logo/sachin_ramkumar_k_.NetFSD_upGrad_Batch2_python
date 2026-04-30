# models/report.py — ReportGenerator: HTML + JSON output

import json
import os
from datetime import datetime


SEVERITY_COLORS = {
    "critical": "#e53935",
    "high":     "#fb8c00",
    "medium":   "#fdd835",
    "low":      "#43a047",
}

TYPE_ICONS = {
    "network":  "🌐",
    "security": "🔒",
    "app":      "⚙️",
    "general":  "📋",
}


class ReportGenerator:
    def __init__(self, incidents):
        self.incidents = incidents
        self.generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ── Summary stats ─────────────────────────────────────────────────────────
    def _count_by_severity(self):
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for i in self.incidents:
            counts[i.severity] = counts.get(i.severity, 0) + 1
        return counts

    def _count_by_type(self):
        counts = {}
        for i in self.incidents:
            counts[i.incident_type] = counts.get(i.incident_type, 0) + 1
        return counts

    def _count_by_team(self):
        counts = {}
        for i in self.incidents:
            counts[i.assigned_team] = counts.get(i.assigned_team, 0) + 1
        return counts

    # ── HTML report ───────────────────────────────────────────────────────────
    def generate_html(self, output_path="output/report.html"):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        by_sev  = self._count_by_severity()
        by_type = self._count_by_type()
        by_team = self._count_by_team()

        # Build type badges
        type_badges = "".join(
            f'<span class="badge badge-type">{TYPE_ICONS.get(t,"📋")} {t.capitalize()}: {c}</span>'
            for t, c in by_type.items()
        )

        # Build severity badges
        sev_badges = "".join(
            f'<span class="badge" style="background:{SEVERITY_COLORS.get(s,"#999")}">'
            f'{s.upper()}: {c}</span>'
            for s, c in by_sev.items() if c > 0
        )

        # Build team badges
        team_badges = "".join(
            f'<span class="badge badge-team">{t}: {c}</span>'
            for t, c in by_team.items()
        )

        # Build incident rows
        rows = ""
        for inc in sorted(self.incidents):
            sev_color = SEVERITY_COLORS.get(inc.severity, "#999")
            snow_id = inc.ticket_ids.get("snow", "—")
            jira_id = inc.ticket_ids.get("jira", "—")
            azure_id = inc.ticket_ids.get("azure", "—")
            icon = TYPE_ICONS.get(inc.incident_type, "📋")
            ts = inc.timestamp.strftime("%Y-%m-%d %H:%M")
            rows += f"""
            <tr>
              <td><strong>{inc.id}</strong></td>
              <td>{icon} {inc.title}</td>
              <td><span class="badge" style="background:{sev_color};color:#fff;font-size:11px;">
                {inc.severity.upper()}</span></td>
              <td>{inc.incident_type}</td>
              <td>{inc.assigned_team}</td>
              <td>{ts}</td>
              <td><code class="ticket snow">{snow_id}</code></td>
              <td><code class="ticket jira">{jira_id}</code></td>
              <td><code class="ticket azure">{azure_id}</code></td>
            </tr>"""

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>IT Incident Auto-Triage Report</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: 'Segoe UI', sans-serif; background: #f4f6f9; color: #333; }}
    header {{
      background: #1a237e; color: #fff; padding: 20px 48px;
      display: flex; align-items: center; justify-content: space-between;
    }}
    header h1 {{ font-size: 22px; letter-spacing: 0.5px; }}
    header small {{ opacity: 0.7; font-size: 13px; }}
    .container {{ max-width: 1600px; margin: 28px auto; padding: 0 32px; }}
    .card {{
      background: #fff; border-radius: 10px; padding: 24px 32px;
      margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,.08);
    }}
    .card h2 {{ font-size: 14px; text-transform: uppercase; color: #666;
                letter-spacing: 1px; margin-bottom: 16px; }}
    .summary-grid {{ display: flex; gap: 24px; flex-wrap: wrap; }}
    .summary-box {{
      background: #e8eaf6; border-radius: 10px; padding: 20px 36px;
      text-align: center; min-width: 130px;
    }}
    .summary-box .num {{ font-size: 42px; font-weight: 700; color: #1a237e; }}
    .summary-box .lbl {{ font-size: 13px; color: #555; margin-top: 6px; }}
    .badge {{
      display: inline-block; border-radius: 12px; padding: 5px 12px;
      font-size: 12px; font-weight: 600; margin: 4px; color: #fff;
    }}
    .badge-type {{ background: #546e7a; }}
    .badge-team {{ background: #00695c; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 13.5px; table-layout: auto; }}
    th {{
      background: #1a237e; color: #fff; padding: 12px 16px; text-align: left;
      border-right: 1px solid rgba(255,255,255,0.18);
      white-space: nowrap;
    }}
    th:last-child {{ border-right: none; }}
    td {{
      padding: 11px 16px; border-bottom: 1px solid #e8e8e8;
      border-right: 1px solid #e8e8e8; vertical-align: middle;
    }}
    td:last-child {{ border-right: none; }}
    tr:last-child td {{ border-bottom: none; }}
    tr:hover td {{ background: #f0f4ff; }}
    code.ticket {{
      display: inline-block; border-radius: 5px; padding: 3px 8px;
      font-size: 12px; font-weight: 600; white-space: nowrap;
    }}
    code.snow  {{ background: #e3f2fd; color: #1565c0; }}
    code.jira  {{ background: #e8f5e9; color: #2e7d32; }}
    code.azure {{ background: #fff3e0; color: #e65100; }}
    footer {{ text-align: center; padding: 24px; color: #999; font-size: 12px; }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>⚡ IT Incident Auto-Triage Report</h1>
      <small>Generated: {self.generated_at} &nbsp;|&nbsp; Total Incidents: {len(self.incidents)}</small>
    </div>
  </header>

  <div class="container">

    <div class="card">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-box">
          <div class="num">{len(self.incidents)}</div>
          <div class="lbl">Total Incidents</div>
        </div>
        <div class="summary-box">
          <div class="num" style="color:#e53935;">{by_sev.get('critical',0)}</div>
          <div class="lbl">Critical</div>
        </div>
        <div class="summary-box">
          <div class="num" style="color:#fb8c00;">{by_sev.get('high',0)}</div>
          <div class="lbl">High</div>
        </div>
        <div class="summary-box">
          <div class="num" style="color:#00695c;">{by_type.get('security',0)}</div>
          <div class="lbl">Security Threats</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Breakdown by Type</h2>
      {type_badges}
      <br/><br/>
      <h2>Breakdown by Severity</h2>
      {sev_badges}
      <br/><br/>
      <h2>Breakdown by Team</h2>
      {team_badges}
    </div>

    <div class="card">
      <h2>Incident Detail</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Title</th><th>Severity</th>
            <th>Type</th><th>Team</th><th>Timestamp</th><th>SNOW</th><th>Jira</th><th>Azure</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>

  </div>
  <footer>Produced by Incident Tracker — Mini Project 3</footer>
</body>
</html>
"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  [REPORT] HTML report written → {output_path}")
        return output_path

    # ── JSON export ───────────────────────────────────────────────────────────
    def export_json(self, output_path="output/report.json"):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        data = {
            "generated_at": self.generated_at,
            "total": len(self.incidents),
            "by_severity": self._count_by_severity(),
            "by_type": self._count_by_type(),
            "by_team": self._count_by_team(),
            "incidents": [i.to_dict() for i in self.incidents],
        }
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        print(f"  [REPORT] JSON summary written → {output_path}")
        return output_path
