# VulnBank Web, API, and Mobile Security Assessment

## Objective
Assessed a banking training environment across web, API, and Android surfaces, documenting fourteen security issues with ordered proof and remediation guidance.

### Skills Learned
- Enumerated infrastructure, directories, technologies, and vulnerable client libraries.
- Tested login controls, SQL injection, XSS, API versioning, rate limiting, and JWT integrity.
- Reviewed mobile manifest settings, embedded credentials, Shared Preferences, transport security, signing, and hashing.
- Mapped each validated issue to impact and remediation.

### Tools Used
- Burp Suite
- OWASP ZAP
- Gobuster
- DNSDumpster
- MobSF
- ADB
- Genymotion
- Kali Linux

## Findings Summary
Built only from the observations documented in the Steps below. The objective cites fourteen issues, but fifteen distinct observations are listed here. TODO (author): confirm the count, severities and fixes.

| ID | Issue | OWASP category | Severity | Fix | Evidence |
|---|---|---|---|---|---|
| VB-01 | Vulnerable client library: DOMPurify 2.3.3 | OWASP A06:2021 Vulnerable and Outdated Components | TBD by author | TBD by author | Ref 3 |
| VB-02 | Admin login brute-forced with Burp Intruder | OWASP A07:2021 Identification and Authentication Failures | TBD by author | Enforce a complex-password policy (Ref 7) | Refs 6-7 |
| VB-03 | SQL injection login bypass to the admin portal | OWASP A03:2021 Injection | TBD by author | TBD by author | Ref 8 |
| VB-04 | `/api/v3/forgot-password` can be downgraded to v1, exposing the email OTP | OWASP API9:2023 Improper Inventory Management | TBD by author | TBD by author | Refs 9-10 |
| VB-05 | No rate limiting on the login endpoint | OWASP API4:2023 Unrestricted Resource Consumption | TBD by author | TBD by author | Refs 11-12 |
| VB-06 | `/register` returns excessive debug and server information | OWASP API8:2023 Security Misconfiguration | TBD by author | TBD by author | Ref 13 |
| VB-07 | API documentation exposed at `/api/docs` without authentication | OWASP API9:2023 Improper Inventory Management | TBD by author | TBD by author | Ref 14 |
| VB-08 | JWT algorithm downgraded from HS256 to `none` with the signature removed | OWASP API2:2023 Broken Authentication | TBD by author | TBD by author | Ref 15 |
| VB-09 | Stored/reflected XSS in the `/transfer` description field | OWASP A03:2021 Injection | TBD by author | TBD by author | Refs 16-17 |
| VB-10 | Admin credentials hardcoded in the Android manifest | OWASP Mobile M1:2024 Improper Credential Usage | TBD by author | TBD by author | Ref 18 |
| VB-11 | Debug endpoint `/debug/users` declared in the manifest | OWASP Mobile M8:2024 Security Misconfiguration | TBD by author | TBD by author | Ref 19 |
| VB-12 | Sensitive data stored in plaintext Shared Preferences | OWASP Mobile M9:2024 Insecure Data Storage | TBD by author | TBD by author | Ref 20 |
| VB-13 | Data transmitted over unencrypted HTTP | OWASP Mobile M5:2024 Insecure Communication | TBD by author | TBD by author | Ref 21 |
| VB-14 | App signed with a debug certificate | OWASP Mobile M8:2024 Security Misconfiguration | TBD by author | TBD by author | Ref 22 |
| VB-15 | SHA-1 used for sensitive operations, enabling offline brute-force | OWASP Mobile M10:2024 Insufficient Cryptography | TBD by author | TBD by author | Ref 23 |

## Steps

*Ref 1: RECONNAISSANCE*

<img src="assets/step-01.png" width="602" height="375" alt="RECONNAISSANCE">

*Ref 2: Using dns dumpster online tools I am able to map out the dns records of the domain http://www.vulnbank.org.*

<img src="assets/step-02.png" width="602" height="335" alt="Using dns dumpster online tools I am able to map out the dns records of the domain http://www.vulnbank.org.">

*Ref 3: Using the zap proxy tool automated scanner, I found out that the application is using a vulnerable javascript library. DOMPurify version 2.3.3*

<img src="assets/step-03.png" width="602" height="455" alt="Using the zap proxy tool automated scanner, I found out that the application is using a vulnerable javascript library. DOMPurify version 2.3.3">

*Ref 4: The application is using cloudflare and http3*

<img src="assets/step-04.png" width="572" height="285" alt="The application is using cloudflare and http3">

*Ref 5: Using gobuster to enumerate the domain, I discovered 4 active directories with HTTP status code 200*

<img src="assets/step-05.png" width="681" height="340" alt="Using gobuster to enumerate the domain, I discovered 4 active directories with HTTP status code 200">

*Ref 6: Using burpsuite intruder to bruteforce the login page, I am able to login as admin.*

<img src="assets/step-06.png" width="602" height="299" alt="Using burpsuite intruder to bruteforce the login page, I am able to login as admin.">

*Ref 7: Recommendation is have a password policy that uses complex passwords to avoid brute force attacks*

<img src="assets/step-07.png" width="602" height="295" alt="Recommendation is have a password policy that uses complex passwords to avoid brute force attacks">

*Ref 8: Using sql payload admin’ OR 1==1’ on the login page, I am able to gain access to admin portal*

<img src="assets/step-08.png" width="602" height="293" alt="Using sql payload admin’ OR 1==1’ on the login page, I am able to gain access to admin portal">

*Ref 9: IMPROPER INVENTORY MANAGEMENT*

<img src="assets/step-09.png" width="602" height="299" alt="IMPROPER INVENTORY MANAGEMENT">

*Ref 10: The api endpoint /api/v3/forgot-password can be downgraded to v1 exposing the OTP that is being sent to email*

<img src="assets/step-10.png" width="602" height="364" alt="The api endpoint /api/v3/forgot-password can be downgraded to v1 exposing the OTP that is being sent to email">

*Ref 11: NO API RATE LIMITING*

<img src="assets/step-11.png" width="602" height="299" alt="NO API RATE LIMITING">

*Ref 12: No api rate limiting on the login endpoint was implemented allowing me to bruteforce account using 15 password attempts*

<img src="assets/step-12.png" width="602" height="379" alt="No api rate limiting on the login endpoint was implemented allowing me to bruteforce account using 15 password attempts">

*Ref 13: /register api endpoint reveals too much debug information including server information.*

<img src="assets/step-13.png" width="602" height="531" alt="/register api endpoint reveals too much debug information including server information.">

*Ref 14: The api documentation is exposed via /api/docs endpoint with no authentication checks*

<img src="assets/step-14.png" width="602" height="505" alt="The api documentation is exposed via /api/docs endpoint with no authentication checks">

*Ref 15: I downgraded the JWT token algorithm from hs256 to none and removed the signature.*

<img src="assets/step-15.png" width="602" height="376" alt="I downgraded the JWT token algorithm from hs256 to none and removed the signature.">

*Ref 16: XSS INJECTION*

<img src="assets/step-16.png" width="602" height="588" alt="XSS INJECTION">

*Ref 17: /transfer endpoint is vulnerable to xss. When xss payload is added to the description field the server responds with HTTP status code 200*

<img src="assets/step-17.png" width="602" height="500" alt="/transfer endpoint is vulnerable to xss. When xss payload is added to the description field the server responds with HTTP status code 200">

*Ref 18: The admin credentials are hardcoded in the android manifest.*

<img src="assets/step-18.png" width="602" height="301" alt="The admin credentials are hardcoded in the android manifest.">

*Ref 19: A debug endpoint (/debug/users) was declared in the application’s manifest file.*

<img src="assets/step-19.png" width="602" height="394" alt="A debug endpoint (/debug/users) was declared in the application’s manifest file.">

*Ref 20: SharedPreferences is not a secure storage mechanism and should not be used to store sensitive data in plaintext.*

<img src="assets/step-20.png" width="602" height="421" alt="SharedPreferences is not a secure storage mechanism and should not be used to store sensitive data in plaintext.">

*Ref 21: The application is transmitting data over unencrypted HTTP connections instead of HTTPS.*

<img src="assets/step-21.png" width="602" height="299" alt="The application is transmitting data over unencrypted HTTP connections instead of HTTPS.">

*Ref 22: Using a debug certificate implies the following: TODO (author): complete this explanation.*

<img src="assets/step-22.png" width="602" height="399" alt="Using a debug certificate implies the following:">

*Ref 23: The application also uses an insecure hashing algorithm for sensitive operations, that is SHA-1. This exposes users to credential compromise through offline brute-force attacks.*

<img src="assets/step-23.png" width="602" height="361" alt="The application also uses an insecure hashing algorithm for sensitive operations, that is SHA-1. This exposes users to credential compromise through offline brute-force attacks.">
