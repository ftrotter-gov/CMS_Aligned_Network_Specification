# Example artifacts

*Sample requests and responses, one page per step. All JWTs are really signed; each page shows the compact JWS next to its decoded header and payload. Verify anything against [keys-and-trust-anchors](keys-and-trust-anchors.md).*

## Record location and data access ([authorizing-access.md](../authorizing-access.md))

- [The CMS-signed software statement](software-statement.md)
- [Registration through a developer portal](portal-registration.md)
- [Dynamic registration with the CMS statement](dynamic-registration.md)
- [Registration with a community-issued certificate](certificate-registration.md)
- [The app signs Maria in at the CSP](csp-sign-in.md)
- [Opening the authorization step](authorization-step.md)
- [The service looks up record locations](peer-record-location.md)
- [The authorization step's token response](issuance-token-response.md)
- [A signed permission ticket and its redemption](permission-ticket.md)
- [A blanket ticket: every match disclosed](blanket-ticket.md)
- [client_credentials + $rls: the app-asserted grant at a network](client-credentials-rls.md)
- [cms_smart at a data holder: token and FHIR retrieval](cms-smart-data-holder.md)
- [Key rotation](key-rotation.md)
- [Keys and trust anchors](keys-and-trust-anchors.md)

*Generated 2026-06-18T21:14:43.000Z by `tools/artifact-generator` in this repository.*