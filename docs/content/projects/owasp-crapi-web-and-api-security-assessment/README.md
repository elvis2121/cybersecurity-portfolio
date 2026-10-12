# OWASP crAPI Web and API Security Assessment

## Objective
Executed a structured security assessment against a local OWASP crAPI deployment and translated technical proof into ten prioritized, business-readable findings.

### Skills Learned
- Enumerated directories and fingerprinted the application stack.
- Manipulated object identifiers to test ownership enforcement.
- Changed a JWT algorithm to none and removed the signature to test verification.
- Sent 50+ invalid login attempts to evaluate throttling and lockout.
- Tested SQL and MongoDB-style payloads and reviewed responses for sensitive disclosure.
- Documented ten distinct prioritized findings (see Findings Summary); earlier drafts referred to eight after consolidation.

### Tools Used
- Burp Suite
- Gobuster
- Wappalyzer
- JWT tooling
- Postman
- Docker
- manual API testing

## Findings Summary
Severities and remediations below were assigned retrospectively from the documented evidence using standard OWASP/CVSS-style judgment (Critical / High / Medium / Low). They were not part of the original lab write-up.

This assessment documents **10** distinct observations (the original objective said "eight unique prioritized findings"; the table below is the full enumerated set from the Steps, without consolidating duplicates).

| ID | Issue | OWASP category | Severity | Fix | Evidence |
|---|---|---|---|---|---|
| CR-01 | Broken object-level authorization: changing user ID 8 to 3 returns another user's data | OWASP API1:2023 BOLA | High | Enforce object-level authorization on every request; bind resource IDs to the authenticated subject and return 403/404 for cross-user access. | Ref 3 |
| CR-02 | Unsigned JWT (`alg: none`, signature removed) accepted by the API | OWASP API2:2023 Broken Authentication | Critical | Reject `alg: none` and unsigned tokens; whitelist allowed algorithms (e.g. RS256/HS256); verify signatures with a server-side key; rotate keys. | Refs 4-7 |
| CR-03 | No account lockout or effective throttling on repeated invalid logins | OWASP API4:2023 Unrestricted Resource Consumption | Medium | Add progressive rate limiting, account lockout or CAPTCHA after repeated failures, and monitor for credential-stuffing patterns. | Refs 8-9 |
| CR-04 | Exposed MailHog message API (`/api/v2/messages`) reveals mailbox data, including a one-time password | OWASP API8:2023 Security Misconfiguration | High | Do not expose mail-catcher APIs outside local/dev; require auth and network restriction; never return OTPs via unauthenticated endpoints. | Refs 10, 20 |
| CR-05 | SQL payload accepted and reflected in community post content (weak input validation) | OWASP A03:2021 Injection | Medium | Validate and encode user content; use parameterized queries server-side; apply output encoding to prevent stored injection/XSS. | Refs 11-12 |
| CR-06 | NoSQL-style `$regex` payload on coupon validation returns a valid coupon | OWASP A03:2021 Injection | High | Treat coupon input as a scalar string; reject operator objects (`$regex`, `$gt`, etc.); use allow-listed coupon lookup. | Refs 13-14 |
| CR-07 | Verbose Spring validation error discloses backend implementation details | OWASP API8:2023 Security Misconfiguration | Low | Return generic client errors in production; log details server-side only; disable stack traces and framework internals on public APIs. | Ref 15 |
| CR-08 | `/.env` on port 8888 exposes environment variables and database configuration | OWASP API8:2023 Security Misconfiguration | Critical | Block access to `.env` and config paths; keep secrets in a vault or environment not served by the web root; rotate any exposed credentials. | Ref 16 |
| CR-09 | Community posts endpoint exposes other users' author details | OWASP API3:2023 Broken Object Property Level Authorization | Medium | Apply response filtering / BOPLA controls so clients only receive fields and records they are authorized to see. | Ref 17 |
| CR-10 | Shop orders are enumerable: `/orders/1` and `/orders/5` return other customers' and admin order/card metadata | OWASP API1:2023 BOLA | Critical | Authorize order access by ownership/role; use non-guessable IDs; never return full payment-card metadata to unauthorized callers. | Refs 18-19 |

## Steps

*Ref 1: Gobuster enumerates the crAPI host on 127.0.0.1:9000 and identifies live paths such as /health returning HTTP 200.*

<img src="assets/step-01.png" width="805" height="482" alt="Gobuster enumerates the crAPI host on 127.0.0.1:9000 and identifies live paths such as /health returning HTTP 200.">

*Ref 2: Wappalyzer fingerprints the crAPI web application and identifies the front-end and supporting technologies exposed in the browser.*

<img src="assets/step-02.png" width="711" height="463" alt="Wappalyzer fingerprints the crAPI web application and identifies the front-end and supporting technologies exposed in the browser.">

*Ref 3: Burp Repeater shows that changing the user identifier from 8 to 3 returns another user's data, demonstrating broken object-level authorization.*

<img src="assets/step-03.png" width="795" height="400" alt="Burp Repeater shows that changing the user identifier from 8 to 3 returns another user's data, demonstrating broken object-level authorization.">

*Ref 4: Burp captures the login response returning access and refresh JWTs for the authenticated session.*

<img src="assets/step-04.png" width="799" height="519" alt="Burp captures the login response returning access and refresh JWTs for the authenticated session.">

*Ref 5: The JWT decoder exposes token header and claim values, including role and account identifiers, before tampering tests.*

<img src="assets/step-05.png" width="711" height="463" alt="The JWT decoder exposes token header and claim values, including role and account identifiers, before tampering tests.">

*Ref 6: The JWT is modified by setting the algorithm to none and removing the signature to test token integrity validation.*

<img src="assets/step-06.png" width="711" height="463" alt="The JWT is modified by setting the algorithm to none and removing the signature to test token integrity validation.">

*Ref 7: Burp Repeater shows the API accepting the unsigned modified JWT and returning a normal response, confirming missing JWT signature verification.*

<img src="assets/step-07.png" width="711" height="463" alt="Burp Repeater shows the API accepting the unsigned modified JWT and returning a normal response, confirming missing JWT signature verification.">

*Ref 8: Burp Intruder is configured to brute-force the login password field with a wordlist against the authentication request.*

<img src="assets/step-08.png" width="711" height="463" alt="Burp Intruder is configured to brute-force the login password field with a wordlist against the authentication request.">

*Ref 9: Intruder results show repeated invalid password attempts returning responses without account lockout or effective throttling.*

<img src="assets/step-09.png" width="682" height="444" alt="Intruder results show repeated invalid password attempts returning responses without account lockout or effective throttling.">

*Ref 10: Burp Site Map captures /api/v2/messages?limit=50 returning JSON mailbox data from MailHog, identifying an exposed message API.*

<img src="assets/step-10.png" width="711" height="463" alt="Burp Site Map captures /api/v2/messages?limit=50 returning JSON mailbox data from MailHog, identifying an exposed message API.">

*Ref 11: A POST to /community/api/v2/community/posts sends a SQL injection payload in the content field and receives HTTP 200.*

<img src="assets/step-11.png" width="711" height="463" alt="A POST to /community/api/v2/community/posts sends a SQL injection payload in the content field and receives HTTP 200.">

*Ref 12: The SQL payload is reflected back in the created post content, showing weak input validation on community post creation.*

<img src="assets/step-12.png" width="711" height="463" alt="The SQL payload is reflected back in the created post content, showing weak input validation on community post creation.">

*Ref 13: A baseline coupon validation request sends a normal coupon_code value before testing NoSQL-style payload handling.*

<img src="assets/step-13.png" width="711" height="323" alt="A baseline coupon validation request sends a normal coupon_code value before testing NoSQL-style payload handling.">

*Ref 14: A NoSQL-style $regex payload against /community/api/v2/coupon/validate-coupon returns a valid coupon, showing improper server-side validation.*

<img src="assets/step-14.png" width="711" height="332" alt="A NoSQL-style $regex payload against /community/api/v2/coupon/validate-coupon returns a valid coupon, showing improper server-side validation.">

*Ref 15: Fuzzing the login password field triggers a verbose Spring validation error that discloses backend implementation details.*

<img src="assets/step-15.png" width="711" height="463" alt="Fuzzing the login password field triggers a verbose Spring validation error that discloses backend implementation details.">

*Ref 16: Accessing http://127.0.0.1:8888/.env exposes environment variables and database configuration values.*

<img src="assets/step-16.png" width="711" height="463" alt="Accessing http://127.0.0.1:8888/.env exposes environment variables and database configuration values.">

*Ref 17: The community posts endpoint returns recent posts and author details for multiple users, exposing data beyond the current user's context.*

<img src="assets/step-17.png" width="711" height="339" alt="The community posts endpoint returns recent posts and author details for multiple users, exposing data beyond the current user's context.">

*Ref 18: Changing the shop order identifier to /workshop/api/shop/orders/1 returns another customer's order and payment metadata, confirming broken object-level authorization.*

<img src="assets/step-18.png" width="711" height="351" alt="Changing the shop order identifier to /workshop/api/shop/orders/1 returns another customer's order and payment metadata, confirming broken object-level authorization.">

*Ref 19: A second order lookup using /workshop/api/shop/orders/5 returns admin-owned order and card metadata, confirming order records are enumerable.*

<img src="assets/step-19.png" width="711" height="333" alt="A second order lookup using /workshop/api/shop/orders/5 returns admin-owned order and card metadata, confirming order records are enumerable.">

*Ref 20: Burp Proxy captures a MailHog message API response containing a one-time password, showing that exposed mail traffic can reveal account recovery codes.*

<img src="assets/step-20.png" width="711" height="344" alt="Burp Proxy captures a MailHog message API response containing a one-time password, showing that exposed mail traffic can reveal account recovery codes.">
