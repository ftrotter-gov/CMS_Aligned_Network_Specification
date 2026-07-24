# A signed permission ticket and its redemption

*Worked example for [the record location and data access write-up](../authorizing-access.md). The patient authorizes once at a shared authorization service via a SMART App Launch code flow; the token response carries per-site tickets like this one plus endpoint hints (see issuance-token-response). The app redeems the ticket at each data holder's token endpoint via RFC 8693; the data holder verifies the ticket, independently verifies the embedded identity evidence, matches the patient locally, and issues its own token with the matched id.*

**Permission ticket — note subject demographics, the embedded IAL2 id_token as subject_identity_evidence, and the presenter binding to the app's key** (compact JWS, really signed):

```
eyJhbGciOiJFUzI1NiIsImtpZCI6IjZrTjAzRlF0ZEUwNzdIMi1MblpIRnhQdEdQdWZFdzd5TXZ1RFZneldJcjQiLCJ0eXAiOiJKV1QifQ.eyJ0aWNrZXRfdHlwZSI6InBhdGllbnQtc2VsZi1hY2Nlc3MtdjEiLCJzdWJqZWN0Ijp7InBhdGllbnQiOnsibmFtZSI6W3siZmFtaWx5IjoiTG9wZXoiLCJnaXZlbiI6WyJNYXJpYSJdfV0sImJpcnRoRGF0ZSI6IjE5NjItMDMtMTUifX0sInN1YmplY3RfaWRlbnRpdHlfZXZpZGVuY2UiOiJleUpoYkdjaU9pSlNVekkxTmlJc0ltdHBaQ0k2SW5KWWFrazVTbVJLVUV0NVpVUlVSbmt6UzBoRlJuQldRMU5UTTNOSlRFZHZabmRpZVdzd1gyNUtjVEFpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBaR1Z1ZEdsMGVWOWhjM04xY21GdVkyVmZiR1YyWld3aU9qSXNJbUYxZEdoZmRHbHRaU0k2TVRjNE1UZ3hOekkxTXl3aVoybDJaVzVmYm1GdFpTSTZJazFoY21saElpd2labUZ0YVd4NVgyNWhiV1VpT2lKTWIzQmxlaUlzSW1KcGNuUm9aR0YwWlNJNklqRTVOakl0TURNdE1UVWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzVwWkM1dFpTOXZhV1JqSWl3aWMzVmlJam9pTVRsbE9HSTJZakV0T1RVME9TMDBNakptTFRsak5qY3RZak0xWlRFME0yWTJOelF6SWl3aVlYVmtJam9pYUhSMGNITTZMeTlwYzNOMVpYSXVZbVYwWVMxbGVHTm9ZVzVuWlM1bGVHRnRjR3hsSWl3aWFXRjBJam94TnpneE9ERTNNalV6TENKbGVIQWlPakUzT0RFNE1UYzFOVE1zSW1wMGFTSTZJalkyWWpJMlpETXlMV014WlRZdE5HSmhNUzA1T0RWakxUazJZamN5TVdJeE0yRXlNaUo5LlpXQVEyLUl5M2F6TXM4c0tIUmIyTlJhUG1LUUY5RzFoNWhSb0J0M2dGUU5DQS1nRGJVdkctejlVZXR3M3RqZkNsZmd0b0FCd2NwMTI0aVEtbjhtQ0YxaW1TUjZkZEZIZ0RYT0U0X0VSdWh5TTlRcGdTZFJiMW1EelVyUU1ycXFLSkNueEdpaDliMy1NOGJQWXoxV1dkc2FnNW95cmpmWVNDR3YyVWJXS0swcW1EMkhQNXh6a0lZcEEyVDF6TFRnRHoxTDhpU05BOTVZVzhmRTMySFdKRFBQV2xqelY4VzlOd1ItUU9ORHNRc1BRaUZaQ3RXVmFhNTI5NGFLQ1BDSWlqWVNmR1pkWVVnV1VPcGlrSG1RQ2pPTUxSdEM0b0VIQzBJN3dQckZrZjRpcnA0LTFyblA3RlFjdG53dTF0VFVrN2pPVXAyYXJIbmZCNDM3dk5oM0JqdyIsInByZXNlbnRlcl9iaW5kaW5nIjp7ImprdCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9ENk1Ib1c1NU91SWNsWm5kOVZWYWsifSwiYWNjZXNzIjp7InBlcm1pc3Npb25zIjpbeyJyZXNvdXJjZV90eXBlIjoiT2JzZXJ2YXRpb24iLCJpbnRlcmFjdGlvbnMiOlsicmVhZCIsInNlYXJjaCJdfV0sImRhdGFfaG9sZGVyX2ZpbHRlciI6W3sib3JnYW5pemF0aW9uIjoiTGFrZXNpZGUgQ2xpbmljIn1dfSwiaXNzIjoiaHR0cHM6Ly9pc3N1ZXIuYmV0YS1leGNoYW5nZS5leGFtcGxlIiwiYXVkIjoiaHR0cHM6Ly9sYWtlc2lkZS5leGFtcGxlL2ZoaXIiLCJpYXQiOjE3ODE4MTcyODMsImV4cCI6MTc4MTgyMDg4MywianRpIjoiOTBkZDk3N2YtYTBiYS00MTc5LWI2MjAtZGZjODRkYmU4YzcxIn0.5GaUcm90rCaKQ7p8qzKcI4vgsRgNpH9_ypk1SSrZAf27nE3dx1mlggqYPL7IgGGyohVabF28xQqTI0iGbPbuoQ
```

Decoded header:

```json
{
  "alg": "ES256",
  "kid": "6kN03FQtdE077H2-LnZHFxPtGPufEw7yMvuDVgzWIr4",
  "typ": "JWT"
}
```

Decoded payload:

```json
{
  "ticket_type": "patient-self-access-v1",
  "subject": {
    "patient": {
      "name": [
        {
          "family": "Lopez",
          "given": [
            "Maria"
          ]
        }
      ],
      "birthDate": "1962-03-15"
    }
  },
  "subject_identity_evidence": "eyJhbGciOiJSUzI1NiIsImtpZCI6InJYakk5SmRKUEt5ZURURnkzS0hFRnBWQ1NTM3NJTEdvZndieWswX25KcTAiLCJ0eXAiOiJKV1QifQ.eyJpZGVudGl0eV9hc3N1cmFuY2VfbGV2ZWwiOjIsImF1dGhfdGltZSI6MTc4MTgxNzI1MywiZ2l2ZW5fbmFtZSI6Ik1hcmlhIiwiZmFtaWx5X25hbWUiOiJMb3BleiIsImJpcnRoZGF0ZSI6IjE5NjItMDMtMTUiLCJpc3MiOiJodHRwczovL2FwaS5pZC5tZS9vaWRjIiwic3ViIjoiMTllOGI2YjEtOTU0OS00MjJmLTljNjctYjM1ZTE0M2Y2NzQzIiwiYXVkIjoiaHR0cHM6Ly9pc3N1ZXIuYmV0YS1leGNoYW5nZS5leGFtcGxlIiwiaWF0IjoxNzgxODE3MjUzLCJleHAiOjE3ODE4MTc1NTMsImp0aSI6IjY2YjI2ZDMyLWMxZTYtNGJhMS05ODVjLTk2YjcyMWIxM2EyMiJ9.ZWAQ2-Iy3azMs8sKHRb2NRaPmKQF9G1h5hRoBt3gFQNCA-gDbUvG-z9Uetw3tjfClfgtoABwcp124iQ-n8mCF1imSR6ddFHgDXOE4_ERuhyM9QpgSdRb1mDzUrQMrqqKJCnxGih9b3-M8bPYz1WWdsag5oyrjfYSCGv2UbWKK0qmD2HP5xzkIYpA2T1zLTgDz1L8iSNA95YW8fE32HWJDPPWljzV8W9NwR-QONDsQsPQiFZCtWVaa5294aKCPCIijYSfGZdYUgWUOpikHmQCjOMLRtC4oEHC0I7wPrFkf4irp4-1rnP7FQctnwu1tTUk7jOUp2arHnfB437vNh3Bjw",
  "presenter_binding": {
    "jkt": "DqjGhv7fOA5G2r_bFNQKJOD6MHoW55OuIclZnd9VVak"
  },
  "access": {
    "permissions": [
      {
        "resource_type": "Observation",
        "interactions": [
          "read",
          "search"
        ]
      }
    ],
    "data_holder_filter": [
      {
        "organization": "Lakeside Clinic"
      }
    ]
  },
  "iss": "https://issuer.beta-exchange.example",
  "aud": "https://lakeside.example/fhir",
  "iat": 1781817283,
  "exp": 1781820883,
  "jti": "90dd977f-a0ba-4179-b620-dfc84dbe8c71"
}
```

The `subject_identity_evidence` is a CSP-signed id_token whose `aud` names the ticket issuer: the issuer ran the CSP sign-in as relying party during the issuance ceremony. The data holder verifies the evidence's signature against the CSP's keys itself (evidence-issuer trust is configured separately from ticket-issuer trust) and resolves the evidence's client identifier to the ticket issuer. `presenter_binding.jkt` is the thumbprint of the app key in [keys-and-trust-anchors](keys-and-trust-anchors.md).

---

**Redemption — RFC 8693 token exchange at the data holder**

```http
POST https://lakeside.example/oauth/token HTTP/1.1
Host: lakeside.example
Content-Type: application/x-www-form-urlencoded
```

```json
{
  "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
  "subject_token_type": "https://smarthealthit.org/token-type/permission-ticket",
  "subject_token": "eyJhbGciOiJFUzI1NiIsImtpZCI6IjZrTjAzRlF0ZEUwNzdIMi1MblpIRnhQ... (full value above)",
  "scope": "patient/Observation.rs",
  "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "client_assertion": "(signed with the key named by presenter_binding.jkt)"
}
```

---

**Token response — the data holder's own token, with its matched patient id**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "access_token": "(bearer token used below)",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "patient/Observation.rs",
  "patient": "lakeside-449210"
}
```

---

**FHIR query with that token**

```http
GET https://lakeside.example/fhir/Observation?patient=lakeside-449210&category=vital-signs&_count=1 HTTP/1.1
Authorization: Bearer (token from above)
Accept: application/fhir+json
```

---

**FHIR response**

```http
HTTP/1.1 200 OK
Content-Type: application/fhir+json
```

```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "status": "final",
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "85354-9",
              "display": "Blood pressure panel"
            }
          ]
        },
        "subject": {
          "reference": "Patient/lakeside-449210"
        },
        "effectiveDateTime": "2026-06-02T14:10:00Z",
        "component": [
          {
            "code": {
              "coding": [
                {
                  "system": "http://loinc.org",
                  "code": "8480-6"
                }
              ]
            },
            "valueQuantity": {
              "value": 131,
              "unit": "mmHg"
            }
          },
          {
            "code": {
              "coding": [
                {
                  "system": "http://loinc.org",
                  "code": "8462-4"
                }
              ]
            },
            "valueQuantity": {
              "value": 82,
              "unit": "mmHg"
            }
          }
        ]
      }
    }
  ]
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*