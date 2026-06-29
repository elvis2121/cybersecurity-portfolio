# SOC Automation and Detection Engineering Homelab

## Objective
Built and validated an end-to-end SOC homelab that inspects outbound traffic, centralizes network and endpoint telemetry in Splunk, and automates enrichment, case management, forensic collection, and host isolation through n8n, DFIR-IRIS, Velociraptor, and Wazuh.

### Skills Learned
- Engineered segmented traffic inspection with `pfSense`, `Squid Proxy`, and `Suricata`.
- Forwarded endpoint and network telemetry into `Splunk` for centralized correlation.
- Automated IOC enrichment, AI triage, ticketing, and response decisions with `n8n`.
- Triggered forensic collection with `Velociraptor` and host isolation with `Wazuh Active Response`.
- Validated both high-risk and low-risk alert paths with controlled synthetic events.

### Tools Used
- pfSense
- Squid Proxy
- Suricata
- Splunk
- Sysmon
- Wazuh
- n8n
- DFIR-IRIS
- Velociraptor
- VirusTotal
- LM Studio or Ollama

## Steps

*Ref 1: Inter-VLAN telemetry flow and SOAR remediation pipeline control vectors.*

<img src="assets/step-01.png" alt="Network topology and SOAR remediation flow diagram">

*Ref 2: Consolidated homelab architecture connecting perimeter inspection, telemetry, SIEM, and response services.*

<img src="assets/step-02.png" alt="Homelab architecture overview">

*Ref 3: `pfSense` perimeter configuration supporting LAN control, proxy routing, and inspection.*

<img src="assets/step-03.png" alt="pfSense perimeter configuration">

*Ref 4: Windows 11 endpoint prepared with `Sysmon`, `Splunk Universal Forwarder`, and `Wazuh Agent`.*

<img src="assets/step-04.png" alt="Windows 11 endpoint with SOC tooling">

*Ref 5: Additional endpoint evidence showing the installed monitoring stack used during workflow validation.*

<img src="assets/step-05.png" alt="Endpoint telemetry instrumentation evidence">

*Ref 6: Splunk evidence view used to validate the alerting and correlation stage before handing off to SOAR.*

<img src="assets/step-06.png" alt="Splunk detection and correlation view">

*Ref 7: Wazuh alert forwarding into the centralized workflow.*

<img src="assets/step-07.png" alt="Wazuh alert forwarding view">

*Ref 8: Wazuh active response enforcing host isolation through a firewall rule.*

<img src="assets/step-08.png" alt="Wazuh active response isolation evidence">

*Ref 9: `n8n` workflow receiving Splunk alerts and orchestrating the response chain.*

<img src="assets/step-09.png" alt="n8n workflow overview">

*Ref 10: `n8n` branching logic for enrichment, triage, case updates, and automated follow-on actions.*

<img src="assets/step-10.png" alt="n8n branching and response logic">

*Ref 11: `DFIR-IRIS` investigation case created and updated for each alert.*

<img src="assets/step-11.png" alt="DFIR-IRIS case management evidence">

*Ref 12: `Velociraptor` forensic collection execution for the affected host.*

<img src="assets/step-12.png" alt="Velociraptor collection evidence">

*Ref 13: Master File Table artifact collection captured during the response workflow.*

<img src="assets/step-13.png" alt="Master File Table artifact evidence">

*Ref 14: Windows Registry artifact collection preserved as part of automated triage.*

<img src="assets/step-14.png" alt="Windows Registry artifact evidence">
