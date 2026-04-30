# IT Incident Auto-Triage & Tracker
### Mini Project 3 — Python Training Program

A Python CLI application that reads raw IT incident data, auto-classifies each incident by type and severity using regex, simulates creating tickets in **ServiceNow**, **Jira**, and **Azure Boards**, and produces a styled **HTML report**.

---

## Project Structure

```
incident_tracker/
├── main.py                  # CLI entry point — orchestrates the pipeline
├── config.py                # API credentials + MOCK_API flag
├── models/
│   ├── __init__.py
│   ├── incident.py          # Base class + 3 subclasses + iterator + batch generator
│   └── report.py            # ReportGenerator → HTML + JSON output
├── services/
│   ├── __init__.py
│   ├── servicenow.py        # ServiceNow integration (mock-safe)
│   ├── jira.py              # Jira integration (mock-safe)
│   └── azure_boards.py      # Azure Boards integration (mock-safe)
├── utils/
│   ├── __init__.py
│   ├── classifier.py        # detect_type() + detect_severity() via regex
│   ├── decorators.py        # @log_call + @retry
│   └── helpers.py           # map / filter / reduce helpers
├── data/
│   └── incidents.json       # 12 sample incident records
└── output/
    └── report.html          # Auto-generated on run
```

---

## Setup

### Prerequisites
- Python 3.8 or higher
- (Optional) `requests` library for live API calls

### Install dependencies
```bash
pip install requests
```
> `requests` is only needed for live API mode. Mock mode works with zero dependencies.

---

## How to Run

### 1. Navigate to the project folder
```bash
cd incident_tracker
```

### 2. Run in mock mode (default — no credentials needed)
```bash
python main.py
```

This will:
- Load all 12 incidents from `data/incidents.json`
- Classify each by type and severity
- Simulate ticket creation in all 3 platforms
- Write `output/report.html` and `output/report.json`

---

## CLI Options

| Flag | Description | Example |
|------|-------------|---------|
| `--data` | Path to a custom incidents JSON file | `--data data/incidents.json` |
| `--severity` | Only process incidents of this severity | `--severity critical` |
| `--batch-size` | Incidents per batch (default: 3) | `--batch-size 4` |

### Examples

```bash
# Process only critical incidents
python main.py --severity critical

# Process only high severity incidents
python main.py --severity high

# Use a custom input file with a batch size of 4
python main.py --data data/incidents.json --batch-size 4
```

---

## Mock vs Live Mode

In `config.py`:

```python
MOCK_API = True   # ← default: no real API calls, prints payloads to console
MOCK_API = False  # ← live mode: fill in credentials below
```

To use live API mode, update the credential fields in `config.py`:
- `SNOW_INSTANCE`, `SNOW_USERNAME`, `SNOW_PASSWORD`
- `JIRA_DOMAIN`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`
- `AZURE_ORG`, `AZURE_PROJECT`, `AZURE_PAT`

---

## Output

After a successful run, two files are created:

| File | Description |
|------|-------------|
| `output/report.html` | Styled HTML dashboard with summary stats and full incident table |
| `output/report.json` | JSON summary with all ticket IDs |

Open `output/report.html` in any browser to view the report.

---

## Python Concepts Used

| Concept | Where used |
|---------|-----------|
| OOP — inheritance, `@property`, `__lt__` | `models/incident.py` |
| `NotImplementedError` in base class | `Incident.classify()` |
| `@staticmethod` for schema validation | `Incident.validate_schema()` |
| Iterator protocol (`__iter__`, `__next__`) | `IncidentIterator` |
| Generator function (`yield`) | `batch_incidents()` |
| Decorators (`functools.wraps`) | `utils/decorators.py` |
| `re` module — compiled patterns | `utils/classifier.py` |
| `map`, `filter`, `reduce` | `utils/helpers.py` |
| File I/O, string formatting | `models/report.py` |
| `argparse` CLI | `main.py` |
| `json` module | `main.py`, `models/report.py` |
| `datetime.fromisoformat` | `models/incident.py` |

---

## Submission

Zip as: `[Batch2]_[Sachin ramkumar]_Incident_Tracker_MiniProject_3.zip`

Include:
- Full project folder
- This `README.md`
- `output/report.html` from a successful mock-mode run
