# cms_smart at a data holder: token and FHIR retrieval

*Worked example for [the record location and data access write-up](../authorizing-access.md). Same token shape as everywhere else; the only difference from 4a is that the data holder's own authorization server issues the token, and a refresh_token supports the rolling 90-day window of can-spec §9.*

**Token request**

```http
POST https://lakeside.example/oauth/token HTTP/1.1
Host: lakeside.example
Content-Type: application/x-www-form-urlencoded
```

```json
{
  "grant_type": "client_credentials",
  "scope": "patient/Observation.rs patient/MedicationRequest.rs launch/patient",
  "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "client_assertion": "eyJhbGciOiJSUzM4NCIsImtpZCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9E... (decoded below)"
}
```

---

**client_assertion** (compact JWS, really signed):

```
eyJhbGciOiJSUzM4NCIsImtpZCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9ENk1Ib1c1NU91SWNsWm5kOVZWYWsiLCJ0eXAiOiJKV1QifQ.eyJleHRlbnNpb25zIjp7ImNtc19zbWFydCI6eyJ2ZXJzaW9uIjoiMSIsInB1cnBvc2Vfb2ZfdXNlIjoiUEFUUlFUIiwiaWRfdG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0ltdHBaQ0k2SW5KWWFrazVTbVJLVUV0NVpVUlVSbmt6UzBoRlJuQldRMU5UTTNOSlRFZHZabmRpZVdzd1gyNUtjVEFpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBaR1Z1ZEdsMGVWOWhjM04xY21GdVkyVmZiR1YyWld3aU9qSXNJbUYxZEdoZmRHbHRaU0k2TVRjNE1UZ3hOekl5TXl3aVoybDJaVzVmYm1GdFpTSTZJazFoY21saElpd2labUZ0YVd4NVgyNWhiV1VpT2lKTWIzQmxlaUlzSW1KcGNuUm9aR0YwWlNJNklqRTVOakl0TURNdE1UVWlMQ0poWkdSeVpYTnpJanA3SW5OMGNtVmxkRjloWkdSeVpYTnpJam9pTkRFNElFRnNaR1Z5SUVOdmRYSjBJaXdpYkc5allXeHBkSGtpT2lKU2FYWmxjbk5wWkdVaUxDSnlaV2RwYjI0aU9pSkRRU0lzSW5CdmMzUmhiRjlqYjJSbElqb2lPVEkxTURFaUxDSmpiM1Z1ZEhKNUlqb2lWVk1pZlN3aWMzTnVYMmwwYVc1ZmMyaHZjblFpT2lJME16SXhJaXdpYVhOeklqb2lhSFIwY0hNNkx5OWhjR2t1YVdRdWJXVXZiMmxrWXlJc0luTjFZaUk2SWpKa01EUXdOekF3TFRVNE1tTXROR015TXkxaE56QXhMV013TURjMk4yVm1ZV00zWWlJc0ltRjFaQ0k2SW1oMGRIQnpPaTh2YkdsaWNtRnllUzV0WldScFkyRnlaUzVuYjNZdllYQndMV3hwWW5KaGNua3ZZWEJ3Y3k5aWNDMWlkV1JrZVNJc0ltbGhkQ0k2TVRjNE1UZ3hOekl5TXl3aVpYaHdJam94TnpneE9ERTNOVEl6TENKcWRHa2lPaUpoTUdZeE1tSTBNQzFoTUdRd0xUUmtNV1F0WWpneE9TMDRNRE00TlRsak0ySXhNRGdpZlEuUlNmZXAtWHRBMG9BTHhER1FEb3JCM2JhRDl3bGFoSXRkUlVOR1J0QUZCYzI5eUZ1OGlQazUxVENxTHBkY1JJM29sd2RiYlMzb2wwSUZ4NjBaSjlsczdTQ2dGalNxczd4ZGtuNGVaLWx3S3h2S1NIUFphM3R6SkxhYUx5bjlHQkRyemRUNF9haFhQUVNQbzFXS0duSWJNR2cxVU9CbDFhTVJPeGlPQm9kLUlkV2wtS3FMeUZDNHJXaWVXUnBHNFB5cmw2S0RJN1lDZzhyODVBaFR5bm9PXzdOTmo0QnBPSDlQM2ZtTktMMzZEVUp5aUU1RHM4Sld6OXRiNlZnaWN6dFV0ZHlvU1R6M1JhakNwNmoxLVplOFNRQk5XdzlReFdmUEQ2SUp5VjVWeGdaaEpMRE9jN3Z2NElPdGVlYnZKMDRsWFdZQTZDOExLN1pjUkxNS25zV3F3In19LCJpc3MiOiJsYWtlc2lkZS1kaC1icC1idWRkeS05MWFmIiwic3ViIjoibGFrZXNpZGUtZGgtYnAtYnVkZHktOTFhZiIsImF1ZCI6Imh0dHBzOi8vbGFrZXNpZGUuZXhhbXBsZS9vYXV0aC90b2tlbiIsImV4cCI6MTc4MTgxNzU4MywianRpIjoiNDhiMTMyZmItNDJhMC00YjMwLThiM2YtNjYzMzkwYmM2YjIyIn0.XTCMNYS1CO95LlT7yuGTxn9qYqdSU4hvMEackmBfRhumhC7q1lc_D4obgydS6-Yuj-2GqEHRPwqb0qCgEfrfZT3wjS8sl4kV0BP8x7tV4GtBzSGkm7Drw4v8Jnt-JL9wnT0vfg4ktsbrERV564YaXbXQcYRcyBgjh-Ee1OtBDNTrI1yRabMSdQgw6OLIKyVqckQLDueUZZ6nBcDG0uf0f9rTWEW_gqz4WCnlhVSZ0Nl3THWjgo6JglEVI7sAgGlBHL4DcHf7Qsy-ZrSPy3--7TKReRHqYwhRRVPhrfr7mGLhn_xejBu6hT1A-iiFBc3lx7sn6ErguLGgzmgSbJtRww
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
  "extensions": {
    "cms_smart": {
      "version": "1",
      "purpose_of_use": "PATRQT",
      "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6InJYakk5SmRKUEt5ZURURnkzS0hFRnBWQ1NTM3NJTEdvZndieWswX25KcTAiLCJ0eXAiOiJKV1QifQ.eyJpZGVudGl0eV9hc3N1cmFuY2VfbGV2ZWwiOjIsImF1dGhfdGltZSI6MTc4MTgxNzIyMywiZ2l2ZW5fbmFtZSI6Ik1hcmlhIiwiZmFtaWx5X25hbWUiOiJMb3BleiIsImJpcnRoZGF0ZSI6IjE5NjItMDMtMTUiLCJhZGRyZXNzIjp7InN0cmVldF9hZGRyZXNzIjoiNDE4IEFsZGVyIENvdXJ0IiwibG9jYWxpdHkiOiJSaXZlcnNpZGUiLCJyZWdpb24iOiJDQSIsInBvc3RhbF9jb2RlIjoiOTI1MDEiLCJjb3VudHJ5IjoiVVMifSwic3NuX2l0aW5fc2hvcnQiOiI0MzIxIiwiaXNzIjoiaHR0cHM6Ly9hcGkuaWQubWUvb2lkYyIsInN1YiI6IjJkMDQwNzAwLTU4MmMtNGMyMy1hNzAxLWMwMDc2N2VmYWM3YiIsImF1ZCI6Imh0dHBzOi8vbGlicmFyeS5tZWRpY2FyZS5nb3YvYXBwLWxpYnJhcnkvYXBwcy9icC1idWRkeSIsImlhdCI6MTc4MTgxNzIyMywiZXhwIjoxNzgxODE3NTIzLCJqdGkiOiJhMGYxMmI0MC1hMGQwLTRkMWQtYjgxOS04MDM4NTljM2IxMDgifQ.RSfep-XtA0oALxDGQDorB3baD9wlahItdRUNGRtAFBc29yFu8iPk51TCqLpdcRI3olwdbbS3ol0IFx60ZJ9ls7SCgFjSqs7xdkn4eZ-lwKxvKSHPZa3tzJLaaLyn9GBDrzdT4_ahXPQSPo1WKGnIbMGg1UOBl1aMROxiOBod-IdWl-KqLyFC4rWieWRpG4Pyrl6KDI7YCg8r85AhTynoO_7NNj4BpOH9P3fmNKL36DUJyiE5Ds8JWz9tb6VgicztUtdyoSTz3RajCp6j1-Ze8SQBNWw9QxWfPD6IJyV5VxgZhJLDOc7vv4IOteebvJ04lXWYA6C8LK7ZcRLMKnsWqw"
    }
  },
  "iss": "lakeside-dh-bp-buddy-91af",
  "sub": "lakeside-dh-bp-buddy-91af",
  "aud": "https://lakeside.example/oauth/token",
  "exp": 1781817583,
  "jti": "48b132fb-42a0-4b30-8b3f-663390bc6b22"
}
```

---

**Token response**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "access_token": "n50P7uojGVNcmtMIf8tQTqDhQ9ID3LQB",
  "refresh_token": "Rk8MegQstcpzdSrSmtdOMussBnWRZ8J7",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "patient/Observation.rs patient/MedicationRequest.rs launch/patient",
  "patient": "lakeside-449210"
}
```

---

**FHIR query**

```http
GET https://lakeside.example/fhir/Observation?patient=lakeside-449210&category=vital-signs&_count=1 HTTP/1.1
Authorization: Bearer n50P7uojGVNcmtMIf8tQTqDhQ9ID3LQB
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