# The app signs Maria in at the CSP

*Worked example for [the record location and data access write-up](../authorizing-access.md). BP Buddy is the CSP's relying party. The id_token it receives carries the app's canonical Library identifier as its audience, which is what lets any later verifier resolve the token to this app.*

**Authorize request (browser redirect to the CSP)**

```http
GET https://api.id.me/oidc/authorize?response_type=code HTTP/1.1
  &client_id=https%3A%2F%2Flibrary.medicare.gov%2Fapp-library%2Fapps%2Fbp-buddy
  &redirect_uri=https://bpbuddy.example/csp/callback
  &scope=openid+profile
  &state=af0X9 &nonce=n-7qL2
```

---

**Token response after the code exchange**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "access_token": "hC8hybQhEpeekRJzJ222LZXxLdqh4gNB",
  "token_type": "Bearer",
  "expires_in": 300,
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6InJYakk5SmRKUEt5ZURURn... (decoded below)"
}
```

---

**id_token: aud is the app's Library software_id** (compact JWS, really signed):

```
eyJhbGciOiJSUzI1NiIsImtpZCI6InJYakk5SmRKUEt5ZURURnkzS0hFRnBWQ1NTM3NJTEdvZndieWswX25KcTAiLCJ0eXAiOiJKV1QifQ.eyJpZGVudGl0eV9hc3N1cmFuY2VfbGV2ZWwiOjIsImF1dGhfdGltZSI6MTc4MTgxNzIyMywiZ2l2ZW5fbmFtZSI6Ik1hcmlhIiwiZmFtaWx5X25hbWUiOiJMb3BleiIsImJpcnRoZGF0ZSI6IjE5NjItMDMtMTUiLCJhZGRyZXNzIjp7InN0cmVldF9hZGRyZXNzIjoiNDE4IEFsZGVyIENvdXJ0IiwibG9jYWxpdHkiOiJSaXZlcnNpZGUiLCJyZWdpb24iOiJDQSIsInBvc3RhbF9jb2RlIjoiOTI1MDEiLCJjb3VudHJ5IjoiVVMifSwic3NuX2l0aW5fc2hvcnQiOiI0MzIxIiwiaXNzIjoiaHR0cHM6Ly9hcGkuaWQubWUvb2lkYyIsInN1YiI6IjJkMDQwNzAwLTU4MmMtNGMyMy1hNzAxLWMwMDc2N2VmYWM3YiIsImF1ZCI6Imh0dHBzOi8vbGlicmFyeS5tZWRpY2FyZS5nb3YvYXBwLWxpYnJhcnkvYXBwcy9icC1idWRkeSIsImlhdCI6MTc4MTgxNzIyMywiZXhwIjoxNzgxODE3NTIzLCJqdGkiOiJhMGYxMmI0MC1hMGQwLTRkMWQtYjgxOS04MDM4NTljM2IxMDgifQ.RSfep-XtA0oALxDGQDorB3baD9wlahItdRUNGRtAFBc29yFu8iPk51TCqLpdcRI3olwdbbS3ol0IFx60ZJ9ls7SCgFjSqs7xdkn4eZ-lwKxvKSHPZa3tzJLaaLyn9GBDrzdT4_ahXPQSPo1WKGnIbMGg1UOBl1aMROxiOBod-IdWl-KqLyFC4rWieWRpG4Pyrl6KDI7YCg8r85AhTynoO_7NNj4BpOH9P3fmNKL36DUJyiE5Ds8JWz9tb6VgicztUtdyoSTz3RajCp6j1-Ze8SQBNWw9QxWfPD6IJyV5VxgZhJLDOc7vv4IOteebvJ04lXWYA6C8LK7ZcRLMKnsWqw
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
  "auth_time": 1781817223,
  "given_name": "Maria",
  "family_name": "Lopez",
  "birthdate": "1962-03-15",
  "address": {
    "street_address": "418 Alder Court",
    "locality": "Riverside",
    "region": "CA",
    "postal_code": "92501",
    "country": "US"
  },
  "ssn_itin_short": "4321",
  "iss": "https://api.id.me/oidc",
  "sub": "2d040700-582c-4c23-a701-c00767efac7b",
  "aud": "https://library.medicare.gov/app-library/apps/bp-buddy",
  "iat": 1781817223,
  "exp": 1781817523,
  "jti": "a0f12b40-a0d0-4d1d-b819-803859c3b108"
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*