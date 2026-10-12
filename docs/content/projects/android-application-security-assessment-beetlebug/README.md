# Android Application Security Assessment: Beetlebug

## Objective
Performed a controlled Android application assessment using static analysis, ADB-driven dynamic testing, storage inspection, and backend validation to identify eight security weaknesses.

### Skills Learned
- Mapped application resources, exported activities, embedded values, and backend URLs.
- Pulled SQLite and Shared Preferences artifacts and verified plaintext sensitive data.
- Monitored Logcat for credit-card and PII leakage.
- Validated SQL injection, public Firebase access, and unauthenticated administrator activity invocation.
- Assigned risk ratings and paired every finding with actionable remediation.

### Tools Used
- JADX
- ADB
- Logcat
- SQLite Browser
- curl
- jq
- Android emulator

## Findings Summary
Built only from the observations documented in the Steps below. TODO (author): add the risk ratings and remediation referenced in the objective.

| ID | Issue | OWASP category | Severity | Fix | Evidence |
|---|---|---|---|---|---|
| BB-01 | Folder-unlock PIN hardcoded in `strings.xml` | OWASP Mobile M1:2024 Improper Credential Usage | TBD by author | TBD by author | Refs 1-3 |
| BB-02 | Promo code hardcoded and discount enforced client-side | OWASP Mobile M7:2024 Insufficient Binary Protections | TBD by author | TBD by author | Refs 4-5 |
| BB-03 | Username, password and flag stored in plaintext Shared Preferences | OWASP Mobile M9:2024 Insecure Data Storage | TBD by author | TBD by author | Refs 6-7 |
| BB-04 | Master PIN stored as readable text in local SQLite `user.db` | OWASP Mobile M9:2024 Insecure Data Storage | TBD by author | TBD by author | Refs 8-9 |
| BB-05 | SQL injection returns other users' usernames, passwords and card values | OWASP Mobile M4:2024 Insufficient Input/Output Validation | TBD by author | TBD by author | Ref 10 |
| BB-06 | Firebase Realtime Database readable without authentication | OWASP Mobile M8:2024 Security Misconfiguration | TBD by author | TBD by author | Refs 11-14 |
| BB-07 | Card number and flag written to Logcat | OWASP Mobile M6:2024 Inadequate Privacy Controls | TBD by author | TBD by author | Refs 15-16 |
| BB-08 | Exported `b33tleAdministrator` activity opens the admin dashboard without authentication | OWASP Mobile M3:2024 Insecure Authentication/Authorization | TBD by author | TBD by author | Refs 17-18 |

## Steps

*Ref 1: Static analysis in JADX shows the folder-unlock PIN being compared against a resource string instead of a value generated or protected at runtime.*

<img src="assets/step-01.png" width="651" height="380" alt="Static analysis in JADX shows the folder-unlock PIN being compared against a resource string instead of a value generated or protected at runtime.">

*Ref 2: The referenced value in `strings.xml` exposes the hardcoded unlock PIN, allowing the secret to be recovered directly from the decompiled APK.*

<img src="assets/step-02.png" width="602" height="299" alt="The referenced value in strings.xml exposes the hardcoded unlock PIN, allowing the secret to be recovered directly from the decompiled APK.">

*Ref 3: Entering the recovered PIN unlocks the protected folder and confirms that an embedded client-side secret can be used to complete the challenge.*

<img src="assets/step-03.png" width="602" height="443" alt="Entering the recovered PIN unlocks the protected folder and confirms that an embedded client-side secret can be used to complete the challenge.">

*Ref 4: The promo-code activity contains a hardcoded discount value, making the code recoverable through reverse engineering.*

<img src="assets/step-04.png" width="602" height="390" alt="The promo-code activity contains a hardcoded discount value, making the code recoverable through reverse engineering.">

*Ref 5: Submitting the recovered promo code applies the discount in the application, demonstrating that the promotion logic is enforced on the client and can be abused repeatedly.*

<img src="assets/step-05.png" width="602" height="556" alt="Submitting the recovered promo code applies the discount in the application, demonstrating that the promotion logic is enforced on the client and can be abused repeatedly.">

*Ref 6: Pulling `shared_pref_flag.xml` with ADB reveals that the application stores the submitted username, password, and flag value in plaintext Shared Preferences.*

<img src="assets/step-06.png" width="561" height="367" alt="Pulling shared_pref_flag.xml with ADB reveals that the application stores the submitted username, password, and flag value in plaintext Shared Preferences.">

*Ref 7: The Shared Preferences challenge screen shows the same credentials entered in the app, linking the plaintext XML artifact back to user-controlled input.*

<img src="assets/step-07.png" width="602" height="332" alt="The Shared Preferences challenge screen shows the same credentials entered in the app, linking the plaintext XML artifact back to user-controlled input.">

*Ref 8: ADB is used to pull `user.db` from the application data directory, showing that the local SQLite database is accessible for offline inspection on a test device.*

<img src="assets/step-08.png" width="602" height="269" alt="ADB is used to pull user.db from the application data directory, showing that the local SQLite database is accessible for offline inspection on a test device.">

*Ref 9: After pulling `user.db`, DB Browser for SQLite shows the master PIN stored as readable text in the `users` table.*

<img src="assets/step-09.png" width="602" height="309" alt="After pulling user.db, DB Browser for SQLite shows the master PIN stored as readable text in the users table.">

*Ref 10: A basic SQL injection payload bypasses the intended lookup and returns multiple users, including usernames, passwords, and credit-card values.*

<img src="assets/step-10.png" width="602" height="603" alt="A basic SQL injection payload bypasses the intended lookup and returns multiple users, including usernames, passwords, and credit-card values.">

*Ref 11: Reviewing `strings.xml` also exposes the Firebase Realtime Database URL, which provides a direct backend target for access-control testing.*

<img src="assets/step-11.png" width="602" height="299" alt="Reviewing strings.xml also exposes the Firebase Realtime Database URL, which provides a direct backend target for access-control testing.">

*Ref 12: Querying the Firebase `.json` endpoint with `curl` and formatting it with `jq` returns database records without authentication, confirming public read access.*

<img src="assets/step-12.png" width="602" height="265" alt="Querying the Firebase .json endpoint with curl and formatting it with jq returns database records without authentication, confirming public read access.">

*Ref 13: The unauthenticated Firebase response includes the challenge flag and other user-submitted fields, showing the impact of the misconfigured database rules.*

<img src="assets/step-13.png" width="602" height="301" alt="The unauthenticated Firebase response includes the challenge flag and other user-submitted fields, showing the impact of the misconfigured database rules.">

*Ref 14: The Firebase challenge screen explains the expected network call pattern, tying the exposed database URL to the in-app misconfiguration test.*

<img src="assets/step-14.png" width="602" height="534" alt="The Firebase challenge screen explains the expected network call pattern, tying the exposed database URL to the in-app misconfiguration test.">

*Ref 15: The card number, expiry date, and CVV entered into the payment form are sensitive values that should not be persisted or emitted in application logs.*

<img src="assets/step-15.png" width="602" height="574" alt="The card number, expiry date, and CVV entered into the payment form are sensitive values that should not be persisted or emitted in application logs.">

*Ref 16: Inspecting Logcat after submitting the payment form shows the card number and flag printed by the app, confirming sensitive-data leakage through logs.*

<img src="assets/step-16.png" width="602" height="442" alt="Inspecting Logcat after submitting the payment form shows the card number and flag printed by the app, confirming sensitive-data leakage through logs.">

*Ref 17: The Android manifest exposes `app.beetlebug.ctf.b33tleAdministrator`, allowing the admin activity to be launched from outside the normal app flow.*

<img src="assets/step-17.png" width="602" height="432" alt="The Android manifest exposes app.beetlebug.ctf.b33tleAdministrator, allowing the admin activity to be launched from outside the normal app flow.">

*Ref 18: Launching the exported component with `adb shell am start -n app.beetlebug/.ctf.b33tleAdministrator` opens the admin dashboard without authentication.*

<img src="assets/step-18.png" width="602" height="421" alt="Launching the exported component with adb shell am start -n app.beetlebug/.ctf.b33tleAdministrator opens the admin dashboard without authentication.">
