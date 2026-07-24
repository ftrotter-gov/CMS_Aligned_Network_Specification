# The service looks up record locations

*Worked example for [the record location and data access write-up](../authorizing-access.md). Within its own network the lookup is internal. For peer networks it has agreements with, the service queries their record location endpoints system-to-system. The wire shape is a placeholder; what matters is that the service, not the app, sees the answers.*

**Request to a peer network's record location endpoint**

```http
POST https://rls.gamma-trust.example/fhir/Patient/$rls HTTP/1.1
Authorization: Bearer (service credentials under the peering agreement)
Content-Type: application/fhir+json
```

```json
{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "demographics",
      "part": [
        {
          "name": "family",
          "valueString": "Lopez"
        },
        {
          "name": "given",
          "valueString": "Maria"
        },
        {
          "name": "birthdate",
          "valueDate": "1962-03-15"
        }
      ]
    }
  ]
}
```

---

**Response**

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
          "valueString": "Riverbend Medical"
        },
        {
          "name": "fhir-endpoint",
          "valueUrl": "https://fhir.riverbend.example/r4"
        }
      ]
    }
  ]
}
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*