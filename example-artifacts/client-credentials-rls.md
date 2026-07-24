# client_credentials + $rls: the app-asserted grant at a network

*Worked example for [the record location and data access write-up](../authorizing-access.md). Maria authenticated at her IAL2 CSP moments ago; her id_token travels inside the cms_smart extension of the client_assertion, following the Blue Button CMS Aligned Networks pattern. The access token comes back bound to her, so $rls can only locate her records.*

**CSP-issued IAL2 id_token (ID.me-style claims)** (compact JWS, really signed):

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

The `aud` is the app's canonical Library identifier: the app configures its CSP registration so id_tokens carry its `software_id`. Any network or data holder can then verify the relationship between the id_token's audience and the presenting application (can-spec §9) by matching `aud` against the `software_id` it bound at registration — the identifiers are literally identical, no directory needed.

---

**Token request**

```http
POST https://rls.beta-exchange.example/oauth/token HTTP/1.1
Host: rls.beta-exchange.example
Content-Type: application/x-www-form-urlencoded
```

```json
{
  "grant_type": "client_credentials",
  "scope": "patient/Patient.rs launch/patient",
  "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "client_assertion": "eyJhbGciOiJSUzM4NCIsImtpZCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9E... (decoded below)"
}
```

---

**client_assertion — note extensions.cms_smart carrying the full id_token** (compact JWS, really signed):

```
eyJhbGciOiJSUzM4NCIsImtpZCI6IkRxakdodjdmT0E1RzJyX2JGTlFLSk9ENk1Ib1c1NU91SWNsWm5kOVZWYWsiLCJ0eXAiOiJKV1QifQ.eyJleHRlbnNpb25zIjp7ImNtc19zbWFydCI6eyJ2ZXJzaW9uIjoiMSIsInB1cnBvc2Vfb2ZfdXNlIjoiUEFUUlFUIiwiaWRfdG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0ltdHBaQ0k2SW5KWWFrazVTbVJLVUV0NVpVUlVSbmt6UzBoRlJuQldRMU5UTTNOSlRFZHZabmRpZVdzd1gyNUtjVEFpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBaR1Z1ZEdsMGVWOWhjM04xY21GdVkyVmZiR1YyWld3aU9qSXNJbUYxZEdoZmRHbHRaU0k2TVRjNE1UZ3hOekl5TXl3aVoybDJaVzVmYm1GdFpTSTZJazFoY21saElpd2labUZ0YVd4NVgyNWhiV1VpT2lKTWIzQmxlaUlzSW1KcGNuUm9aR0YwWlNJNklqRTVOakl0TURNdE1UVWlMQ0poWkdSeVpYTnpJanA3SW5OMGNtVmxkRjloWkdSeVpYTnpJam9pTkRFNElFRnNaR1Z5SUVOdmRYSjBJaXdpYkc5allXeHBkSGtpT2lKU2FYWmxjbk5wWkdVaUxDSnlaV2RwYjI0aU9pSkRRU0lzSW5CdmMzUmhiRjlqYjJSbElqb2lPVEkxTURFaUxDSmpiM1Z1ZEhKNUlqb2lWVk1pZlN3aWMzTnVYMmwwYVc1ZmMyaHZjblFpT2lJME16SXhJaXdpYVhOeklqb2lhSFIwY0hNNkx5OWhjR2t1YVdRdWJXVXZiMmxrWXlJc0luTjFZaUk2SWpKa01EUXdOekF3TFRVNE1tTXROR015TXkxaE56QXhMV013TURjMk4yVm1ZV00zWWlJc0ltRjFaQ0k2SW1oMGRIQnpPaTh2YkdsaWNtRnllUzV0WldScFkyRnlaUzVuYjNZdllYQndMV3hwWW5KaGNua3ZZWEJ3Y3k5aWNDMWlkV1JrZVNJc0ltbGhkQ0k2TVRjNE1UZ3hOekl5TXl3aVpYaHdJam94TnpneE9ERTNOVEl6TENKcWRHa2lPaUpoTUdZeE1tSTBNQzFoTUdRd0xUUmtNV1F0WWpneE9TMDRNRE00TlRsak0ySXhNRGdpZlEuUlNmZXAtWHRBMG9BTHhER1FEb3JCM2JhRDl3bGFoSXRkUlVOR1J0QUZCYzI5eUZ1OGlQazUxVENxTHBkY1JJM29sd2RiYlMzb2wwSUZ4NjBaSjlsczdTQ2dGalNxczd4ZGtuNGVaLWx3S3h2S1NIUFphM3R6SkxhYUx5bjlHQkRyemRUNF9haFhQUVNQbzFXS0duSWJNR2cxVU9CbDFhTVJPeGlPQm9kLUlkV2wtS3FMeUZDNHJXaWVXUnBHNFB5cmw2S0RJN1lDZzhyODVBaFR5bm9PXzdOTmo0QnBPSDlQM2ZtTktMMzZEVUp5aUU1RHM4Sld6OXRiNlZnaWN6dFV0ZHlvU1R6M1JhakNwNmoxLVplOFNRQk5XdzlReFdmUEQ2SUp5VjVWeGdaaEpMRE9jN3Z2NElPdGVlYnZKMDRsWFdZQTZDOExLN1pjUkxNS25zV3F3In19LCJpc3MiOiJiZXRhLXJscy1icC1idWRkeS01ZDIwIiwic3ViIjoiYmV0YS1ybHMtYnAtYnVkZHktNWQyMCIsImF1ZCI6Imh0dHBzOi8vcmxzLmJldGEtZXhjaGFuZ2UuZXhhbXBsZS9vYXV0aC90b2tlbiIsImV4cCI6MTc4MTgxNzU4MywianRpIjoiZWE0YjM3MTYtZGU4NC00NjhiLTk0ZDctYWU3YmYzOGM3ZGFjIn0.Wo9myYqpX1YI2SXeucvovVi16h62AuKg8v-fxrT0nzuKmsDBQ51RRr5MLHeU1Kn9LQ_GpcmPRAQ1qPxSUwbCATSWEC76cws3w5PI4ZF_ZBaCKf1vS2oZlbZbdGhkGvFHSaRuHiFla3YfEvKVo_qRzPbumx0X20r7mUe2vfkfAo_V5DYnRVaZ62i90HTyvv6zGvFYCE_NiKWFdxZtIS7I1odu47ELr3_Hue_5OgdWoIfMlmmNJHqsjln4xiw8Mqtplh8GfrBfAFw4aTns4e14vSqe7u6pAC-eeDW7-n6qSvERpjrhJWkaVGYkisagWv09DWngPaNiM6YJLVL6VN43vA
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
  "iss": "beta-rls-bp-buddy-5d20",
  "sub": "beta-rls-bp-buddy-5d20",
  "aud": "https://rls.beta-exchange.example/oauth/token",
  "exp": 1781817583,
  "jti": "ea4b3716-de84-468b-94d7-ae7bf38c7dac"
}
```

---

**Token response — patient matched (can-spec §6), token bound to Maria**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "access_token": "U5fv8vUL5hrbQcPQVoca2Byi2DE0957i",
  "token_type": "Bearer",
  "expires_in": 1800,
  "scope": "patient/Patient.rs launch/patient",
  "patient": "beta-master-7741"
}
```

---

**$rls request — parameters are the point of using an operation**

```http
POST https://rls.beta-exchange.example/fhir/Patient/$rls HTTP/1.1
Host: rls.beta-exchange.example
Authorization: Bearer U5fv8vUL5hrbQcPQVoca2Byi2DE0957i
Content-Type: application/fhir+json
```

```json
{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "geographic-scope",
      "valueString": "US-CA"
    },
    {
      "name": "since",
      "valueDate": "2020-01-01"
    },
    {
      "name": "resource-interest",
      "valueCode": "Observation"
    }
  ]
}
```

---

**$rls response — endpoints likely to hold Maria's records**

```http
HTTP/1.1 200 OK
Content-Type: application/fhir+json
```

```json
{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "location",
      "part": [
        {
          "name": "organization",
          "valueString": "Lakeside Clinic"
        },
        {
          "name": "fhir-endpoint",
          "valueUrl": "https://lakeside.example/fhir"
        }
      ]
    },
    {
      "name": "location",
      "part": [
        {
          "name": "organization",
          "valueString": "County Health"
        },
        {
          "name": "fhir-endpoint",
          "valueUrl": "https://fhir.countyhealth.example/r4"
        }
      ]
    }
  ]
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*