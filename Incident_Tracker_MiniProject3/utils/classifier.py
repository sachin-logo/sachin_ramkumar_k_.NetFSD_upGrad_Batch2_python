

import re


NETWORK_PATTERN = re.compile(
    r'\b(\d{1,3}\.){3}\d{1,3}\b'           
    r'|TCP|UDP|ICMP'                         
    r'|VLAN|switch|firewall|router'          
    r'|packet loss|DNS|latency|bandwidth'    
    r'|rack|DC|datacenter|port',
    re.IGNORECASE
)

SECURITY_PATTERN = re.compile(
    r'breach|ransomware|brute.?force|malware'
    r'|phishing|unauthorized|intrusion'
    r'|suspicious login|threat|exploit'
    r'|virus|trojan|credential|SOC',
    re.IGNORECASE
)

APP_PATTERN = re.compile(
    r'error code|\bHTTP.?[45]\d{2}\b'       
    r'|NullPointerException|StackOverflow'   
    r'|stack trace|exception|traceback'      
    r'|timeout|503|502|500|404'             
    r'|\bAPI\b|service|microservice'         
    r'|deploy|build|pipeline|crash',
    re.IGNORECASE
)

CRITICAL_PATTERN = re.compile(
    r'outage|down\b|breach|ransomware|production|prod\b|critical',
    re.IGNORECASE
)

HIGH_PATTERN = re.compile(
    r'timeout|failing|unavailable|unreachable|NullPointerException|HTTP.?503',
    re.IGNORECASE
)

MEDIUM_PATTERN = re.compile(
    r'slow|degraded|warning|intermittent|packet loss|phishing|latency',
    re.IGNORECASE
)


# ── Public functions ───────────────────────────────────────────────────────────

def detect_type(text: str) -> str:
    """
    Returns 'network', 'security', 'app', or 'general'
    based on regex matching of the incident title + description.
    Security is checked before network because some incidents mention IPs.
    """
    if SECURITY_PATTERN.search(text):
        return "security"
    if NETWORK_PATTERN.search(text):
        return "network"
    if APP_PATTERN.search(text):
        return "app"
    return "general"


def detect_severity(text: str) -> str:
    """
    Returns 'critical', 'high', 'medium', or 'low'
    based on keyword matching of the incident title + description.
    """
    if CRITICAL_PATTERN.search(text):
        return "critical"
    if HIGH_PATTERN.search(text):
        return "high"
    if MEDIUM_PATTERN.search(text):
        return "medium"
    return "low"
