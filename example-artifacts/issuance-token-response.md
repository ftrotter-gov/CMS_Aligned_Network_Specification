# The authorization step's token response

*Worked example for [the record location and data access write-up](../authorizing-access.md). What BP Buddy receives when Maria finishes the authorization step at the shared authorization service: a standard SMART token response extended with per-site permission tickets and endpoint hints. Maria chose two sites; sites she left out appear nowhere.*

**Token response — authorization code exchanged at the service's token endpoint**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "access_token": "_QA0h8zTIBKZpObvRhjqBnRpQyKKClYW",
  "token_type": "Bearer",
  "expires_in": 300,
  "refresh_token": "lKAsSuvOlYs4uZ1xLzee15mm8gV0kF_2",
  "scope": "permission_ticket patient/Observation.rs offline_access",
  "smart_permission_ticket": [
    "eyJhbGciOiJFUzI1NiIsImtpZCI6IjZrTjAzRlF0ZEUwNzdIMi... (ticket 0, decoded below)",
    "eyJhbGciOiJFUzI1NiIsImtpZCI6IjZrTjAzRlF0ZEUwNzdIMi... (ticket 1, decoded below)"
  ],
  "smart_permission_ticket_endpoints": [
    {
      "fhir_base_url": "https://lakeside.example/fhir",
      "organization": {
        "resourceType": "Organization",
        "name": "Lakeside Clinic"
      },
      "ticket_indices": [
        0
      ]
    },
    {
      "fhir_base_url": "https://fhir.countyhealth.example/r4",
      "organization": {
        "resourceType": "Organization",
        "name": "County Health"
      },
      "ticket_indices": [
        1
      ]
    }
  ]
}
```

---

**Ticket 0 — scoped to Lakeside Clinic** (compact JWS, really signed):

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

---

**Ticket 1 — scoped to County Health** (compact JWS, really signed):

```
eyJhbGciOiJFUzI1NiIsImtpZCI6IjZrTjAzRlF0ZEUwNzdIMi1MblpIRnhQdEdQdWZFdzd5TXZ1RFZneldJcjQiLCJ0eXAiOiJKV1QifQ.eyJ0aWNrZXRfdHlwZSI6InBhdGllbnQtc2VsZi1hY2Nlc3MtdjEiLCJzdWJqZWN0Ijp7InBhdGllbnQiOnsibmFtZSI6W3siZmFtaWx5IjoiTG9wZXoiLCJnaXZlbiI6WyJNYXJpYSJdfV0sImJpcnRoRGF0ZSI6IjE5NjItMDMtMTUifX0sInN1YmplY3RfaWRlbnRpdHlfZXZpZGVuY2UiOiJleUpoYkdjaU9pSlNVekkxTmlJc0ltdHBaQ0k2SW5KWWFrazVTbVJLVUV0NVpVUlVSbmt6UzBoRlJuQldRMU5UTTNOSlRFZHZabmRpZVdzd1gyNUtjVEFpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBaR1Z1ZEdsMGVWOWhjM04xY21GdVkyVmZiR1YyWld3aU9qSXNJbUYxZEdoZmRHbHRaU0k2TVRjNE1UZ3hOekkxTXl3aVoybDJaVzVmYm1GdFpTSTZJazFoY21saElpd2labUZ0YVd4NVgyNWhiV1VpT2lKTWIzQmxlaUlzSW1KcGNuUm9aR0YwWlNJNklqRTVOakl0TURNdE1UVWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzVwWkM1dFpTOXZhV1JqSWl3aWMzVmlJam9pTVRsbE9HSTJZakV0T1RVME9TMDBNakptTFRsak5qY3RZak0xWlRFME0yWTJOelF6SWl3aVlYVmtJam9pYUhSMGNITTZMeTlwYzNOMVpYSXVZbVYwWVMxbGVHTm9ZVzVuWlM1bGVHRnRjR3hsSWl3aWFXRjBJam94TnpneE9ERTNNalV6TENKbGVIQWlPakUzT0RFNE1UYzFOVE1zSW1wMGFTSTZJalkyWWpJMlpETXlMV014WlRZdE5HSmhNUzA1T0RWakxUazJZamN5TVdJeE0yRXlNaUo5LlpXQVEyLUl5M2F6TXM4c0tIUmIyTlJhUG1LUUY5RzFoNWhSb0J0M2dGUU5DQS1nRGJVdkctejlVZXR3M3RqZkNsZmd0b0FCd2NwMTI0aVEtbjhtQ0YxaW1TUjZkZEZIZ0RYT0U0X0VSdWh5TTlRcGdTZFJiMW1EelVyUU1ycXFLSkNueEdpaDliMy1NOGJQWXoxV1dkc2FnNW95cmpmWVNDR3YyVWJXS0swcW1EMkhQNXh6a0lZcEEyVDF6TFRnRHoxTDhpU05BOTVZVzhmRTMySFdKRFBQV2xqelY4VzlOd1ItUU9ORHNRc1BRaUZaQ3RXVmFhNTI5NGFLQ1BDSWlqWVNmR1pkWVVnV1VPcGlrSG1RQ2pPTUxSdEM0b0VIQzBJN3dQckZrZjRpcnA0LTFyblA3RlFjdG53dTF0VFVrN2pPVXAyYXJIbmZCNDM3dk5oM0JqdyIsInByZXNlbnRlcl9iaW5kaW5nIjp7ImprdCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9ENk1Ib1c1NU91SWNsWm5kOVZWYWsifSwiYWNjZXNzIjp7InBlcm1pc3Npb25zIjpbeyJyZXNvdXJjZV90eXBlIjoiT2JzZXJ2YXRpb24iLCJpbnRlcmFjdGlvbnMiOlsicmVhZCIsInNlYXJjaCJdfV0sImRhdGFfaG9sZGVyX2ZpbHRlciI6W3sib3JnYW5pemF0aW9uIjoiQ291bnR5IEhlYWx0aCJ9XX0sImlzcyI6Imh0dHBzOi8vaXNzdWVyLmJldGEtZXhjaGFuZ2UuZXhhbXBsZSIsImF1ZCI6Imh0dHBzOi8vZmhpci5jb3VudHloZWFsdGguZXhhbXBsZS9yNCIsImlhdCI6MTc4MTgxNzI4MywiZXhwIjoxNzgxODIwODgzLCJqdGkiOiJlNzEyMWU1ZS0yMTgwLTQ5MDctYmQzNy03MzQ5NDEzZDZkZDYifQ.Fev7QYomIfP5OcmqXx7JmNpEdXjyHGJU0PHwzZzhcXMG_H0ZaTnWXBRuwBybOH832w43-1aKm_SZhWjJ9PWeJw
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
        "organization": "County Health"
      }
    ]
  },
  "iss": "https://issuer.beta-exchange.example",
  "aud": "https://fhir.countyhealth.example/r4",
  "iat": 1781817283,
  "exp": 1781820883,
  "jti": "e7121e5e-2180-4907-bd37-7349413d6dd6"
}
```

---

**Renewing tickets later: the refresh_token re-mints them without re-running the authorization step**

```http
POST https://issuer.beta-exchange.example/token HTTP/1.1
Content-Type: application/x-www-form-urlencoded
```

```json
{
  "grant_type": "refresh_token",
  "refresh_token": "(value from the response above)",
  "client_id": "sas-bp-buddy-3f81"
}
```

---

The refresh response has the same shape as the original: a fresh smart_permission_ticket array for the same site selection, with new expirations.

---

If Maria instead chooses every site in the network (the alternative where the app sees every match), the response carries one blanket ticket with no data_holder_filter and endpoint hints for every match: see [blanket-ticket](blanket-ticket.md). Redeeming a per-site ticket at a data holder is shown in [permission-ticket](permission-ticket.md).

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*