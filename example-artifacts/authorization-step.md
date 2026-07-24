# Opening the authorization step

*Worked example for [the record location and data access write-up](../authorizing-access.md). The app exchanges Maria's app-audienced CSP id_token for a SMART launch value, then opens a standard SMART App Launch code flow at the shared authorization service. Once the SMART flow begins, the service decides whether to accept the launch context, perform local step-up, or re-authenticate her at the CSP and receive a fresh id_token audienced to itself.*

**External identity evidence token exchange (back channel)**

```http
POST https://issuer.beta-exchange.example/token HTTP/1.1
Host: issuer.beta-exchange.example
Content-Type: application/x-www-form-urlencoded
```

```text
client_id=sas-bp-buddy-3f81&
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&
client_assertion=eyJhbGciOiJSUzM4NCIsImtpZCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9E...&
grant_type=urn:ietf:params:oauth:grant-type:token-exchange&
subject_token_type=urn:ietf:params:oauth:token-type:id_token&
subject_token=eyJhbGciOiJSUzI1NiIsImtpZCI6InJYakk5SmRKUEt5ZURURnkzS0hFRnBW...&
requested_token_type=urn:smart:params:oauth:token-type:launch&
resource=https%3A%2F%2Fissuer.beta-exchange.example%2Fauthorize
```

---

**Launch value response**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "access_token": "lch_NSbFUQKDaQBs6iqH",
  "issued_token_type": "urn:smart:params:oauth:token-type:launch",
  "token_type": "N_A",
  "expires_in": 300
}
```

---

**The app's authorize request using the launch value (browser redirect)**

```http
GET https://issuer.beta-exchange.example/authorize?response_type=code HTTP/1.1
  &client_id=sas-bp-buddy-3f81
  &redirect_uri=https://bpbuddy.example/callback
  &scope=launch+permission_ticket+patient%2FObservation.rs+offline_access
  &code_challenge=E9Mt... &code_challenge_method=S256 &state=x7Hq
  &launch=lch_NSbFUQKDaQBs6iqH
```

---

**Local step-up option inside the SMART authorization flow**

```http
HTTP/1.1 200 OK
Content-Type: text/html
```

```text
Maria confirms a one-time code sent to a phone number or email address verified in the CSP evidence.
```

---

**CSP re-authentication option inside the SMART authorization flow**

```http
GET https://api.id.me/oidc/authorize?response_type=code&prompt=none HTTP/1.1
  &client_id=https%3A%2F%2Fissuer.beta-exchange.example
  &redirect_uri=https://issuer.beta-exchange.example/csp/callback
  &scope=openid
```

---

**Fresh id_token from the silent re-auth: same person, new auth event, aud is now the service** (compact JWS, really signed):

```
eyJhbGciOiJSUzI1NiIsImtpZCI6InJYakk5SmRKUEt5ZURURnkzS0hFRnBWQ1NTM3NJTEdvZndieWswX25KcTAiLCJ0eXAiOiJKV1QifQ.eyJpZGVudGl0eV9hc3N1cmFuY2VfbGV2ZWwiOjIsImF1dGhfdGltZSI6MTc4MTgxNzI1MywiZ2l2ZW5fbmFtZSI6Ik1hcmlhIiwiZmFtaWx5X25hbWUiOiJMb3BleiIsImJpcnRoZGF0ZSI6IjE5NjItMDMtMTUiLCJpc3MiOiJodHRwczovL2FwaS5pZC5tZS9vaWRjIiwic3ViIjoiMTllOGI2YjEtOTU0OS00MjJmLTljNjctYjM1ZTE0M2Y2NzQzIiwiYXVkIjoiaHR0cHM6Ly9pc3N1ZXIuYmV0YS1leGNoYW5nZS5leGFtcGxlIiwiaWF0IjoxNzgxODE3MjUzLCJleHAiOjE3ODE4MTc1NTMsImp0aSI6IjY2YjI2ZDMyLWMxZTYtNGJhMS05ODVjLTk2YjcyMWIxM2EyMiJ9.ZWAQ2-Iy3azMs8sKHRb2NRaPmKQF9G1h5hRoBt3gFQNCA-gDbUvG-z9Uetw3tjfClfgtoABwcp124iQ-n8mCF1imSR6ddFHgDXOE4_ERuhyM9QpgSdRb1mDzUrQMrqqKJCnxGih9b3-M8bPYz1WWdsag5oyrjfYSCGv2UbWKK0qmD2HP5xzkIYpA2T1zLTgDz1L8iSNA95YW8fE32HWJDPPWljzV8W9NwR-QONDsQsPQiFZCtWVaa5294aKCPCIijYSfGZdYUgWUOpikHmQCjOMLRtC4oEHC0I7wPrFkf4irp4-1rnP7FQctnwu1tTUk7jOUp2arHnfB437vNh3Bjw
```

Decoded header:

```json
{
  "alg": "RS256",
  "kid": "rXjI9JdJPKyeDTFy3KHEFpVCSS3sILGofwbyk0_nJq0",
  "typ": "JWT"
}
```

Decoded payload:

```json
{
  "identity_assurance_level": 2,
  "auth_time": 1781817253,
  "given_name": "Maria",
  "family_name": "Lopez",
  "birthdate": "1962-03-15",
  "iss": "https://api.id.me/oidc",
  "sub": "19e8b6b1-9549-422f-9c67-b35e143f6743",
  "aud": "https://issuer.beta-exchange.example",
  "iat": 1781817253,
  "exp": 1781817553,
  "jti": "66b26d32-c1e6-4ba1-985c-96b721b13a22"
}
```

---

After the launch-based SMART authorization request starts, record location, consent, and permission-ticket issuance proceed the same way no matter which ceremony the service chooses.

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*