MOCK_API = True  

# ServiceNow credentials
SNOW_INSTANCE = "your-instance"
SNOW_USERNAME = "admin"
SNOW_PASSWORD = "your-password"
SNOW_BASE_URL = f"https://{SNOW_INSTANCE}.service-now.com/api/now/table/incident"

# Jira credentials
JIRA_DOMAIN = "your-domain"
JIRA_EMAIL = "your-email@example.com"
JIRA_API_TOKEN = "your-api-token"
JIRA_PROJECT_KEY = "PROJ"
JIRA_BASE_URL = f"https://{JIRA_DOMAIN}.atlassian.net/rest/api/3/issue"

# Azure Boards credentials
AZURE_ORG = "your-org"
AZURE_PROJECT = "your-project"
AZURE_PAT = "your-personal-access-token"
AZURE_BASE_URL = f"https://dev.azure.com/{AZURE_ORG}/{AZURE_PROJECT}/_apis/wit/workitems/$Bug?api-version=7.1"

import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
