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

## Steps

*Ref 1: LAB 2*

<img src="assets/step-01.png" width="626" height="392" alt="LAB 2">

*Ref 2: sudo aireplay-ng --deauth 10 -a <target-bssid> -c <client-mac> wlan0mon 4. Check if the handshake was captured by examining the capture file.*

<img src="assets/step-02.png" width="626" height="392" alt="sudo aireplay-ng --deauth 10 -a &lt;target-bssid&gt; -c &lt;client-mac&gt; wlan0mon 4. Check if the handshake was captured by examining the capture file.">

*Ref 3: LAB 3*

<img src="assets/step-03.png" width="626" height="392" alt="LAB 3">

*Ref 4: LAB 3*

<img src="assets/step-04.png" width="626" height="392" alt="LAB 3">

*Ref 5: LAB 4*

<img src="assets/step-05.png" width="626" height="392" alt="LAB 4">

*Ref 6: LAB 5*

<img src="assets/step-06.png" width="626" height="392" alt="LAB 5">

*Ref 7: LAB 5*

<img src="assets/step-07.png" width="626" height="392" alt="LAB 5">

*Ref 8: LAB 6*

<img src="assets/step-08.png" width="626" height="392" alt="LAB 6">

*Ref 9: LAB 7*

<img src="assets/step-09.png" width="626" height="392" alt="LAB 7">

*Ref 10: LAB 8*

<img src="assets/step-10.png" width="626" height="392" alt="LAB 8">

*Ref 11: LAB 8*

<img src="assets/step-11.png" width="626" height="392" alt="LAB 8">

*Ref 12: 2. Once associated, use `net.sniff` to capture and analyze the traffic from other clients. https://www.stationx.net/bettercap-tutorial/*

<img src="assets/step-12.png" width="626" height="392" alt="2. Once associated, use `net.sniff` to capture and analyze the traffic from other clients. https://www.stationx.net/bettercap-tutorial/">

*Ref 13: 2. Once associated, use `net.sniff` to capture and analyze the traffic from other clients. https://www.stationx.net/bettercap-tutorial/*

<img src="assets/step-13.png" width="626" height="392" alt="2. Once associated, use `net.sniff` to capture and analyze the traffic from other clients. https://www.stationx.net/bettercap-tutorial/">

*Ref 14: LAB 9*

<img src="assets/step-14.png" width="626" height="392" alt="LAB 9">

*Ref 15: 3. Review the output and analyze the results.*

<img src="assets/step-15.png" width="626" height="393" alt="3. Review the output and analyze the results.">

*Ref 16: 3. Review the output and analyze the results.*

<img src="assets/step-16.png" width="626" height="393" alt="3. Review the output and analyze the results.">
