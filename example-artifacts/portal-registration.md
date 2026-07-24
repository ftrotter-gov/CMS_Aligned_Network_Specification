# Registration through a developer portal

*Worked example for [the record location and data access write-up](../authorizing-access.md). Most of this flow is a human in a browser, so the artifacts are the two machine-verifiable pieces: the statement link the developer pastes, and a key-possession proof the portal can ask for.*

**What the developer pastes into the portal form:**

```
https://library.medicare.gov/app-library/apps/bp-buddy/software-statement.jwt
```

The portal fetches it, verifies the CMS signature against CMS's published JWKS, checks `library_status: active`, and pre-fills app name, URIs, and contacts from the payload (see [software-statement](software-statement.md)).

---

One way Alpha can verify key possession during signup is a short-lived JWT the developer's tooling produces, verifiable against the app's CMS-verified `jwks_uri`:

**key-possession proof** (compact JWS, really signed):

```
eyJhbGciOiJSUzM4NCIsImtpZCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9ENk1Ib1c1NU91SWNsWm5kOVZWYWsiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xpYnJhcnkubWVkaWNhcmUuZ292L2FwcC1saWJyYXJ5L2FwcHMvYnAtYnVkZHkiLCJzdWIiOiJodHRwczovL2xpYnJhcnkubWVkaWNhcmUuZ292L2FwcC1saWJyYXJ5L2FwcHMvYnAtYnVkZHkiLCJhdWQiOiJodHRwczovL2RldmVsb3BlcnMuYWxwaGEtaGVhbHRoLmV4YW1wbGUiLCJpYXQiOjE3ODE4MTcyODMsImV4cCI6MTc4MTgxNzU4MywianRpIjoiNjQwZTAyYjMtMDg2ZS00ZjM5LWFlOWQtNWJhMDBlNDEyMDM0In0.YyshXuSfkeY4hJ7J5RqMyAYO_t8ouZ2gMEOJs-Ectaw-tuESraE_IXXl5rAu1I-Q6Oe294Gyv9EIEMPSnF2meftaV7KSVvb03mILRNeq-1CyE_CqcVxCcAZiwTISxjvbFZk28irg7p_hwg6wUA3MVzpU0NBTem7FkrSvJUwD83HBTZPDPW9xB879oGOsq7_MAUEAzEKnvfxcFeYwJLXwkg62s63gbZ162hP9DYxW2a_r-Y21l6fxdVcEfWPyxjEkCsiYa3VW_zv_Qq50MXZLTZrTB8simv544s-tHVilBwiKZIbwlbx2K5scH_RUBwBgJBlC-FyFUZUpa1nn28Stkw
```

Decoded header:

```json
{
  "alg": "RS384",
  "kid": "DqjGhv7fOA5G2r_bFNQKJOD6MHoW55OuIclZnd9VVak",
  "typ": "JWT"
}
```

Decoded payload:

```json
{
  "iss": "https://library.medicare.gov/app-library/apps/bp-buddy",
  "sub": "https://library.medicare.gov/app-library/apps/bp-buddy",
  "aud": "https://developers.alpha-health.example",
  "iat": 1781817283,
  "exp": 1781817583,
  "jti": "640e02b3-086e-4f39-ae9d-5ba00e412034"
}
```

---

**Portal provisions the registration — the developer sees**

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "client_id": "alpha-net-bp-buddy-7c31",
  "grant_types": [
    "client_credentials"
  ],
  "token_endpoint": "https://auth.alpha-health.example/v1/token",
  "note": "Valid at every Alpha data holder; no further registrations on this network."
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*