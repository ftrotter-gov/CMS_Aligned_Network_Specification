# Apps Don't Need a Home Network

**Position paper for the CMS-Aligned Network working group**
*Companion to [can-spec.md](can-spec.md) §2 ("⚠ CONTESTED — Architecture Decision") — this is the Camp B case, argued in full.*

---

## TL;DR

The "home network" is an additional concept in the mix that adds complexity without earning its keep. An app's listing in the CMS App Library — backed by the certifications and reviews already required for admission — should carry the **authority to connect to any CMS-Aligned Network**, with no additional vouching step in between. If CMS believes more criteria are needed before an app deserves that authority, the right place to add them is the Library's terms of participation, where they apply once and travel everywhere — not a per-network vouching process reinvented N times.

Below: CMS's two stated rationales for home networks and the mechanisms that serve each one better, the app-developer-burden argument, and concrete spec deltas.

**Scope.** This case is argued for patient-facing apps, because that is where CMS registry coverage (the Medicare App Library) concretely exists today. The same logic extends to other actor types as CMS registry coverage grows; see [Scope and generalization](#scope-and-generalization).

---

## What the home network actually does in the current spec

In the current draft, the home network is:

1. **An onboarding gate** — the place where an app is vetted before it may operate (§4.3, §7.2).
2. **A good-standing oracle** — the party that reports the app's operational status to other networks and to NPD (§4.2).
3. **A production-readiness attester** — §7.2 condition 2: "the home Network's onboarding establishes that the participant works in production."
4. **A trust anchor for cross-network queries** — other networks respond "because the home Network vouches for the app — not because they have a direct relationship with it" (§2, Camp A description).
5. **An implied economic role** — the one party permitted a direct commercial relationship with the app.

All five functions are real; none of them requires a designated home network, and several are performed *worse* by one.

A home network in the request path also carries a protocol cost the rest of the architecture would have to bear: every authorization server and data holder receiving a request made with or on behalf of an app must learn both identities: the network transporting the request and the app the patient actually chose, since the app is what patients recognize and what audit logs must show. Every trust surface in the ecosystem would need that dual-identity bookkeeping. Remove the intermediary and the bookkeeping disappears.

---

## CMS's rationale 1: "Someone needs to check the app's technical conformance and compliance"

Agreed that someone does. The question is whether that someone should be **each network, separately, with a process of its own design** — or a **shared, open, federally anchored bar that every network can rely on**.

The home-network model gives us the first. Every network that wants to serve as a home develops its own vetting process: its own test plan, its own evidence requirements, its own reviewers, its own renewal cycle. These processes will measure roughly the same things, none will be portable, and an app's "passing grade" will mean something slightly different at each one. Health IT has run this experiment before: duplicated effort and cost, with no added assurance.

The alternative already exists in working form:

- **Open reference test kits.** ONC's [Inferno](https://inferno.healthit.gov/) demonstrated the model: a public, executable definition of conformance that any party can run and any party can verify the results of. The CMS ecosystem should have the equivalent for its profiles (dynamic registration, SMART Backend Services-style token issuance with IAL2 identity evidence, the `$rls` interaction). A test suite that is open source and self-service is *strictly better* evidence of technical conformance than a network's bespoke review, because it is reproducible, versioned, and identical for everyone.
- **Certification by recognized bodies.** Groups like DirectTrust, the CARIN Alliance, and DiME already operate certification programs — including ones apps already need to enter the CMS App Library and the broader health tech ecosystem today. "Passed the reference test suite, attested by a recognized certifying body" is a federally legible signal. CMS's Library admission criteria already lean on exactly this machinery (identity verification, FHIR R4, SMART on FHIR, independent review by a recognized vetting partner).
- **The Library's terms of participation as the extension point.** If experience reveals that some additional check matters — security posture, support responsiveness, data-handling attestations — CMS adds it to Library admission or renewal criteria. It applies once, uniformly, with public criteria and an appeal path, and the result is visible to every network through the app's Library status (and verifiable through a [CMS-signed software statement](https://www.linkedin.com/pulse/software-statements-medicare-app-library-josh-mandel-md/)).

The result is **one open bar, tested once, recognized everywhere**.

---

## CMS's rationale 2: economics — "the home network is how costs get covered"

This is the rationale worth the most scrutiny, because the underlying problem is real and unsolved: serving queries costs money, and CMS has (rightly) said both that **apps should not have to pay each network they connect to** and that **networks cannot charge for individual patient access** (§14.1, §14.3: inter-network settlement is not appropriate for patient-directed traffic).

But notice what the home-network model does to that picture. If the only permitted commercial relationship is between an app and its home network, then:

- **The asymmetry gets worse.** The home network bears onboarding and support costs for its apps, while every *other* network is obligated to answer those apps' queries (§4.1, §4.3) and is forbidden from charging anyone for the patient-access traffic. Non-home networks do the serving; the home network holds the only revenue relationship. That is a structural subsidy from every other network to the home network.
- **The home role only makes business sense as a tollgate or as vendor capture.** Why would a network volunteer to be a home? Either it charges apps for the privilege (recreating the per-network fee CMS says it doesn't want, just concentrated at one gate), or being the home *is the product* — the platform's business model is sitting between apps and the ecosystem. Neither outcome is one CMS should encode into architecture.
- **It doesn't actually fund the queries.** The cost that matters at scale is data holders and networks serving patient-access traffic. A home-network fee paid by an app to one network does nothing for the other networks serving that app's queries. The funding problem is untouched.

Funding for patient-access infrastructure remains an open problem with or without home networks. Two directions that address it without a gatekeeper:

- **Cost-based structures**, if and when needed, designed deliberately (the way 45 CFR 171.302 frames permitted cost recovery) rather than emerging accidentally from a gatekeeping role.
- **Data holders underwriting network access as a cost of participation** — the same way providers underwrite patient-facing SMART on FHIR access from their own sites today under the Cures Act Final Rule. Provider organizations already fund the API surface that serves *their* patients; network access is the same obligation at one remove.

Either way, the design pressure should be toward **driving the overall cost structure down** — shared open test kits, automated registration, commodity infrastructure — rather than adding tollgates whose operators have every incentive to keep costs (and their margins) up.

---

## The burden argument: "app developers shouldn't have to connect to everything themselves"

This is the strongest argument offered for home networks, and its goal is correct. A solo developer with a blood-pressure app should not need to understand thirty networks' onboarding quirks. Where the home-network conclusion goes wrong is in confusing **authority** with **obligation**.

The claim here is narrow: apps should have the **authority** to connect to any network directly, on the strength of their Library listing. Nothing about that authority obligates any app to exercise it alone:

- **Outsource the plumbing.** An app can use a platform that facilitates or fully handles multi-network connectivity — registration, key management, retries, endpoint churn. Platforms like b.well, Fasten, or HealthEx can compete to be the best at exactly this. The difference from the home-network model is that the app *chooses* its helper in a competitive market, rather than the architecture *requiring* a gatekeeper.
- **Use shared open-source libraries.** Most of the per-network variation is mechanical (see [how the app joins the ecosystem](authorizing-access.md)). A well-maintained open-source client library absorbs it the way OAuth libraries absorbed provider quirks.
- **Don't connect at all — receive by delegation.** Some apps may decide not to be "CMS apps" in the connectivity sense. A user can connect through an app that does the network work (an aggregator), and then choose to share onward to "Josh's BP monitor app" — delegation handled entirely within and between apps, with the user in control. This keeps the complexity at the edge that opted into it, instead of pushing an understanding of delegation chains through every network and data holder in the system.

If the spec gets the floor right — Library listing confers connection authority; networks must accept the federal credential without duplicative gating — then **market competition delivers the convenience Liz is arguing for without the spec having to mandate any particular helper**. The home-network model delivers the same convenience only by making it compulsory.

What networks lose under this proposal is only the *structural* role. Everything they might do for an app — concierge onboarding, brokered retrieval, monitoring, support — survives as a **product they can sell on merit** (§14.2 already contemplates exactly this above-the-floor competition).

---

## What replaces each home-network function

| Home-network function (current spec) | Replacement | Where it lives |
|---|---|---|
| Onboarding gate before an app may operate | CMS App Library admission (identity verification, conformance testing, recognized-body certification) | Library terms of participation; CMS-signed software statement |
| Good-standing oracle (§4.2) | `library_status` (`active` / `suspended` / `delisted`) in the short-lived CMS-signed software statement; CMS stops re-issuing on suspension | CMS Library + statement endpoint |
| Operational abuse handling | Each network enforces locally (rate limits, for-cause suspension) and reports suspensions to NPD and CMS; CMS complaint intake can delist globally | §7.2-style for-cause suspension, retargeted at NPD/CMS instead of a home network |
| Production-readiness attestation (§7.2 cond. 2) | Open reference test kit results at admission; production behavior proven organically at first connections, visible via published network metrics (§15) | Library admission + NPD metrics |
| Trust anchor for cross-network response (§4.3) | Federal Trust Signals + verified CMS-signed software statement; receiving network verifies one signature, reads `library_status` | §7.1 (already specified) |
| Economic anchor | Explicitly none — see economics section; helper services compete above the floor (§14.2) | Market |

**The honest cost of this swap:** CMS must actually operate the Library as a live status registry, not a webpage — complaint intake, suspension/delisting workflow with teeth, statement re-issuance gated on status, `jwks_uri` monitoring. That is a real commitment and the working group should ask CMS to own it explicitly. But it is *one* registry operated by the party that already made the trust decision, versus N vouching desks operated by parties who didn't.

---

## Proposed spec deltas

Concrete edits to [can-spec.md](can-spec.md), resolving the §2 CONTESTED box in favor of direct connect:

1. **§2 Terminology.** Delete the **Home Network** definition and the CONTESTED box. Redefine **Good Standing** as: *"For a patient-facing app: an `active` status in the CMS App Library, as asserted in a current CMS-signed software statement. For other participant types: the federally grounded status applicable to that actor type (NPD listing, HIPAA covered-entity status, recognized certification), pending CMS registry coverage."*
2. **§4.2 (Vouch for participants).** Retitle to "Report operational status." A network reports the operational status of participants *it has registered* (suspensions for cause, health-check failures) to NPD and CMS. It is nobody's designated voucher; reporting is about behavior the network itself observed.
3. **§4.3 (Respond to credentialed tech solutions).** Replace "is reported in good standing on its home Network" with "presents a valid CMS-signed software statement with `library_status: active` (or the applicable federal credential for its actor type)." Keep the duplicative-gating prohibition verbatim — it is the load-bearing sentence of the whole architecture.
4. **§7.1 (Auto-Registration).** Already nearly home-network-free. Delete the sentence "When a participant has been onboarded by one home Network using a recognized credential type, every other Network MUST register that participant on a defined timeline" and replace with: "When a participant presents a recognized credential, a Network MUST complete registration on the defined timeline without redundant onboarding."
5. **§7.2 (Presumptive Eligibility).** Rewrite without the home-network predicate. Eligibility flows from the federal credential itself; the 90-day presumptive window and for-cause suspension (reported to NPD and CMS rather than to a home network) carry over unchanged. Delete condition 2 (home-network production attestation) in favor of reference-test-kit evidence at admission.
6. **§5 Connectivity Pathways.** No changes required — none of the pathways actually depends on a home network, which is itself telling.

---

## Scope and generalization

This case is argued for **patient-facing apps**, because the Medicare App Library exists today and CMS has committed to it. The current spec's home-network concept also covers payers, providers, and delegated tech solutions, where no CMS registry yet exists. Two options for those actor types:

- They already carry federal signals with no home network needed (NPD listing, HIPAA covered-entity status, recognized accreditations) — §2's Federal Trust Signal list covers them.
- Where a genuine onboarding anchor is still needed in the interim, that is an argument for *CMS extending registry coverage* (as the software-statement architecture anticipates), not for retaining a home-network gate for apps.

The unresolved general case should not hold up the case that is resolved: apps.

## Relationship to the UDAP question (§7.1 CONTESTED box)

This paper deliberately does **not** ask the working group to resolve UDAP-vs-CMS-statement. The bottom line that matters for apps is:

> **Per-network custom work is acceptable. Per-data-holder manual work is not.**

A network may satisfy that with centralized registration (one client ID, network handles edge connectivity — the Epic model), with CMS-software-statement dynamic registration at its data holders, or with UDAP-based dynamic registration via a trust-community CA — as long as no path requires the app to take *manual* steps per data holder. There are enough divergent interests invested in these mechanisms that forcing consensus today is not worth the delay; all three reduce to RFC 7591 at the wire (§7.1 already says so), the spec can recognize all of them, and we can let deployment experience and market pressure reveal which earn their keep. Something that works much better than today, plus room to learn, is the win condition.

The [record location and data access write-up](authorizing-access.md) shows an app traversing registration, record location, and data retrieval with no home network anywhere in the path.
