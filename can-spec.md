# CMS-Aligned Network Specification

**Draft Community Specification**

**Editor's Draft, June 22, 2026**

**This version:** `can-spec/0.4-draft`  
**Latest published version:** *none yet*  
**Editor:** Liz Lewis (b.well Connected Health)  
**Feedback:** via CMS Health Technology Ecosystem working groups

---

## Scope

The immediate focus of this specification is the use cases currently defined in the CMS Interoperability Framework: patient access, payer access (for specific permitted activities), and provider access. Patient access is the top priority, followed by payer access and provider access. The specification has also been written with future use cases in mind, including proxy and caregiver access, and notification flows such as patient encounter notifications; where requirements for those use cases are not yet specified, this document identifies the gaps rather than foreclosing them.

---

## Abstract

This document specifies the technical and operational requirements a Health Information Network MUST meet to be recognized as a **CMS-Aligned Network (Network)** under the CMS Health Technology Ecosystem (HTE).

The specification covers the three core obligations of a CMS-Aligned Network, the three required connectivity pathways plus one optional pathway, patient matching, auto-registration, authentication, authorization, query handling, National Provider Directory (NPD) publication, audit logging, security validation, fees, and accountability.

This specification deliberately covers **network obligations only**. Trust pathways for apps, EHRs, providers, and payers are referenced where they intersect network behavior but are specified elsewhere.

---

## Status of This Document

This is an editor's draft assembled from working-group materials. It has no normative force on its own. The authoritative source for CMS-Aligned status is the **CMS Interoperability Framework** published by CMS at <https://www.cms.gov/health-technology-ecosystem/interoperability-framework>. Where this document and the Framework conflict, the Framework controls.

This draft is offered as a consolidated rendering of network-side requirements so that implementers can evaluate conformance against a single artifact. Working-group input is welcome on operational specifics (auto-registration profiles, audit standards, dispute resolution, presumptive-eligibility scope).

---

## 1. Conformance

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119), [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)) when, and only when, they appear in all capitals.

A network conforms to this specification when it satisfies every **MUST** in §§ 3–14 and is in good standing under § 15.

---

## 2. Terminology

**Network (CMS-Aligned Network)** — A governed exchange layer, combining technology, trust agreements, and shared operating rules, that enables multiple organizations to send and receive standardized health data without building custom point-to-point connections to every counterparty. Within the Health Tech Ecosystem, networks serve as the routing and trust infrastructure that connects data originators — providers, payers, and other health systems — to applications and platforms that ultimately serve patients, enabling interoperability at scale across the ecosystem. For purposes of this specification, "Network" refers specifically to a Health Information Network recognized by CMS as meeting the obligations defined herein.

> **CONTESTED — DEFINITION REVIEW**
>
> Consider aligning this definition to 45 CFR 171.102, which defines a Health Information Network or Health Information Exchange as:
>
> An individual or entity that determines, controls, or has the discretion to administer any requirement, policy, or agreement that permits, enables, or requires the use of any technology or services for access, exchange, or use of electronic health information:
>
> (1) Among more than two unaffiliated individuals or entities (other than the individual or entity to which this definition might apply) that are enabled to exchange with each other; and
>
> (2) That is for a treatment, payment, or health care operations purpose, as such terms are defined in 45 CFR 164.501 regardless of whether such individuals or entities are subject to the requirements of 45 CFR parts 160 and 164.
>
> Aligning to 45 CFR 171.102 would ground the spec's network definition in existing regulatory text and may affect which entities are in scope as Networks.

**Home Network** — The single Network through which a given participant (app, data holder, delegated tech solution) is onboarded and held to be in good standing.

> **⚠ CONTESTED — Architecture Decision**
>
> **The "home network" model is not yet agreed.** The current spec assumes a home-network gating architecture: every app or tech solution connects to the ecosystem via a designated home Network that vouches for it and performs cross-network operations on its behalf. This assumption is contested.
>
> **Camp A (current spec model):** Apps connect via a home Network. The home Network onboards the app, establishes its good standing, and acts as the trust anchor and routing intermediary for cross-network queries. Other Networks respond because the home Network vouches for the app — not because they have a direct relationship with it.
>
> **Camp B (direct-connect model):** The architecture should allow apps to connect on their own steam directly to all Networks. Apps may choose to outsource cross-network operations to a Network operator as a convenience, but the architecture should not require home-network gating as a structural constraint. Trust should be derivable from federal credentials alone, without a home Network intermediary in the path.
>
> **TODO — Working Group**
>
> Resolve the home-network architecture question before this spec progresses. Specifically: Is a designated home Network a structural requirement of the ecosystem, or an optional operational convenience? The answer affects §§ 4.3, 7.1, 7.2, and the Connectivity Pathways (§ 5) throughout.

**Data Holder** — A HIPAA covered entity (provider organization or payer) that holds patient records and exposes them via a network.

**Connector** — A tech solution or intermediary that initiates a targeted query against a specific endpoint identified in NPD — for example, when a payer has evidence (e.g., a received claim) that a patient's data resides at a particular provider endpoint. Connectors have direct query rights under applicable HIPAA authority.

**Tech Solution** — A patient-facing application, third-party delegated software, or other ecosystem participant that originates queries.

**Federal Trust Signal** — A federally grounded credential or attestation that travels with an actor (e.g., ONC certification, CARIN Code of Conduct, DirectTrust accreditation, DiME seal, IAL2 verification, Medicare App Library listing, NPD listing, HIPAA covered-entity status, X.509 credential).

**Good Standing** — As defined in § 4.3: completed home-network onboarding, current on obligations, no active unresolved complaints, passed operational health checks, not suspended.

**Inter-Network Settlement** — A commercial arrangement in which one Network compensates another for carrying or fulfilling queries that originate from the first Network's participants — analogous to transit fees or peering settlements in telecommunications. Settlement is prohibited for patient-directed access traffic (§ 14.3) and is optional for other traffic types.

**NPD** — National Provider Directory. The authoritative public registry of ecosystem participants, endpoints, and inter-network connections.

**RLS** — Record Locator Service.

**Use Case** — One of: patient access, treatment, payment, operations, prior authorization, payer-to-payer.

**Dynamic Client Registration (RFC 7591)** — The general IETF OAuth 2.0 mechanism by which a client registers itself with an authorization server programmatically, presenting a signed software statement at the `/register` endpoint as the `software_statement` parameter. This is the wire format; the software statement itself can be issued by different authorities (CMS, a CA, or others) representing different trust paths. UDAP is one specific profile that implements dynamic client registration using X.509 certificates; it is not a synonym for dynamic client registration in general.

**Software Statement (CMS-signed)** — A short-lived JWT signed by CMS that asserts a client's status in a CMS-maintained registry and binds it to a verified `jwks_uri`. Presented as the `software_statement` parameter during RFC 7591 Dynamic Client Registration. CMS-signed software statements can streamline dynamic registration for many client types — patient-facing apps, payers, providers, delegated tech solutions — as CMS extends its registry coverage. To date, CMS's most concrete commitment is the Medicare App Library for patient-facing apps; the architecture accommodates broader use as that coverage grows.

**Software Statement (UDAP)** — An X.509-anchored signed JWT per the [HL7 FAST Security Implementation Guide](https://hl7.org/fhir/us/udap-security/) (HL7 FAST UDAP IG, sometimes called FAST Security) — one specific implementation of RFC 7591 dynamic client registration. Trust is validated against the trust community CA recognized by the CMS-Aligned framework. See § 7.1 for the open architectural question of whether UDAP remains a required path alongside CMS-signed software statements.

---

## 3. Architecture Overview

The HTE architecture establishes a **federal floor** that is mandatory for participants who choose to be CMS-Aligned. Above the floor, networks compete and differentiate freely.

### 3.1 Non-Goals

A CMS-Aligned Network is **NOT** required to:

- sign a common agreement with other networks;
- share liability with other networks;
- adopt common pricing or governance.

### 3.2 What Networks MUST Do

Every CMS-Aligned Network **MUST**:

1. Meet the three core obligations in § 4.
2. Support all three connectivity pathways in § 5.
3. Use the CMS-approved patient matching logic (§ 6).
4. Honor auto-registration and presumptive eligibility for participants in good standing on another home Network (§ 7).
5. Authenticate participants using a federally grounded credential — IAL2 for patient-facing (B2C) flows, a recognized software statement for system-to-system (B2B) flows — no portal login may be required as a precondition (§ 8).
6. Implement authorization per patient preferences (§ 9).
7. Respond to authorized queries completely and without undue obstruction, subject to applicable access controls and authorization requirements (§ 10).
8. Publish to NPD (§ 11).
9. Produce audit logs accessible to patients (§ 12).
10. Maintain HITRUST security validation (§ 13).
11. Comply with the fees floor (§ 14).
12. Remain accountable to CMS for ongoing compliance (§ 15).
13. Attest to the same "rules of the road" of all other CMS-Aligned Networks (§ 17).

---

## 4. The Three Core Obligations

### 4.1 Respond to queries for data holders on the network

A Network **MUST** respond when an authorized query reaches the network and a data holder on the network holds matching data, across every Use Case the network's participants engage in. This includes, at minimum, patient access, treatment, and payment queries within applicable use cases.

A Network **MUST NOT** decline to respond solely because the originating query came from a participant whose home network is different.

### 4.2 Vouch for participants in good standing

A Network **MUST** maintain the operational status of each of its onboarded participants and **MUST** report good standing (or lack thereof) when queried by another Network or by NPD.

A Network **MUST NOT** attest to federal legal compliance on behalf of its participants. Operational status only.

A Network **MUST** suspend a participant's good-standing report when the participant has been suspended or flagged by the network, or has failed an operational health check that the network publishes.

### 4.3 Respond to credentialed tech solutions from other home networks

When a tech solution presents valid Federal Trust Signals **and** is reported in good standing on its home Network, the receiving Network **MUST** respond to its queries.

The receiving Network **MUST NOT** impose duplicative trust gating on top of the Federal Trust Signals and the home-network good-standing report. Operational coordination (abuse contacts, rate-limit coordination, ops contacts, support channels) **MAY** be required.

---

## 5. Connectivity Pathways

A Network **MUST** support all three of the following pathways. A fourth pathway is **OPTIONAL** and operates outside the CMS-aligned obligation structure.

### 5.1 Pathway 1 — Intranetwork

The Network serves queries against data holders that have contracted directly with the Network as their home network.

**Assumptions:**
- The participant has a direct contract with the Network.
- The Network is in good standing as CMS-Aligned.

**Conformance:**
- The Network **MUST** respond to authorized queries for any data holder on the network across applicable use cases.

### 5.2 Pathway 2 — RLS Network Search ($match)

Discovery uses `$match` against the published RLS endpoints of other CMS-Aligned Networks. Data retrieval may use either **federated FHIR** (each responder serves its own data directly) or **brokered FHIR** (a network broker aggregates and returns data on behalf of multiple endpoints). Both retrieval modes are conformant.

**Assumptions:**
- Every Network exposes a standardized RLS endpoint at a known address listed in NPD.
- The endpoint accepts authenticated `$match` requests from other CMS-Aligned Networks and Apps in the ecosystem.
- Common patient matching (§ 6) applies.

**Conformance:**
- A Network **MUST** expose a standardized RLS endpoint at the address published in NPD.
- A Network **MUST** accept authenticated `$match` requests from other CMS-Aligned Networks on this endpoint.
- A Network **MUST** apply the CMS patient matching rule (§ 6) to all queries received via Pathway 2.
- Data retrieval **MAY** use federated FHIR or brokered FHIR; both are conformant.

> **OPEN QUESTION — For Working Group Discussion**
>
> The current conformance requirement uses `$match` as the sole discovery mechanism. Two concerns have been raised:
>
> 1. **`$match` has no production use at scale** for cross-network Record Locator Service. It is a FHIR operation designed for single-endpoint patient matching, not multi-site federated discovery.
> 2. **XCPD (Cross-Community Patient Discovery, IHE ITI-55)** has established production use for exactly this purpose and should be considered the floor for cross-network discovery.
>
> Proposed for discussion: Networks **SHOULD** accept either `$match` **OR** XCPD for cross-network discovery, with conformance testing requirements to be determined. FHIR-based mechanisms (including `$match`) may be added or substituted as they reach production readiness at scale.

> **DEPENDENCY — LEGAL/OPERATIONAL — UNRESOLVED**
>
> The current pathway assumes any CMS-aligned network must provide RLS access to non-participants. Multiple participants have flagged this as a potential HIPAA violation in the absence of a Business Associate Agreement between the data holder and the requesting non-participant. Resolution depends on the legal/operational workstream and is tracked outside this document.

> **Note.** The exact wire profile of the RLS endpoint, the federation transport, and the authentication scheme between Networks are intentionally left to the CMS Interoperability Framework and the working-group operational profiles. The wire profile for brokered FHIR retrieval is an open question — see Appendix A.

### 5.3 Pathway 3 — Targeted Queries Against NPD

The connector queries a specific endpoint by NPI (or equivalent identifier) listed in NPD, when there is evidence the patient has data at that endpoint (e.g., a payer that received a claim from a specific provider). Unlike Pathway 2, Pathway 3 applies when the connector already has evidence of the patient's data location and queries that endpoint directly, without using RLS discovery.

**Assumptions:**
- The connector has direct query rights under HIPAA right of access, treatment/payment/operations purpose of use, or other applicable legal authority.
- NPD listing is authoritative for endpoint discovery.

**Conformance:**
- A Network **MUST** publish its participants' endpoints to NPD in a form that supports targeted queries by NPI or equivalent identifier.

> **NOTE**
>
> Rate-limiting and discovery-pattern constraints apply to network-mediated queries (Pathway 2), where the Network is in the query path. In Pathway 3, the connector queries an endpoint directly without Network intermediation; unbounded discovery patterns are governed by endpoint-level controls at the receiving data holder, not by the Network. The specific endpoint-level constraint mechanism is an open question — see Appendix A.

### 5.4 Pathway 4 — Bilateral Network-to-Network Peering Agreement *(OPTIONAL)*

Two networks enter a direct contractual arrangement to exchange data with each other, independent of any CMS-aligned obligation. Each network decides whether to communicate with the other; the arrangement is purely voluntary and bilateral.

**Assumptions:**
- The peering agreement is negotiated bilaterally between the two networks and is not required by CMS-Aligned status.
- The contract governs the terms of communication, settlement, transit, and SLAs between the two networks.
- Neither network's CMS-aligned obligations are fulfilled or affected by this arrangement.

**Conformance:**
- A Network **MAY** enter into bilateral peering agreements with other networks at its discretion.
- A Network **MUST NOT** rely solely on a Pathway 4 arrangement to satisfy its obligations under § 4, because the peering is voluntary and either party may withdraw.

---

## 6. Patient Matching

A Network **MUST** implement the CMS-approved patient matching logic specified in the CMS Interoperability Framework. The current MVP standard is the **26-combination matching rule**.

A Network **MUST** respond when a query received via any pathway in § 5 matches a patient record across any of the 26 specified combinations, provided that authorization requirements under § 9 are satisfied. A match result alone does not create a response obligation if authorization has not been granted.

> The exact field list and combination matrix are explained in a different specification, not duplicated here. Will link when it's available. 

---

## 7. Auto-Registration and Presumptive Eligibility

### 7.1 Auto-Registration

Registration at any Network data holder uses [RFC 7591 Dynamic Client Registration](https://www.rfc-editor.org/rfc/rfc7591) as the shared wire format. A client presents a signed software statement at the `/register` endpoint as the `software_statement` parameter. RFC 7591 is the mechanism; the software statement is the trust signal. Different issuers of software statements represent different trust paths — they share the same wire format but are not interchangeable.

**CMS-signed software statements** can streamline dynamic registration for *many kinds of clients* — patient-facing apps, payers, providers, delegated tech solutions, and networks acting as clients — without requiring CMS to operate a CA or issue X.509 certificates. A CMS-signed software statement is a short-lived JWT (e.g., 24-hour TTL) signed by CMS that asserts a client's status in a CMS-maintained registry and binds it to a verified `jwks_uri`. A receiving authorization server can accept it without per-network re-vetting. To date, CMS's most concrete commitment is listing patient-facing apps in the **Medicare App Library** — that is an important and well-scoped starting point. The architecture of this spec does not treat it as the ceiling: as CMS extends registry coverage to other actor types, the same mechanism applies. See Josh Mandel, "Software Statements for the Medicare App Library," May 26, 2026.

A Network **MUST** accept a valid CMS-signed software statement as sufficient for dynamic client registration, without additional per-network vetting, for any client type for which CMS has published a registry and issued a statement.

> **⚠ CONTESTED — Architecture Decision**
>
> **Should UDAP / X.509 remain as a required or alternate dynamic registration path?**
>
> [UDAP](https://www.udap.org/udap-ig-b2b-health-apps) is a specific profile of RFC 7591 dynamic client registration that uses X.509 certificates issued by a trust-community CA. It addresses the same core problem as CMS-signed software statements — enabling a client to be recognized across multiple Data Holders without bilateral out-of-band agreements — but via a CA-anchored certificate chain rather than a CMS-issued JWT. Having two mechanisms that address the same problem creates implementation complexity.
>
> The question of whether UDAP / X.509 should remain a required path, an optional path, or be superseded by CMS software statements as CMS registry coverage grows is unresolved and must be decided by the working group before this section is finalized.

All recognized credential types reduce to RFC 7591 plumbing at the receiving authorization server. The server **SHOULD** route signature validation by issuer: CMS published JWKS for CMS-signed software statements; UDAP trust community CA chain for UDAP software statements (if UDAP is retained as a recognized path).

When a participant has been onboarded by one home Network using a recognized credential type, every other Network **MUST** register that participant on a defined timeline without redundant onboarding.

The timeline is set by the CMS Interoperability Framework.

A Network **MUST NOT** impose duplicative trust gating on top of the federally grounded credentials. Operational coordination (abuse contacts, rate-limit, security procedures, support channels) **MAY** be coordinated.

Manual registration **MAY** be supported up until the deadline of October 1, 2026, at which time all participants in the HTE **MUST** support auto or dynamic registration.

### 7.2 Presumptive Eligibility

A participant that has met its trust requirements and is in good standing on one home Network **MUST** be allowed by other Networks to operate for a default **90-day** presumptive-eligibility period without redundant onboarding.

After 90 days, presumptive eligibility transitions to ongoing recognition unless there is specific cause to suspend.

Three conditions are required:

1. The participant meets the trust requirements applicable to its actor type.
2. The home Network's onboarding establishes that the participant works in production.
3. The participant is in good standing on the home Network.

A Network **MAY** suspend presumptive eligibility for cause, including operational abuse, security incidents, or a good-standing downgrade on the home Network. A Network that suspends **MUST** report the suspension to NPD and to the home Network.

---

## 8. Authentication

Authentication establishes that the party making a request is who they claim to be. The model differs between patient-facing (B2C) and system-to-system (B2B) flows. A Network, and every EHR or data holder it routes to, **MUST** respond to authorized queries from properly credentialed parties without requiring portal login as a precondition — the credential models below are the accepted authentication path; portal login is not.

### 8.1 Patient Access — B2C (IAL2 + SMART App Launch)

For patient-directed access, identity is established via IAL2 identity verification through a CMS-approved credential service provider (CSP) — such as CLEAR or ID.me — combined with app authorization via SMART App Standalone Launch.

**Reference Implementation — IAL2 with Manual Authorization (SMART App Standalone Launch)**

This flow modifies the SMART App Launch v2.2.0 Standalone Launch pattern to support IAL2
patient identity. Three trust pillars are required:

1. **Patient Authentication (IAL2).** The patient is identity-proofed by a CMS-approved CSP
   (e.g., CLEAR, ID.me, or a state-issued digital ID card). The CSP issues a high-assurance
   `id_token` cryptographically proving the patient's verified identity.

2. **Application Authentication (Asymmetric).** The trusted app uses Private Key JWT
   authentication (RS384 or ES384). The app publishes a JWKS URL; the authorization server
   validates the app's signature against the corresponding public key.

3. **Patient Consent (Authorization Server UI).** Because the IAL2 token establishes identity but
   not authorization, the authorization server renders its native SMART App Launch consent UI
   so the patient explicitly approves the requested granular FHIR scopes. No portal login is
   required — the login screen is bypassed because the IAL2 `id_token` is already present.

**Flow summary**

The app generates a `client_assertion` JWT (signed with its private key) that nests the CSP-issued
IAL2 `id_token` within a `cms_smart` extension (`version: "2"`, `purpose_of_use: "PATRQT"`). The
authorization request MUST use `POST /authorize` (`application/x-www-form-urlencoded`) — GET
is not permitted because the nested token makes the payload too large for a query string (risk of
HTTP 414). The authorization server validates the app's signature via its published JWKS and
validates the IAL2 `id_token`, then bypasses the login screen and renders the consent UI. After
the patient approves the requested FHIR scopes, the server issues an authorization code. The
app exchanges it via `POST /token` with PKCE (`code_challenge_method: S256`) and a fresh
`client_assertion`.

This flow is the current reference pattern for SMART App Standalone Launch. The `cms_smart`
extension is updated to version "2" under § 9.2.1 to accommodate a consent artifact — the
login-bypass mechanism described here remains unchanged.

### 8.2 Provider and Payer Access — B2B

For system-to-system access by providers and payers, authentication uses the payer-initiated B2B integration pattern grounded in the trust signals established at registration (§ 7). The current reference implementation uses UDAP B2B flows; whether UDAP remains the required mechanism or is joined or superseded by CMS-signed software statements for B2B client types is an open architectural question — see § 7.1.

**Reference Implementation — B2B System-to-System Integration**

**Primary pattern — SMART Backend Services + direct FHIR queries**

All system-to-system B2B access uses SMART on FHIR Backend Services (OAuth 2.0 Client
Credentials Grant). The requesting system authenticates to the data holder's authorization
server by presenting a signed JWT client assertion against a published JWKS, obtains a
short-lived access token, and queries the data holder's FHIR API directly using standard
RESTful requests (e.g., `GET /Patient/{id}`, `GET /Observation?patient={id}`). No user-facing
login is involved.

This pattern is the floor for all B2B use cases — treatment, payment, operations, prior
authorization, and payer-to-payer.

**Optional — CDex Task pattern for payer-initiated attachment requests**

For use cases requiring asynchronous, payer-initiated clinical attachment requests (e.g.,
claim attachment workflows under CMS-0057-F), the HL7 CDex FHIR Task pattern MAY be
used in place of direct synchronous queries. Under this pattern the network acts as
intermediary: the payer submits a CDex-profiled FHIR Task to the network (`POST /Task`),
the network performs a governance check and fulfills the task by querying the provider's
FHIR API, then delivers the result to the payer via `POST /$submit-attachment`. Each
leg uses the same SMART Backend Services authentication described above.

**Standards:** SMART on FHIR Backend Services, OAuth 2.0 Client Credentials Grant, HL7 FHIR
RESTful API, HL7 CDex (optional, for asynchronous attachment workflows).

> **TODO:** The following are not specified for the B2B flow and must be defined before implementation: access token lifetime, refresh token behavior, credential rotation requirements, error handling on authentication failure, and retry policy.

---

## 9. Authorization

### 9.0 Required Precondition: Network-Mediated Record Location

Patient access depends first on record location.

Every CMS-Aligned Network **SHALL** support network-mediated record location or source discovery for patient access.

For July 4, 2026:

1. A CMS-recognized patient-facing app listed in the CMS Medicare App Library **SHALL** be able to initiate record location through each CMS-Aligned Network or through its CMS-Aligned Network.
2. The app **SHALL** authenticate as itself via a CMS-signed software statement from the CMS Registry (proposed solution under review — see § 7.1).
3. The app **SHALL** present a valid IAL2 patient identity token from a CMS-approved digital identity service provider (CSP).
4. The network **SHALL** process the record-location request based on app authentication and IAL2 patient identity alone, subject to patient matching, applicable law, and security controls.
5. The patient **SHALL NOT** be required to interact separately with the network or its data holders to complete record location.
6. The patient **SHALL NOT** be required to know which providers, payers, facilities, or networks hold their records before initiating discovery.
7. Each CMS-Aligned Network **SHALL** respond for the participating data holders it represents.
8. The record-location response **SHALL** provide enough information for the app to pursue patient-access data retrieval through the applicable patient approval path below.
9. The CMS-recognized patient-facing app (directly or through its CMS-Aligned Network) maintains audit logs covering the scope and duration of the individual's authorization to the app to continue retrieving their data.

### 9.1 Required Conditions for All Paths

Every access path **SHALL** satisfy all four of the following conditions before data retrieval may proceed. Each path below lists only what that path additionally requires beyond this shared foundation.

1. The app is recognized by CMS or listed through a CMS-recognized app process and maintained within a CMS registry.
2. The app authenticates as itself through a mechanism accepted by the network or data holder (proposed solution under review: CMS-signed software statement from CMS Registry — see § 7.1).
3. The app presents a valid IAL2 patient identity token.
4. The request indicates that the purpose is HIPAA right of patient access, using the purpose-of-use code `PATRQT` as adopted for the ecosystem.

### 9.2 Patient Authorization Paths

#### 9.2.1 Path 1 — Preferred: CMS-Recognized App + IAL2 Patient Identity (SHOULD)

Pledged Networks, EHRs, and data holders **SHOULD** support this path, in which a CMS-recognized patient-facing app in good standing can obtain patient-access FHIR API tokens without separate app onboarding at each data holder and without provider portal login.

All four conditions in § 9.1 apply. Additionally, under this path:

5. The app requests access to the data needed for the patient's use case or as specified by the patient, consistent with the data holder's supported FHIR capabilities.
6. The data holder or network approval service issues a FHIR API token for the requested and supported access, subject to applicable law, patient matching, local restrictions, supported capabilities, and security controls.
7. The patient is not required to use a provider portal, create a site-specific account, or know which provider holds which records.
8. The app is not required to complete separate developer onboarding with data holders (registration steps may occur at the network or EHR level).

For July, the trust basis is CMS app recognition, app authentication, IAL2 patient identity, patient-access purpose, requested access, and auditability.

This path places meaningful trust in CMS-recognized apps. That trust **SHOULD** be paired with monitoring, good-standing review, auditability, and post-July work toward stronger approval artifacts.

**Consent Artifact for Path 1**

To support path 1, the `cms_smart` extension is updated to version "2" to include a `consent_reference` element carrying a FHIR Bundle that represents the patient's recorded preferences. The bundle **SHALL** contain:

| Element | Cardinality | Requirement |
|---|---|---|
| Consent | 1..1 | Consent resource outlining the permission/denial characteristics |
| Patient | 1..1 | US-Core Profiled Patient Resource. **SHALL** be referenced by the Consent resource and contain an identifier with system = `iss` and value = `uuid` from the corresponding `id_token`. Data holders **SHALL** validate the system/value combination. |
| QuestionnaireResponse | 1..1 | Response to items on the CMS-hosted consent questionnaire (linked by `linkId`) |
| Provenance | 1..1 | Provenance referencing the Consent resource |

The `cms_smart` extension for Path 1 requests:

| Element | Optionality | Requirement |
|---|---|---|
| `version` | Required | Fixed string value: `"2"` |
| `purpose_of_use` | Required | Fixed value: `"PATRQT"` |
| `consent_policy` | Optional | Not defined for initial implementation |
| `consent_reference` | Required | Bundle as described above |
| `id_token` | Required | CSP-issued ID token containing identity assertions. **MUST** be IAL2. |

**Sensitive and Restricted Data**

"Sensitive / Restricted Information" means information whose disclosure or retransmission may be restricted by the Data Holder's information security policies, including restrictions arising from applicable federal, state, local, tribal, or territorial laws and regulations.

An Application **MAY** request a patient's consent to access Sensitive / Restricted Information. If an Application obtains such consent, it **SHALL** communicate the result to the Data Holder in the access token request using a Consent resource. If an Application does not request consent for Sensitive / Restricted Information, the Consent resource **SHALL** contain a provision indicating denial of access to restricted information.

A Data Holder **SHALL** treat a positive consent conveyed through a Consent resource as authorization to disclose Sensitive / Restricted Information, except where disclosure is prohibited by applicable laws or regulations.

If an access token request does not include a Consent resource conveying positive consent for Sensitive / Restricted Information, the Data Holder **MAY** withhold or exclude such information.

**Alternative to Consent Artifact: SMART Permission Tickets (under review)**

As an alternative to the `cms_smart` consent bundle, a network or CMS-recognized issuer **MAY** issue a SMART Permission Ticket — a signed JWT that binds the patient identity, the requesting app, the authorized FHIR scopes, and an expiration. Data holders that receive a valid SMART Permission Ticket **MAY** issue a FHIR API token without a per-data-holder authorization screen. The specific ticket profile and issuance mechanism are under working group review; the spec will be updated when a profile is adopted.

#### 9.2.2 Path 2 — Allowed Alternative: Network-Level Consolidated Patient Approval (MAY)

If a data holder cannot meet all criteria of Path 1, it **MAY** rely on a network-level consolidated patient approval flow. All four conditions in § 9.1 apply. Additionally:

5. The approval applies across participating data holders within that network.
6. The patient is not required to complete a separate approval screen for every data holder. Patients **SHOULD** be able to approve access to all FHIR resources by default (preferably "select all, uncheck by exception").
7. The network conveys enough information about the patient's app for participating data holders to evaluate and trust that this app was the patient's choice.
8. The network logs the approval and access events for audit and patient transparency.

This path will be allowable through December 31, 2026 and will **NOT** be supported after that date.

#### 9.2.3 Path 3 — July Bridge: Data Holder-Specific Patient Approval (MAY)

A data holder **MAY** rely on a data holder-specific patient approval flow as a July bridge. All four conditions in § 9.1 apply. Additionally:

1. The data holder **SHALL NOT** require portal credentials.
2. The approval screen **SHOULD** be limited to approving the app and requested access.
3. The app **SHALL NOT** be required to complete separate developer onboarding per-data-holder in the network.
4. The data holder or network **SHALL** identify what would be needed to move beyond the July Bridge path.
5. If an application has obtained blanket consent from a patient for access to their entire health record, the application **MAY** automate authorization screens returned by data holders for that patient.

This path **MUST** be sunset by November 1, 2026. It should not be treated as the target ecosystem pattern.

### 9.3 Required July Outcome

By July 4, 2026, a CMS-recognized patient-facing app in good standing, acting for an IAL2-verified patient, **MUST** be able to:

1. Discover where the patient has records across CMS-Aligned Networks.
2. Request patient-access FHIR API tokens from participating data holders.
3. Retrieve supported patient data through FHIR APIs.
4. Do so without provider portal login as the primary access path.
5. Do so without separate developer onboarding at every data holder.
6. Produce audit records sufficient for patient-facing transparency.

Networks and data holders **SHALL** document which patient approval path they support. Networks and data holders **SHOULD** report adoption metrics by path so CMS and the ecosystem can see where bridge patterns remain.

### 9.4 Post-July Direction

After July, CMS and working groups **SHOULD** focus on higher-assurance approval mechanisms that reduce reliance on data-holder-specific screens. Candidate approaches include:

- CSP-assisted approval claims: a credential service provider participates in conveying that the patient approved a specific app to request access.
- SMART Permission Tickets: a trusted issuer (network, CSP, or CMS-recognized authority) issues a signed artifact that the app presents to data holders.
- Network-issued portable approval artifacts: a CMS-Aligned Network operates the consolidated approval flow and issues a portable artifact that participating data holders can validate.

The long-term target is a cross-ecosystem pattern where the patient proves identity once, chooses an app, the app discovers records across CMS-Aligned Networks, and data holders can evaluate a trusted approval signal without portal login or repeated site-specific burden.

### 9.5 Token Validation Requirements

#### On Authorization

- A data holder responding to an IAS request that contains an `id_token` **SHALL** verify the relationship between the audience (`aud`) of the `id_token` and the presenting application. *(Specifics to be added depending on cert vs. software statements route choice.)*
- The data holder **SHALL NOT** issue an access token if the incoming `id_token` contains an `auth_time` claim indicating the original user authentication occurred more than 300 seconds prior to the current request.
- To prevent replay attacks, the data holder **SHALL** validate the identifier of the `id_token` for uniqueness. The data holder **SHALL NOT** accept an `id_token` if the combination of the JWT ID (`jti`) and Issuer (`iss`) claims has already been processed within the token's validity window.

#### Access Tokens and Refresh Tokens

1. Access tokens issued by a data holder **SHALL** support renewal via refresh tokens on a rolling 90-day basis.
2. The rolling 90-day expiration window **SHALL** reset upon each successful token refresh.
3. Access tokens **SHALL** have a valid lifetime no greater than one hour.

---

## 10. Query / Data Exchange

> **TODO** § 10.3 Purpose of Use Propagation below straddles Authorization and Query / Data Exchange. The PoU declaration requirement and the code table arguably belong in Authorization (§ 9) as a gate on access; the propagation rule ("PoU MUST travel with the request to downstream systems") and the MUST NOT impose additional requirements sentence arguably belong here as query-handling rules. The subsection has been left in § 10 pending a reviewer decision on where the cut falls.

### 10.1 Respond Completely

When a query is authorized, the response **MUST** include all relevant data the responder holds for the patient, structured and unstructured, within the applicable Use Case.

The minimum data scope for structured data is **USCDI v3** (or the version current at the time of the query, as specified by the CMS Interoperability Framework). Unstructured artifacts within USCDI v3 scope (clinical notes, scanned PDFs, imaging reports, encounter documents) **MUST** be included where they exist. Artifact types beyond USCDI v3 scope (faxes, ambient listening recordings) **SHOULD** be included where they exist and where a standard exchange mechanism is available.

> **NOTE**
>
> No standard currently exists for exchanging ambient listening recordings (e.g., wav/mp3 via DocumentReference). Many organizations do not persist recordings after transcription is complete. The exchange profile for ambient recordings is TBD. "Faxes" means a document-formatted copy (e.g., PDF) where one exists — raw fax transmission is not required.

USCDI v3 defines the **superset** of data elements that a Network and its Data Holders must be capable of returning — it is not a guarantee that every element is returned on every call. The actual data in any given response is a subset determined by three factors:

- **The specific query.** A request for a particular FHIR resource type (e.g., `MedicationRequest`) returns only that resource, not the full USCDI element set.
- **Authorized scopes.** The requesting app's granted scopes constrain which resource types and fields are accessible in that session. Scopes are granted and validated by the **Data Holder's authorization server** — the Network is not the source of truth for what an app may access.
- **Use-case-specific constraints.** Some use cases carry inherent limits on the data window — for example, a payer may be restricted to clinical data supporting claims from the last 60 days, or to data associated with a specific encounter, even when it holds broader USCDI access rights.

"Supports USCDI v3" means the capability is present and conformant; it does not mean all USCDI elements are returned on every call.

> No use case becomes a dead end.

### 10.2 Use Case Coverage

A Network **MUST** respond to queries from the actor categories that apply to the use cases its participants engage in:

- patients seeking their own records;
- providers requesting clinical and claims data for treatment;
- payers (where applicable) requesting clinical data supporting claims from the last 60 days;
- payers querying for quality measure reporting;
- prior authorization queries (subject to CMS-0057-F deadlines).

If a network's participants engage in a use case, the network **MUST** support queries for that use case.

### 10.3 Purpose of Use Propagation

Every data request **MUST** declare why the data is being accessed. A Network **MUST** support the HL7 Purpose of Use code set and apply the correct disclosure rules to each category.

The following codes are **REQUIRED**, aligned to the approved use cases in § 10.2:

| Code | Display | Level | Use case |
|---|---|---|---|
| `PATRQT` | Patient request | Granular | Patient access |
| `TREAT` | Treatment | High level | Treatment |
| `HPAYMT` | Healthcare payment | High level | Payment (including claims) |
| `CLMATTCH` | Claim attachment | Granular | Claim attachment within payment |
| `HOPERAT` | Healthcare operations | High level | Health care operations |
| `HQUALIMP` | Healthcare quality improvement | Granular | Quality measure reporting within operations |

Purpose of use **MUST** travel with the request to downstream systems.

When the requesting party is trusted and the purpose of use is properly declared, a Network and its participants **MUST NOT** impose additional authorization requirements on top. However, patients **MAY** restrict the data categories an app can access, and a Network **MUST** honor those restrictions. Patient-scoped restrictions are defined in § 9 (Authorization) and take precedence over this requirement.

### 10.4 Patient-Contributed Data

Patient-contributed data (patient-reported outcomes, notes, home device readings, lifestyle data) is a planned Phase 2 capability. The write-side obligations — data holder acceptance, format, tagging as patient-contributed, deduplication, and review workflows — are not yet specified and are deferred from v0.3.

Networks and data holders **SHOULD** design their APIs to accommodate future patient-write flows. Patient choice governs whether patient-contributed data flows when this capability is implemented.

---

## 11. National Provider Directory Publication

A Network **MUST** publish to NPD:

- its onboarded participants (apps, providers, payers, delegated tech solutions), where "providers" means both provider organizations and individual practitioners affiliated with those organizations;
- its participants' endpoints in a form that supports Pathway 3 (targeted query by identifier);
- its inter-network connections;
- usage metrics by participant and by use case;
- trust-anchor metadata sufficient for validating any recognized software statement type — specifics are contingent on the architectural decision in § 7.1 (see NOTE below).

> **NOTE**
>
> The trust-anchor metadata requirement above is contingent on the resolution of the UDAP architectural question in § 7.1. If UDAP is retained as a required path, NPD **MUST** publish the trust community CA URL and any intermediate CA certificates recognized by the CMS-Aligned framework. The specific metadata schema, certificate format, and refresh cadence are deferred until § 7.1 is resolved by the working group. Until that decision is made, this bullet imposes no concrete implementation obligation beyond publishing whatever trust-anchor metadata corresponds to the software statement types the working group adopts.

> **NOTE**
>
> Networks that onboard at the organizational level — and do not directly contract with individual practitioners — satisfy the individual practitioner publication requirement by publishing their onboarded provider organizations with NPI cross-references to the corresponding individual practitioner records in NPPES. A Network is not required to independently verify or replicate individual practitioner data that is already authoritatively maintained in NPPES; it **MUST** publish enough metadata (organization NPI, affiliated practitioner NPIs where known) to support targeted queries by NPI under Pathway 3. Where a network does not hold individual practitioner affiliation data, it **SHOULD** publish that gap alongside its organizational records so queriers know to fall back to NPPES for practitioner-level resolution.

A Network **MUST** ingest and publish updates routinely. The ingest/refresh cadence is specified by the CMS Interoperability Framework. This requirement is contingent on CMS providing a scalable NPD ingestion API — see Appendix A, item A7. Until that API is available, Networks **SHOULD** manually submit updates via CMS's current flat-file process.

NPD **MUST** also be queryable by any Network, auditor, or participant to confirm an actor's listing and credentials. Trust travels with the actor because it is anchored in NPD as a public, queryable record that any Network can read without bilateral verification.

---

## 12. Audit Logging

A Network **MUST** produce audit logs for queries on its network, including:

- who accessed the data;
- when;
- for what declared purpose of use;
- which organizations were involved.

Audit logs **MUST** be organization-level at minimum. Audit logs **MUST** be kept for a minimum of 7 years, or longer if required by applicable law (45 CFR 164.530(j)).

A Network **MUST** facilitate patient-facing audit access so patients can see, through their app, who queried their data. Implementations **MUST** conform to the IAS Audit Log API Specification (v1.0, February 2026), which defines the FHIR AuditEvent resource model, IAL2 OIDC token-based patient authentication, and endpoint discovery via RLS and NPD.

> **NOTE**
>
> Patient-facing audit coverage is scoped to network-mediated queries — those passing through an RLS endpoint (Pathways 1 and 2). Point-to-point queries under Pathway 3 are excluded from this requirement because the network is not in the query path and cannot produce a log of traffic it never sees. This limitation is explicitly acknowledged in the IAS Audit Log API Spec (§1.2): "Point-to-point transactions that do not flow through an RLS" are out of scope. Endpoint-level audit obligations for Pathway 3 are governed by the data holder's own HIPAA audit requirements, not this section.

EHRs facilitating ecosystem queries are subject to the same audit obligations as the Network routing through them.

---

## 13. Security

A Network MUST maintain HITRUST certification, scoped to the network's production environment that creates, receives, maintains, or transmits PHI on behalf of participants. This includes, at minimum, identity verification token validation, query routing, audit log generation, and patient matching reference data storage. Corporate functions that do not touch PHI are out of scope.

HITRUST certification does NOT replace compliance with HIPAA, the Privacy Act, or applicable federal and state privacy and security laws.

Business Associate Agreements (BAAs) MAY be required even where data is not directly brokered (for example, when a participant queries an RLS endpoint under Pathway 3). Networks and participants MUST confirm their BAA obligations under HIPAA.

---

## 14. Fees and Economics

### 14.1 Patient-Directed Access

A Network **MUST NOT** structure fees in a way that gates a patient's federal right to access their own data.

The Fees exception at [45 CFR 171.302](https://www.ecfr.gov/current/title-45/part-171/section-171.302) and the ONC information blocking framework establish this floor. Cost recovery is permitted; platform fees structured to defeat patient access are not.

### 14.2 Above the Floor

A Network **MAY** set its own commercial terms for:

- premium services beyond baseline;
- prior-authorization service offerings under CMS-0057-F;
- voluntary commercial peering arrangements with other Networks;
- value-added integration services.

### 14.3 Inter-Network Settlement

For patient-directed access traffic, inter-network settlement is **NOT** appropriate.

For other traffic types (treatment, payment, operations, prior auth, payer-to-payer), Networks **MAY** negotiate commercial peering arrangements with settlement, transit fees, or other terms above the federal floor.

> **Open question.** Whether a Network may charge a data holder per query for required HTE use cases, and whether a Network may charge a payer per query against a provider on the Network, is not resolved in source documents. See Appendix A.

---

## 15. Accountability

A Network is accountable to CMS for meeting the obligations in §§ 3–14. Persistent failure is grounds for delisting from CMS-Aligned status on the same footing as failing any other Framework criterion.

A Network **MUST** publish operational metrics (response rates, query volumes, response times by use case) so apps and data holders can comparison-shop and so CMS can monitor adoption and performance. Network performance metrics appear in CMS scorecards (Framework criterion #19).

Outages and partial responses happen; the obligation is to meet published response standards over time, not to be perfect.

---

## 16. July 4, 2026 Framework Requirements

By **July 4, 2026**, a Network **MUST** satisfy all four requirements below, as specified in the CMS Interoperability Framework.

### 16.1 FHIR API Access

A Network **MUST** provide or facilitate access to data using FHIR APIs that adhere to the [HL7 FHIR US Core Implementation Guide](https://hl7.org/fhir/us/core), including:

- a complete and valid FHIR Capability Statement;
- USCDI v3 (or later) data elements with terminology compliance — laboratories coded in LOINC, medications in RxNorm, conditions in SNOMED CT.

A Network **SHOULD** leverage [FHIR Bulk Data Exchange](https://hl7.org/fhir/uv/bulkdata) to reduce stress on existing systems and enable the exchange of full data records.

### 16.2 Chart Notes and Clinical Documents

A Network **MUST** return chart notes and clinical documents — including radiology reports, scanned or faxed labs, and external specialist notes — in human-readable formats (PDF, TIFF, JPG) as FHIR attachments, as specified in USCDI v3. Ambient listening recordings **SHOULD** be returned where they are persisted and a standard exchange mechanism is available; the exchange profile for ambient recordings is TBD.

### 16.3 Appointment and Encounter Notifications

A Network **MUST** provide appointment and encounter notifications for outpatient, telehealth, emergency department, and inpatient encounters using FHIR Subscriptions, where such notifications are permitted by existing law.

> **Deferred — Not in Scope for July 4, 2026**
>
> Appointment and Encounter Notifications (§16.3) are not included in the July 4, 2026 GA requirements. The Notifications working group has not met in several months due to unresolved questions on network design and structure. This criterion will be revisited once the home-network architecture question (see §2, Terminology — Home Network contested decision) reaches consensus. Networks are not required to implement §16.3 for initial CMS-Aligned recognition.

### 16.4 Record Locator Service

A Network **MUST** implement record locator functionality by collaborating with CMS to determine efficient and timely models that:

- reduce query load on the networks;
- aid understanding of data completeness.

Requests to the record locator service **MUST** be initiable by patients, providers, payers, and value-based care organizations.

## 17. Rules of the Road Attestation

> **Placeholder.** The Rules of the Road Attestation are being discussed in the CAN Admin/Ops group and will be input into this document, or another companion guide, when they are complete.

---

## Appendix A. Open Questions

These are gaps identified in source materials that this draft does not resolve. They are flagged here so working-group attention can converge.

| # | Open Question | Source |
|---|---|---|
| A1 | Wire profile of the standardized RLS / federation endpoint (transport, authentication, payload schema for `$match` requests and responses). | Framework defers; Connectivity Pathways doc notes this is the baseline interface but the operational profile is not fixed. |
| A1b | Wire profile for brokered FHIR retrieval under Pathway 2 — how a network broker aggregates responses from multiple RLS endpoints and returns them to the requesting Network (payload shape, error handling, partial-response semantics). | Introduced by the shift from federated-only to dual retrieval modes in Pathway 2; not yet specified. |
| A2 | Mechanism for preventing endpoint-spamming under Pathway 3 (geo-search constraints, rate limits, query-shape rules). | Connectivity Pathways doc explicitly raises this as an unresolved question. |
| A3 | Whether networks may charge data holders per query for required HTE use cases, and the same for payer-to-provider queries. | Workgroup Alternative Proposal § 2.3 — raised but not resolved by CMS in source materials. |
| A4 | Definition and scope of the "on-ramp" intermediary role: separate ecosystem role or contracted vendor of the participant? | Workgroup Alternative Proposal § 2.2 — raised but not resolved. |
| A5 | Operational profile for auto-registration timeline and the exact handoff between home-network onboarding and presumptive eligibility at receiving networks. | HTE Reference doc Part II — "defined timeline" referenced but not specified. |
| A6 | Whether a single "Rules of the Road" document signed by all Networks is the right vehicle for cross-network operational standards, or whether criteria-based participation is sufficient. | Workgroup Alternative Proposal § 3.1 vs. HTE Reference doc Part I — disagreement; CMS chose criteria-based. |
| A7 | NPD ingest/refresh cadence, schema, and authoritative trust-registry behavior. NPD currently operates as a static web file requiring manual flat-file submissions — there is no API for routine programmatic ingestion. The MUST in § 11 to ingest and publish updates routinely cannot be met at scale without a CMS-provided ingestion API. This item must be resolved before § 11 can be implemented as written. | HTE Reference doc Part II references publication but the operational profile is open. |

---

## Appendix B. Source Documents Used to Build This Draft

This draft was synthesized from three internal working documents and one public CMS resource. No external sources were invented.

- **HTE Network Framing Combined Reference (V2 draft).** Part I (the case for the HTE architecture), Part II (Rules of the Road), Part III (trust framework diagram). Internal working document.
- **Connectivity Pathways for Discovery.** Internal working document defining four pathways; this spec adopts three required pathways and one optional pathway (§ 5.4).
- **CMS Networks Workgroup — Meeting Summary and Alternative Ecosystem Proposal.** Internal working document. The alternative was not adopted; cited here for gap identification only.
- **CMS Interoperability Framework.** <https://www.cms.gov/health-technology-ecosystem/interoperability-framework>

---

## Appendix C. Normative References

References below appear in source materials. None are invented.

- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) — Key words for use in RFCs to Indicate Requirement Levels.
- [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) — Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words.
- [RFC 7591](https://www.rfc-editor.org/rfc/rfc7591) — OAuth 2.0 Dynamic Client Registration Protocol.
- [HL7 FAST Security Implementation Guide (HL7 FAST UDAP IG)](https://hl7.org/fhir/us/udap-security/) — Unified Data Access Profiles for B2B Health App Authorization, published through HL7 as the recognized SDO; defines the X.509-anchored software statement used by payers, providers, and networks.
- [ONC 21st Century Cures Act Final Rule](https://www.healthit.gov/curesrule).
- [USCDI v3](https://www.healthit.gov/isa/united-states-core-data-interoperability-uscdi).
- [HL7 FHIR US Core](https://hl7.org/fhir/us/core).
- [CMS-0057-F — Advancing Interoperability and Improving Prior Authorization Final Rule](https://www.cms.gov/newsroom/fact-sheets/cms-advancing-interoperability-and-improving-prior-authorization-processes-final-rule-cms-0057-f).
- [ONC Information Blocking](https://www.healthit.gov/topic/information-blocking).
- [45 CFR 171.302 — Fees Exception](https://www.ecfr.gov/current/title-45/part-171/section-171.302).

---

*End of draft.*
