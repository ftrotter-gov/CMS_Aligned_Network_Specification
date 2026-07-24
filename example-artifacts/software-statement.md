# The CMS-signed software statement

*Worked example for [the record location and data access write-up](../authorizing-access.md). CMS re-signs this statement on a short cycle for as long as BP Buddy is active in the Medicare App Library. It is the only credential the app carries into every network.*

**Request — anyone may fetch the current statement**

```http
GET https://library.medicare.gov/app-library/apps/bp-buddy/software-statement.jwt HTTP/1.1
Accept: application/jwt
```

---

**Response** `200 OK`, `Content-Type: application/jwt`

**software_statement** (compact JWS, really signed):

```
eyJhbGciOiJFUzM4NCIsImtpZCI6Ijd0RmY4di0td1ZSS0FJWFRsZ3Qxc1dFc1Q3M2ZCTEdhQkhpZmxlX09oZDgiLCJ0eXAiOiJKV1QifQ.eyJzb2Z0d2FyZV9pZCI6Imh0dHBzOi8vbGlicmFyeS5tZWRpY2FyZS5nb3YvYXBwLWxpYnJhcnkvYXBwcy9icC1idWRkeSIsImNsaWVudF9uYW1lIjoiQlAgQnVkZHkiLCJjbGllbnRfdXJpIjoiaHR0cHM6Ly9icGJ1ZGR5LmV4YW1wbGUiLCJwb2xpY3lfdXJpIjoiaHR0cHM6Ly9icGJ1ZGR5LmV4YW1wbGUvcHJpdmFjeSIsImNvbnRhY3RzIjpbInN1cHBvcnRAYnBidWRkeS5leGFtcGxlIl0sImdyYW50X3R5cGVzIjpbImNsaWVudF9jcmVkZW50aWFscyJdLCJ0b2tlbl9lbmRwb2ludF9hdXRoX21ldGhvZCI6InByaXZhdGVfa2V5X2p3dCIsImp3a3NfdXJpIjoiaHR0cHM6Ly9icGJ1ZGR5LmV4YW1wbGUvLndlbGwta25vd24vandrcy5qc29uIiwiZXh0ZW5zaW9ucyI6eyJjbXNfYXBwIjp7InZlcnNpb24iOiIxIiwibGlicmFyeV9zdGF0dXMiOiJhY3RpdmUiLCJhcHBfY2xhc3MiOiJwYXRpZW50LWFjY2Vzcy1hcHAifX0sImlzcyI6Imh0dHBzOi8vbGlicmFyeS5tZWRpY2FyZS5nb3YiLCJzdWIiOiJodHRwczovL2xpYnJhcnkubWVkaWNhcmUuZ292L2FwcC1saWJyYXJ5L2FwcHMvYnAtYnVkZHkiLCJhdWQiOiJodHRwczovL2ZyYW1ld29yay5jbXMuZ292L2FsaWduZWQtbmV0d29ya3MiLCJpYXQiOjE3ODE4MTcyODMsImV4cCI6MTc4MTkwMzY4MywianRpIjoiMjBhYWI0YWItY2YzYi00ZGQ5LTk1MTgtMzA5YWI2MDM0Zjg4In0.4gth2qzeGGcGafhCMv2Dw4r9DVdhUbK_Clfp0moNtezWCu-1ohTF_NsM_GAQWDURfP9vsms07JKbax5_rCnnp5WMAr4-45MT4xjoLVlgP2vl2VOlx-z_kT_sgMhFvw8x
```

Decoded header:

```json
{
  "alg": "ES384",
  "kid": "7tFf8v--wVRKAIXTlgt1sWEsT73fBLGaBHifle_Ohd8",
  "typ": "JWT"
}
```

Decoded payload:

```json
{
  "software_id": "https://library.medicare.gov/app-library/apps/bp-buddy",
  "client_name": "BP Buddy",
  "client_uri": "https://bpbuddy.example",
  "policy_uri": "https://bpbuddy.example/privacy",
  "contacts": [
    "support@bpbuddy.example"
  ],
  "grant_types": [
    "client_credentials"
  ],
  "token_endpoint_auth_method": "private_key_jwt",
  "jwks_uri": "https://bpbuddy.example/.well-known/jwks.json",
  "extensions": {
    "cms_app": {
      "version": "1",
      "library_status": "active",
      "app_class": "patient-access-app"
    }
  },
  "iss": "https://library.medicare.gov",
  "sub": "https://library.medicare.gov/app-library/apps/bp-buddy",
  "aud": "https://framework.cms.gov/aligned-networks",
  "iat": 1781817283,
  "exp": 1781903683,
  "jti": "20aab4ab-cf3b-4dd9-9518-309ab6034f88"
}
```

---

**The app's published JWKS** at `https://bpbuddy.example/.well-known/jwks.json` (CMS verified control of this URL at admission and monitors it afterward):

```json
{
  "keys": [
    {
      "e": "AQAB",
      "kty": "RSA",
      "n": "8IUeF96GtAhVfT_8qQpSuDd8fXldokJod-YYrOZ_Sp_e4LsfLhBKjLjygx8djH1GpgZb1Ve53yaIYFWy142ucYqLktSCW24Ujy07imEsQc5O5YPi7k1naMs-A-AbYtDpeWyq-Ziy3Etn-ptjkFQ5qgsz99y7TpoLGw0QqoC74Umt_381wz5VDschBGQvdZ3JGekLXSBa3U4FCXjlWrdV0_-HcEtDi8cqk46b4eM1suHjVd_nZn9G617qCEL7XGHKG8mg4ycn3fG1W3PUjeCpybV8-vB4YBbB9F9BMLT_yPT4B6ATrB7SIiBg1Hs_qXmEwEZevr9HOPWFA9CRidUw-w",
      "alg": "RS384",
      "use": "sig",
      "kid": "DqjGhv7fOA5G2r_bFNQKJOD6MHoW55OuIclZnd9VVak"
    }
  ]
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*