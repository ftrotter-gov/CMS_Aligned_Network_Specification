# A blanket ticket: every match disclosed

*Worked example for [the record location and data access write-up](../authorizing-access.md). If Maria chooses every site (or the deployment does in-app selection), the token response carries a single ticket with no data_holder_filter, and endpoint hints for every match. The app learns every care relationship; this is the disclosure that service-side selection avoids.*

**Blanket ticket: no data_holder_filter** (compact JWS, really signed):

```
eyJhbGciOiJFUzI1NiIsImtpZCI6IjZrTjAzRlF0ZEUwNzdIMi1MblpIRnhQdEdQdWZFdzd5TXZ1RFZneldJcjQiLCJ0eXAiOiJKV1QifQ.eyJ0aWNrZXRfdHlwZSI6InBhdGllbnQtc2VsZi1hY2Nlc3MtdjEiLCJzdWJqZWN0Ijp7InBhdGllbnQiOnsibmFtZSI6W3siZmFtaWx5IjoiTG9wZXoiLCJnaXZlbiI6WyJNYXJpYSJdfV0sImJpcnRoRGF0ZSI6IjE5NjItMDMtMTUifX0sInN1YmplY3RfaWRlbnRpdHlfZXZpZGVuY2UiOiJleUpoYkdjaU9pSlNVekkxTmlJc0ltdHBaQ0k2SW5KWWFrazVTbVJLVUV0NVpVUlVSbmt6UzBoRlJuQldRMU5UTTNOSlRFZHZabmRpZVdzd1gyNUtjVEFpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBaR1Z1ZEdsMGVWOWhjM04xY21GdVkyVmZiR1YyWld3aU9qSXNJbUYxZEdoZmRHbHRaU0k2TVRjNE1UZ3hOekkxTXl3aVoybDJaVzVmYm1GdFpTSTZJazFoY21saElpd2labUZ0YVd4NVgyNWhiV1VpT2lKTWIzQmxlaUlzSW1KcGNuUm9aR0YwWlNJNklqRTVOakl0TURNdE1UVWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzVwWkM1dFpTOXZhV1JqSWl3aWMzVmlJam9pTVRsbE9HSTJZakV0T1RVME9TMDBNakptTFRsak5qY3RZak0xWlRFME0yWTJOelF6SWl3aVlYVmtJam9pYUhSMGNITTZMeTlwYzNOMVpYSXVZbVYwWVMxbGVHTm9ZVzVuWlM1bGVHRnRjR3hsSWl3aWFXRjBJam94TnpneE9ERTNNalV6TENKbGVIQWlPakUzT0RFNE1UYzFOVE1zSW1wMGFTSTZJalkyWWpJMlpETXlMV014WlRZdE5HSmhNUzA1T0RWakxUazJZamN5TVdJeE0yRXlNaUo5LlpXQVEyLUl5M2F6TXM4c0tIUmIyTlJhUG1LUUY5RzFoNWhSb0J0M2dGUU5DQS1nRGJVdkctejlVZXR3M3RqZkNsZmd0b0FCd2NwMTI0aVEtbjhtQ0YxaW1TUjZkZEZIZ0RYT0U0X0VSdWh5TTlRcGdTZFJiMW1EelVyUU1ycXFLSkNueEdpaDliMy1NOGJQWXoxV1dkc2FnNW95cmpmWVNDR3YyVWJXS0swcW1EMkhQNXh6a0lZcEEyVDF6TFRnRHoxTDhpU05BOTVZVzhmRTMySFdKRFBQV2xqelY4VzlOd1ItUU9ORHNRc1BRaUZaQ3RXVmFhNTI5NGFLQ1BDSWlqWVNmR1pkWVVnV1VPcGlrSG1RQ2pPTUxSdEM0b0VIQzBJN3dQckZrZjRpcnA0LTFyblA3RlFjdG53dTF0VFVrN2pPVXAyYXJIbmZCNDM3dk5oM0JqdyIsInByZXNlbnRlcl9iaW5kaW5nIjp7ImprdCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9ENk1Ib1c1NU91SWNsWm5kOVZWYWsifSwiYWNjZXNzIjp7InBlcm1pc3Npb25zIjpbeyJyZXNvdXJjZV90eXBlIjoiT2JzZXJ2YXRpb24iLCJpbnRlcmFjdGlvbnMiOlsicmVhZCIsInNlYXJjaCJdfV19LCJpc3MiOiJodHRwczovL2lzc3Vlci5iZXRhLWV4Y2hhbmdlLmV4YW1wbGUiLCJhdWQiOiJodHRwczovL2JldGEtZXhjaGFuZ2UuZXhhbXBsZS9kYXRhLWhvbGRlcnMiLCJpYXQiOjE3ODE4MTcyODMsImV4cCI6MTc4MTgyMDg4MywianRpIjoiYzg3ZGIzNjYtYzQwZC00MTExLWEyZjItYjMzNWRjYTVmMzU5In0.4ZQV4r9yoat_Z0kT5DP1d0sFwovo1r7RKhKIts9Avr65ITQsfau4j527fPLURr8q3vBvJjie7CQhqPIAyRjEIA
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
    ]
  },
  "iss": "https://issuer.beta-exchange.example",
  "aud": "https://beta-exchange.example/data-holders",
  "iat": 1781817283,
  "exp": 1781820883,
  "jti": "c87db366-c40d-4111-a2f2-b335dca5f359"
}
```

---

**Endpoint hints accompanying it: every match, all pointing at ticket 0**

```http
HTTP/1.1 200 OK (excerpt)
```

```json
{
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
        0
      ]
    },
    {
      "fhir_base_url": "https://fhir.generalhospital.example/r4",
      "organization": {
        "resourceType": "Organization",
        "name": "General Hospital"
      },
      "ticket_indices": [
        0
      ]
    }
  ]
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*