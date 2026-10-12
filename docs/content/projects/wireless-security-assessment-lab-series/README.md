# Wireless Security Assessment Lab Series

## Objective
Completed nine controlled wireless-security labs spanning discovery, WPA/WPA2 handshake capture, password auditing, rogue access points, WPS testing, MITM analysis, and automated assessment.

### Skills Learned
- Enabled monitor mode and inventoried SSIDs, BSSIDs, channels, clients, and encryption.
- Captured WPA/WPA2 handshakes and tested dictionary-based recovery.
- Simulated evil-twin, WPS, and MITM scenarios in a lab environment.
- Detected suspicious or duplicate access points and compared manual versus automated auditing.

### Tools Used
- Aircrack-ng
- Airmon-ng
- Airodump-ng
- Aireplay-ng
- Wifiphisher
- Reaver
- Kismet
- Hashcat
- Bettercap
- Wifite2

## Authorization and Scope
All testing in this series was authorized and performed in the author's own lab environment.

## Redaction Status
TODO (author): the screenshots below may show identifying or sensitive values. Blur or replace them before wider sharing:

| Ref | What to redact |
|---|---|
| 1, 2, 3, 10 | Lab SSID "NETHUB LR", BSSID and client MAC addresses |
| 4, 6, 9, 12, 13, 14, 15 | Third-party SSIDs, BSSIDs, MAC addresses and vendor details of nearby networks |
| 5, 11, 16 | Recovered WPA/WPA2 pre-shared key |
| 7 | Submitted test credential in captive-portal requests |

## Steps

*Ref 1: Airodump-ng captured WPA handshake evidence for the target NETHUB LR access point, including BSSID, channel, encryption, connected clients, and EAPOL frame activity.*

<img src="assets/step-01.png" width="626" height="392" alt="Airodump-ng captured WPA handshake evidence for the target NETHUB LR access point, including BSSID, channel, encryption, connected clients, and EAPOL frame activity.">

*Ref 2: Aireplay-ng deauthentication traffic was used in the controlled lab to force client reassociation and trigger a fresh WPA handshake capture.*

<img src="assets/step-02.png" width="626" height="392" alt="Aireplay-ng deauthentication traffic was used in the controlled lab to force client reassociation and trigger a fresh WPA handshake capture.">

*Ref 3: Wireshark analysis filtered the capture to EAPOL frames, confirming the WPA four-way handshake packets were present for the target client and AP.*

<img src="assets/step-03.png" width="626" height="392" alt="Wireshark analysis filtered the capture to EAPOL frames, confirming the WPA four-way handshake packets were present for the target client and AP.">

*Ref 4: Airodump-ng reconnaissance showed nearby WPA2 access points, active stations, channels, signal strength, and packet counts used to validate target selection.*

<img src="assets/step-04.png" width="626" height="392" alt="Airodump-ng reconnaissance showed nearby WPA2 access points, active stations, channels, signal strength, and packet counts used to validate target selection.">

*Ref 5: Aircrack-ng completed a dictionary-based password audit against the captured handshake and recovered the lab network key.*

<img src="assets/step-05.png" width="626" height="392" alt="Aircrack-ng completed a dictionary-based password audit against the captured handshake and recovered the lab network key.">

*Ref 6: Wifiphisher enumerated nearby access points with BSSID, channel, encryption, WPS status, client count, and vendor details before selecting the lab target.*

<img src="assets/step-06.png" width="626" height="392" alt="Wifiphisher enumerated nearby access points with BSSID, channel, encryption, WPS status, client count, and vendor details before selecting the lab target.">

*Ref 7: Wifiphisher ran the controlled rogue access point scenario, showing a connected lab client, captive-portal HTTP requests, and the submitted test credential.*

<img src="assets/step-07.png" width="626" height="392" alt="Wifiphisher ran the controlled rogue access point scenario, showing a connected lab client, captive-portal HTTP requests, and the submitted test credential.">

*Ref 8: Reaver WPS testing targeted a selected access point, received beacon frames, attempted PIN authentication, and recorded repeated receive-timeout warnings.*

<img src="assets/step-08.png" width="626" height="392" alt="Reaver WPS testing targeted a selected access point, received beacon frames, attempted PIN authentication, and recorded repeated receive-timeout warnings.">

*Ref 9: Kismet provided a browser-based wireless inventory with detected APs, encryption types, channels, packet activity, signal levels, and manufacturer data.*

<img src="assets/step-09.png" width="626" height="392" alt="Kismet provided a browser-based wireless inventory with detected APs, encryption types, channels, packet activity, signal levels, and manufacturer data.">

*Ref 10: Aircrack-ng converted the captured WPA handshake into Hashcat-compatible format and identified the NETHUB LR handshake as the cracking target.*

<img src="assets/step-10.png" width="626" height="392" alt="Aircrack-ng converted the captured WPA handshake into Hashcat-compatible format and identified the NETHUB LR handshake as the cracking target.">

*Ref 11: Hashcat completed the WPA-PBKDF2 audit in mode 22000, marked the hash as cracked, and reported the recovered lab PSK.*

<img src="assets/step-11.png" width="626" height="392" alt="Hashcat completed the WPA-PBKDF2 audit in mode 22000, marked the hash as cracked, and reported the recovered lab PSK.">

*Ref 12: Bettercap wireless reconnaissance started on wlan0, enabled channel hopping, and logged newly discovered access points and client probe activity.*

<img src="assets/step-12.png" width="626" height="392" alt="Bettercap wireless reconnaissance started on wlan0, enabled channel hopping, and logged newly discovered access points and client probe activity.">

*Ref 13: Bettercap wifi.show summarized discovered networks by RSSI, BSSID, SSID, encryption, WPS version, channel, client count, and observed traffic.*

<img src="assets/step-13.png" width="626" height="392" alt="Bettercap wifi.show summarized discovered networks by RSSI, BSSID, SSID, encryption, WPS version, channel, client count, and observed traffic.">

*Ref 14: Bettercap net.sniff captured live 802.11 management beacon frames, showing transmitter and receiver addresses for observed wireless networks.*

<img src="assets/step-14.png" width="626" height="392" alt="Bettercap net.sniff captured live 802.11 management beacon frames, showing transmitter and receiver addresses for observed wireless networks.">

*Ref 15: Wifite2 enumerated wireless targets in monitor mode, highlighting ESSID, channel, encryption type, signal strength, WPS availability, and client presence.*

<img src="assets/step-15.png" width="626" height="393" alt="Wifite2 enumerated wireless targets in monitor mode, highlighting ESSID, channel, encryption type, signal strength, WPS availability, and client presence.">

*Ref 16: Wifite2 captured and validated a WPA handshake, ran a wordlist audit, saved the evidence file, and recorded the recovered test PSK in the results output.*

<img src="assets/step-16.png" width="626" height="393" alt="Wifite2 captured and validated a WPA handshake, ran a wordlist audit, saved the evidence file, and recorded the recovered test PSK in the results output.">
