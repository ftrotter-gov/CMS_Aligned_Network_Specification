# Keys and trust anchors

*Worked example for [the record location and data access write-up](../authorizing-access.md). Every signature in this library verifies against these keys. All material is throwaway, generated for the examples.*

**CMS statement signing JWKS** (published at a CMS well-known location):

```json
{
  "keys": [
    {
      "crv": "P-384",
      "kty": "EC",
      "x": "ZvkIbQ2Uhx5v1nOE9XOXmko-66t_tTjyEOkNUdfrLue8-NN8paaIE8-j-AMis4Ze",
      "y": "4lOULk5OBezFTPpK9XS5gd11QACWOMk7B90z7WQCjmN4GF7PH_uFNnFTFcMVkOgi",
      "alg": "ES384",
      "use": "sig",
      "kid": "7tFf8v--wVRKAIXTlgt1sWEsT73fBLGaBHifle_Ohd8"
    }
  ]
}
```

---

**BP Buddy JWKS** at `https://bpbuddy.example/.well-known/jwks.json` (keys A and B):

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

**CSP (ID.me-style) JWKS:**

```json
{
  "keys": [
    {
      "e": "AQAB",
      "kty": "RSA",
      "n": "1xMnxtBNdnmv7epWkUoCPEFKcu3uzy5yS1rZY2ysSrk_FQtZ542oh8S9eJ-qBSYL4Es46C4Hr0_HJwNbBowj0NYWWOp6m_g7ue0JGnpQZ0LDpiPRa_a7avHDdATyxQoxlLUKbTd1-IvZ0CvZlLShByo7xz5kyOFPRCxVPMcArU-zcHZSVPVjUJBISRK6YYocCS3lI2spNAovbQNuQGp1oUEID5z-1eWH2orzcs0l-dvnS2Gmuh3CkSymw-zkpPzkkOW3SNcoVgPzyDa3yCjDI1eK71gfsaRX7meAWW0xYaqTUiM-4y5zU76ZA63HJbGFghDFT5c_5lkmOWiLmkIdww",
      "alg": "RS256",
      "use": "sig",
      "kid": "rXjI9JdJPKyeDTFy3KHEFpVCSS3sILGofwbyk0_nJq0"
    }
  ]
}
```

---

**Beta ticket-issuer JWKS** (signs permission tickets in the alternative shape):

```json
{
  "keys": [
    {
      "crv": "P-256",
      "kty": "EC",
      "x": "0_40dMO3TkI7XUlLT8CN26nPtAWzVJnaX6fneq8t-aw",
      "y": "7_P30Lh_J2pnVssEtTEoDjzDKS1LdBCY_C3VtQATcSU",
      "alg": "ES256",
      "use": "sig",
      "kid": "6kN03FQtdE077H2-LnZHFxPtGPufEw7yMvuDVgzWIr4"
    }
  ]
}
```

---

**Gamma community CA certificate** (the anchor Gamma distributes to its data holders):

```
-----BEGIN CERTIFICATE-----
MIIDYzCCAkugAwIBAgIULFyvOHx4jSBdV1886Ox9ICsLQHcwDQYJKoZIhvcNAQEL
BQAwQTEhMB8GA1UEAwwYR2FtbWEgVHJ1c3QgQ29tbXVuaXR5IENBMRwwGgYDVQQK
DBNHYW1tYSBUcnVzdCBOZXR3b3JrMB4XDTI2MDYxODIxMTQ0M1oXDTI3MDYxODIx
MTQ0M1owQTEhMB8GA1UEAwwYR2FtbWEgVHJ1c3QgQ29tbXVuaXR5IENBMRwwGgYD
VQQKDBNHYW1tYSBUcnVzdCBOZXR3b3JrMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
MIIBCgKCAQEAiP9Cste3LnNWmVKpXQj0fszEVLlutR28HXZHlz7cJRKbICFsokAo
yk4XkhtA/gYueCXnuiy6YW6mei4ISc8V9cOrKzPD7kAPZ9ZzCDSvS6CP0wP6K1Ye
05ObQI+a0TyXa6epN0+dAQih/69SIUUz9r5pQMMmgRb0PQidi9t1v+j4EYQD3WAI
4ZSCYIxjzX1fsqjZSzSaI1h1rWmMiXJ6NK3IivDl0FkYjH0hXn/pt5k/WtvY6R3+
6UAx7Y8+0SoaFL73kFxnecjZ6QX2jbM6RgRwk42dbDn9ypfgaE5I1b3srAgRBiKc
pVR7eoK20FJ0TnvXcKb1a765z80xOfyHawIDAQABo1MwUTAdBgNVHQ4EFgQUHGAe
kbWQvSrxq3RiY3YRT1R34R4wHwYDVR0jBBgwFoAUHGAekbWQvSrxq3RiY3YRT1R3
4R4wDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAhRfXMz9wmEMf
+hCo8Wn7/HK6rpp/aGJZfw5sfhmJe5BgYZtSULwNojpdR9mDF7TVEP7YD7Aslfxv
YkUraDaDoplS8rO1ovD1QlEdlLUJhrz7RewvG/sikkhJlHPa+iRKtlFHFrIg8lcs
HvBgOyusIs01qjnQZWZPPlcoXelS1061/BFbbTuMHTRV4X1zmTgjvddSchiC0T+h
l39MePy9qpZjR/QS3lVnlOXZw/mpMbOe0qPrSYa/8W8B6wOmyU2Z+S8io1HJS/FC
vB+f6eptQf719coXWi/anUUc8VNJOfvuB0VqLQFxsdYsE/RZG/rP7g5V/hwWRpp9
Opv844y6Ig==
-----END CERTIFICATE-----
```

---

**BP Buddy's Gamma-issued certificate** (subjectAltName URI = `https://bpbuddy.example`, chains to the CA above):

```
-----BEGIN CERTIFICATE-----
MIIDXzCCAkegAwIBAgIUQggaK0bBlKxaYhOB9eBYR0dKKlowDQYJKoZIhvcNAQEL
BQAwQTEhMB8GA1UEAwwYR2FtbWEgVHJ1c3QgQ29tbXVuaXR5IENBMRwwGgYDVQQK
DBNHYW1tYSBUcnVzdCBOZXR3b3JrMB4XDTI2MDYxODIxMTQ0M1oXDTI2MDkxNjIx
MTQ0M1owKjERMA8GA1UEAwwIQlAgQnVkZHkxFTATBgNVBAoMDEJQIEJ1ZGR5IElu
YzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOdWlAmwj4TIew8810pl
Mul6t2lt9jPnrCvCdtYIghwLU13Fy9HKTdRsB2IJzrtfrVXbDBFHFA3DDGtarE9Y
uBjytwJEHj5fwMB5uGFBXjb2M3Sp2sfpKW+ruP9SojW1pgW5wnsK8neCQnTyTKRq
pcxSDemsrNT9dlfDFEJFu0Dlz7wRDJKMLVHgLvV08vAMCdoffcjZSZ8yPPl5Grwj
y2tzfQEVhEaCiP8VlD+tIL+9UAQsEvNIByO9LG3y+ojwISnttJIB1yjSDWsw1zEk
yEhKvoWvPUGTXVlIYzi/1D6EsWMBItnPfjNLQmn8JjwfbEmAQscE0EgaB7aLNPbH
ItkCAwEAAaNmMGQwIgYDVR0RBBswGYYXaHR0cHM6Ly9icGJ1ZGR5LmV4YW1wbGUw
HQYDVR0OBBYEFDpqSBdJZvBgcQ8rYU9aSouI1o6VMB8GA1UdIwQYMBaAFBxgHpG1
kL0q8at0YmN2EU9Ud+EeMA0GCSqGSIb3DQEBCwUAA4IBAQB+9/zOwqiSPnrY8mx0
ar9UKqDTyJrVLz8Ktde+vxOLB5grg9WvMIOPjmP8nhwBplWuGTyonZHhUskM764u
HbPjK8LSOWcB9PvhJbjS+D7pejgNBpg1g8291CcRAhBkJeoLi/u1oc2c2CZbhoTD
dWrmd0nsGsusxNNN1enwiVWxDPkg4I70bKQQkkRt1fRuGPW3dgrWFd6Ej5b5LYjt
lwRmr3X1hWKmZIG07F3p+OwBOS7wJQQ7Eu+R65C7QYz4+/cWzk+JVlW8KVA75BCL
drIhutPYpOYA7AbzOaVIT3udRLyEmI3oygI88XXZKyO3jA8V7m7sxRPrC/MUumDI
xvyh
-----END CERTIFICATE-----
```

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*