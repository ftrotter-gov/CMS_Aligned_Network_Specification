# Dynamic registration with the CMS statement

*Worked example for [the record location and data access write-up](../authorizing-access.md). The same RFC 7591 call repeats at each Beta data holder; one representative exchange is shown, at Lakeside Clinic.*

**Request — RFC 7591 registration**

```http
POST https://lakeside.example/oauth/register HTTP/1.1
Host: lakeside.example
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzM4NCIsImtpZCI6IkRxakdodjdm... (key-possession JWT, same shape as in 2a)
```

```json
{
  "software_statement": "eyJhbGciOiJFUzM4NCIsImtpZCI6Ijd0RmY4di0td1ZSS0FJWFRsZ3Qxc1dF... (full value in software-statement)",
  "grant_types": [
    "client_credentials"
  ],
  "token_endpoint_auth_method": "private_key_jwt"
}
```

---

The data holder verifies the CMS signature, reads `library_status`, confirms key possession against the statement's `jwks_uri`, and checks Beta's approval signal for this app if Beta publishes one.

**Response — 201 Created**

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "client_id": "lakeside-dh-bp-buddy-91af",
  "software_id": "https://library.medicare.gov/app-library/apps/bp-buddy",
  "grant_types": [
    "client_credentials"
  ],
  "token_endpoint_auth_method": "private_key_jwt",
  "jwks_uri": "https://bpbuddy.example/.well-known/jwks.json"
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*