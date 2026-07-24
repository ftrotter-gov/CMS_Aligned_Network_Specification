# Key rotation

*Worked example for [the record location and data access write-up](../authorizing-access.md). The app publishes key B alongside key A, then signs with the new kid; data holders resolve it at the live jwks_uri with nothing to re-issue.*

**JWKS before rotation:**

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

**JWKS during the overlap window (key B published alongside key A):**

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
    },
    {
      "e": "AQAB",
      "kty": "RSA",
      "n": "0EzPMw9J_mCN4d_0guUJ2BZs2JzwKjt4YGB3rpyp5-kat3dDZ96g_fYG4GRAku_HDInMWn3Y6jT7ZgHcuKu-dkHsRaZt4OIyKWjW1lQsRZW931VKBwSgsxUK6XRVfLjWrbyXmow5ah9o-6rlQW0D46-H1_yaef37wzBiISvXrjmMltvpXuW_escjJS2u7ZQHHB7NrMjkxPdm8RY31FOYSGRiH3pZMWNLO-9233S1gGluYP9YG68O-UD4wE0K1jyHfaV3VssogXSur0NHN22_Ploz_e-hrVhWrJ2JIsv5xqBEjcRw5RII8Jnpt8SD9xLev3EcJYj36tlI4uW-v0-2-w",
      "alg": "RS384",
      "use": "sig",
      "kid": "7kTjPr2AOyNYQmxD83HFHoaXy22bdhfKzXunIQkeLww"
    }
  ]
}
```

---

First token request signed with the new key; note the `kid` in the header now matches key B:

**client_assertion signed with key B** (compact JWS, really signed):

```
eyJhbGciOiJSUzM4NCIsImtpZCI6IjdrVGpQcjJBT3lOWVFteEQ4M0hGSG9hWHkyMmJkaGZLelh1bklRa2VMd3ciLCJ0eXAiOiJKV1QifQ.eyJleHRlbnNpb25zIjp7ImNtc19zbWFydCI6eyJ2ZXJzaW9uIjoiMSIsInB1cnBvc2Vfb2ZfdXNlIjoiUEFUUlFUIiwiaWRfdG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0ltdHBaQ0k2SW5KWWFrazVTbVJLVUV0NVpVUlVSbmt6UzBoRlJuQldRMU5UTTNOSlRFZHZabmRpZVdzd1gyNUtjVEFpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBaR1Z1ZEdsMGVWOWhjM04xY21GdVkyVmZiR1YyWld3aU9qSXNJbUYxZEdoZmRHbHRaU0k2TVRjNE1UZ3hOekl5TXl3aVoybDJaVzVmYm1GdFpTSTZJazFoY21saElpd2labUZ0YVd4NVgyNWhiV1VpT2lKTWIzQmxlaUlzSW1KcGNuUm9aR0YwWlNJNklqRTVOakl0TURNdE1UVWlMQ0poWkdSeVpYTnpJanA3SW5OMGNtVmxkRjloWkdSeVpYTnpJam9pTkRFNElFRnNaR1Z5SUVOdmRYSjBJaXdpYkc5allXeHBkSGtpT2lKU2FYWmxjbk5wWkdVaUxDSnlaV2RwYjI0aU9pSkRRU0lzSW5CdmMzUmhiRjlqYjJSbElqb2lPVEkxTURFaUxDSmpiM1Z1ZEhKNUlqb2lWVk1pZlN3aWMzTnVYMmwwYVc1ZmMyaHZjblFpT2lJME16SXhJaXdpYVhOeklqb2lhSFIwY0hNNkx5OWhjR2t1YVdRdWJXVXZiMmxrWXlJc0luTjFZaUk2SWpKa01EUXdOekF3TFRVNE1tTXROR015TXkxaE56QXhMV013TURjMk4yVm1ZV00zWWlJc0ltRjFaQ0k2SW1oMGRIQnpPaTh2YkdsaWNtRnllUzV0WldScFkyRnlaUzVuYjNZdllYQndMV3hwWW5KaGNua3ZZWEJ3Y3k5aWNDMWlkV1JrZVNJc0ltbGhkQ0k2TVRjNE1UZ3hOekl5TXl3aVpYaHdJam94TnpneE9ERTNOVEl6TENKcWRHa2lPaUpoTUdZeE1tSTBNQzFoTUdRd0xUUmtNV1F0WWpneE9TMDRNRE00TlRsak0ySXhNRGdpZlEuUlNmZXAtWHRBMG9BTHhER1FEb3JCM2JhRDl3bGFoSXRkUlVOR1J0QUZCYzI5eUZ1OGlQazUxVENxTHBkY1JJM29sd2RiYlMzb2wwSUZ4NjBaSjlsczdTQ2dGalNxczd4ZGtuNGVaLWx3S3h2S1NIUFphM3R6SkxhYUx5bjlHQkRyemRUNF9haFhQUVNQbzFXS0duSWJNR2cxVU9CbDFhTVJPeGlPQm9kLUlkV2wtS3FMeUZDNHJXaWVXUnBHNFB5cmw2S0RJN1lDZzhyODVBaFR5bm9PXzdOTmo0QnBPSDlQM2ZtTktMMzZEVUp5aUU1RHM4Sld6OXRiNlZnaWN6dFV0ZHlvU1R6M1JhakNwNmoxLVplOFNRQk5XdzlReFdmUEQ2SUp5VjVWeGdaaEpMRE9jN3Z2NElPdGVlYnZKMDRsWFdZQTZDOExLN1pjUkxNS25zV3F3In19LCJpc3MiOiJsYWtlc2lkZS1kaC1icC1idWRkeS05MWFmIiwic3ViIjoibGFrZXNpZGUtZGgtYnAtYnVkZHktOTFhZiIsImF1ZCI6Imh0dHBzOi8vbGFrZXNpZGUuZXhhbXBsZS9vYXV0aC90b2tlbiIsImV4cCI6MTc4MTgxNzU4MywianRpIjoiNGQzM2FhMmQtMGQ2NC00NjYzLTliYjUtODI4YjRmYjcyNGM5In0.Z4zwCbVcahP17_zEb16ROkypvlhgeZYi8k-9_voOihaarYBiP1-6v5_0RhWxvowf4zdReAA24DmNuatqa_E9VS8lQUvtfDEwU08vAhqiftk8HnU9wjWsKOn59BRxwy4vo0GYitHIkxR2HPI41jx_s54CJ4ej3NkPx0iXtElrA1RwtgWl3WGMrX19K6mGfGlHuQMknKh200QLNlCt7kePdFOEr--dmPuG-1Ze9cxdEF-112VnKhfWSgB5shnTxxPXMJtfQhGPrQo0Fs27P6Aheh6EdMSPy1TJpK_qzzFr8ZuNBzKdMh6S6OonnMj9Is_cR_z8Snr6QMqMkwKBd7_L1w
```

Decoded header:

```json
{
  "alg": "RS384",
  "kid": "7kTjPr2AOyNYQmxD83HFHoaXy22bdhfKzXunIQkeLww",
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
  "jti": "4d33aa2d-0d64-4663-9bb5-828b4fb724c9"
}
```

---

After the overlap window the app removes key A from the JWKS. Nothing else in the ecosystem changed: the CMS statement binds the `jwks_uri`, not a key. For network-issued certificates, the synchronization rule in [Key rotation](../authorizing-access.md) applies.

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*