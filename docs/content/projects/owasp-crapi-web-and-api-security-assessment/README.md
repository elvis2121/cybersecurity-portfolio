# OWASP crAPI Web and API Security Assessment

## Objective
Executed a structured security assessment against a local OWASP crAPI deployment and translated technical proof into prioritized, business-readable findings.

### Skills Learned
- Enumerated directories and fingerprinted the application stack.
- Manipulated object identifiers to test ownership enforcement.
- Changed a JWT algorithm to none and removed the signature to test verification.
- Sent 50+ invalid login attempts to evaluate throttling and lockout.
- Tested SQL and MongoDB-style payloads and reviewed responses for sensitive disclosure.
- Consolidated duplicate observations into eight unique prioritized findings.

### Tools Used
- Burp Suite
- Gobuster
- Wappalyzer
- JWT tooling
- Postman
- Docker
- manual API testing

## Steps

*Ref 1: Using gobuster to enumerate target 127.0.0.1:9000 the directory with http code 200k are part of the domain. Example: 127.0.0.1:9000/health.*

<img src="assets/step-01.png" width="805" height="482" alt="Using gobuster to enumerate target 127.0.0.1:9000 the directory with http code 200k are part of the domain. Example: 127.0.0.1:9000/health.">

*Ref 2: Wappalyzer shows the technologies used to build the crAPI web application.*

<img src="assets/step-02.png" width="711" height="463" alt="Wappalyzer shows the technologies used to build the crAPI web application.">

*Ref 3: Vulnerabilities: By changing the user id value from 8 to 3. I am able to access other users data.*

<img src="assets/step-03.png" width="795" height="400" alt="Vulnerabilities: By changing the user id value from 8 to 3. I am able to access other users data.">

*Ref 4: After login a JWT token is provided by the server.*

<img src="assets/step-04.png" width="799" height="519" alt="After login a JWT token is provided by the server.">

*Ref 5: After login a JWT token is provided by the server.*

<img src="assets/step-05.png" width="711" height="463" alt="After login a JWT token is provided by the server.">

*Ref 6: the encryption is changed to none and the signature is removed.*

<img src="assets/step-06.png" width="711" height="463" alt="the encryption is changed to none and the signature is removed.">

*Ref 7: The server responds to the modified JWT token. Vulnerabilities: The server does not verify the JWT tokens therefore when the token is modified the server does not detect this action.*

<img src="assets/step-07.png" width="711" height="463" alt="The server responds to the modified JWT token. Vulnerabilities: The server does not verify the JWT tokens therefore when the token is modified the server does not detect this action.">

*Ref 8: bruteforcing the password field using a wordlist and burpsuite intruder*

<img src="assets/step-08.png" width="711" height="463" alt="bruteforcing the password field using a wordlist and burpsuite intruder">

*Ref 9: The server responds to 50 wrong passwords without account lock out. vulnerabilities:*

<img src="assets/step-09.png" width="682" height="444" alt="The server responds to 50 wrong passwords without account lock out. vulnerabilities:">

*Ref 10: Vulnerabilities:*

<img src="assets/step-10.png" width="711" height="463" alt="Vulnerabilities:">

*Ref 11: The api endpoint /community/api/v2/community/posts is vulnerable to sql injections.*

<img src="assets/step-11.png" width="711" height="463" alt="The api endpoint /community/api/v2/community/posts is vulnerable to sql injections.">

*Ref 12: The sql payload on the ‘content’ field responds with the same payload input from the user which means there is no input sanitization.*

<img src="assets/step-12.png" width="711" height="463" alt="The sql payload on the ‘content’ field responds with the same payload input from the user which means there is no input sanitization.">

*Ref 13: NO SQL INJECTION*

<img src="assets/step-13.png" width="711" height="323" alt="NO SQL INJECTION">

*Ref 14: vulnerability:*

<img src="assets/step-14.png" width="711" height="332" alt="vulnerability:">

*Ref 15: When the password field is fuzzed using sql payloads, the server returns a message that has excessive information disclosure*

<img src="assets/step-15.png" width="711" height="463" alt="When the password field is fuzzed using sql payloads, the server returns a message that has excessive information disclosure">

*Ref 16: http://127.0.0.1:8888/.env exposes the database configuration.*

<img src="assets/step-16.png" width="711" height="463" alt="http://127.0.0.1:8888/.env exposes the database configuration.">

*Ref 17: vulnerabilities:*

<img src="assets/step-17.png" width="711" height="339" alt="vulnerabilities:">

*Ref 18: 4*

<img src="assets/step-18.png" width="711" height="351" alt="4">

*Ref 19: vulnerabilities*

<img src="assets/step-19.png" width="711" height="333" alt="vulnerabilities">

*Ref 20: Vulnerability:*

<img src="assets/step-20.png" width="711" height="344" alt="Vulnerability:">
