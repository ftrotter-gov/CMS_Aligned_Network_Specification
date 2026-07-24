// Generates the example-artifacts library for authorizing-access.md.
// Every JWT is really signed with keys generated at run time; decoded
// header/payload are rendered next to each compact JWS. Run with:
//   bun run generate.ts
import { $ } from "bun";
import {
  SignJWT,
  generateKeyPair,
  exportJWK,
  exportPKCS8,
  calculateJwkThumbprint,
  type JWK,
  type CryptoKey,
} from "jose";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(import.meta.dir, "../../example-artifacts");
mkdirSync(OUT, { recursive: true });

const now = Math.floor(Date.now() / 1000);
const iso = (t: number) => new Date(t * 1000).toISOString();

// ---------------------------------------------------------------- identities
const APP_URI = "https://bpbuddy.example";
const APP_JWKS_URI = `${APP_URI}/.well-known/jwks.json`;
const CMS_LIBRARY = "https://library.medicare.gov";
const CMS_APP_ID = `${CMS_LIBRARY}/app-library/apps/bp-buddy`;
const STATEMENT_URL = `${CMS_APP_ID}/software-statement.jwt`;
const CSP_ISS = "https://api.id.me/oidc";
const NPD = "https://npd.cms.gov";
const ALPHA_TOKEN = "https://auth.alpha-health.example/v1/token";
const ALPHA_PORTAL = "https://developers.alpha-health.example";
const BETA_RLS = "https://rls.beta-exchange.example/fhir";
const GAMMA_REG = "https://lakeside.example/oauth/register"; // representative DH
const LAKESIDE_TOKEN = "https://lakeside.example/oauth/token";
const LAKESIDE_FHIR = "https://lakeside.example/fhir";

// --------------------------------------------------------------------- keys
async function makeKey(alg: string) {
  const { publicKey, privateKey } = await generateKeyPair(alg, { extractable: true });
  const jwk = (await exportJWK(publicKey)) as JWK;
  jwk.alg = alg;
  jwk.use = "sig";
  jwk.kid = await calculateJwkThumbprint(jwk);
  return { privateKey, jwk, alg };
}

const cmsKey = await makeKey("ES384"); // CMS statement signing
const appKeyA = await makeKey("RS384"); // app's primary key (Blue Button allows RS384/ES384)
const appKeyB = await makeKey("RS384"); // rotation target
const cspKey = await makeKey("RS256"); // ID.me-style id_token signing
const udapKey = await makeKey("RS256"); // key inside the Gamma X.509 cert
const ticketIssuerKey = await makeKey("ES256"); // Beta issuer signing permission tickets

// X.509: a Gamma community CA and an app cert over udapKey, via openssl.
const tmp = join(import.meta.dir, ".x509-tmp");
mkdirSync(tmp, { recursive: true });
writeFileSync(join(tmp, "app.key"), await exportPKCS8(udapKey.privateKey as CryptoKey));
await $`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${tmp}/ca.key -out ${tmp}/ca.crt -subj "/CN=Gamma Trust Community CA/O=Gamma Trust Network" -days 365`.quiet();
await $`openssl req -new -key ${tmp}/app.key -out ${tmp}/app.csr -subj "/CN=BP Buddy/O=BP Buddy Inc" -addext subjectAltName=URI:${APP_URI}`.quiet();
await $`openssl x509 -req -in ${tmp}/app.csr -CA ${tmp}/ca.crt -CAkey ${tmp}/ca.key -CAcreateserial -days 90 -copy_extensions copy -out ${tmp}/app.crt`.quiet();
const appCertDer = (await $`openssl x509 -in ${tmp}/app.crt -outform DER`.quiet()).stdout;
const caCertDer = (await $`openssl x509 -in ${tmp}/ca.crt -outform DER`.quiet()).stdout;
const appCertPem = await Bun.file(join(tmp, "app.crt")).text();
const caCertPem = await Bun.file(join(tmp, "ca.crt")).text();
const x5cApp = appCertDer.toString("base64");
const x5cCa = caCertDer.toString("base64");
await $`rm -rf ${tmp}`.quiet();

// ------------------------------------------------------------------ helpers
const b64uJson = (s: string) => JSON.parse(Buffer.from(s, "base64url").toString());
const opaque = () => Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");
const uuid = () => crypto.randomUUID();
const pretty = (o: unknown) => JSON.stringify(o, null, 2);

function jwtMd(label: string, jwt: string): string {
  const [h, p] = jwt.split(".");
  return [
    `**${label}** (compact JWS, really signed):`,
    "",
    "```",
    jwt,
    "```",
    "",
    "Decoded header:",
    "",
    "```json",
    pretty(b64uJson(h)),
    "```",
    "",
    "Decoded payload:",
    "",
    "```json",
    pretty(b64uJson(p)),
    "```",
  ].join("\n");
}

function httpMd(title: string, lines: string[], body?: unknown, bodyLang = "json"): string {
  const out = [`**${title}**`, "", "```http", ...lines, "```"];
  if (body !== undefined) {
    out.push("", `\`\`\`${bodyLang}`, typeof body === "string" ? body : pretty(body), "```");
  }
  return out.join("\n");
}

const pages: { file: string; title: string }[] = [];
function writePage(file: string, title: string, intro: string, sections: string[]) {
  pages.push({ file, title });
  const md = [
    `# ${title}`,
    "",
    `*Worked example for [the record location and data access write-up](../authorizing-access.md). ${intro}*`,
    "",
    sections.join("\n\n---\n\n"),
    "",
    `*Generated ${iso(now)} by \`tools/artifact-generator\` in this repository. Keys are throwaway examples; every signature verifies against the keys in [keys-and-trust-anchors](keys-and-trust-anchors.md).*`,
  ].join("\n");
  writeFileSync(join(OUT, `${file}.md`), md);
  writeFileSync(join(OUT, `${file}.html`), htmlWrapper(title, `${file}.md`));
}

function htmlWrapper(title: string, source: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  :root { --fg:#1a1a1a; --bg:#fff; --bg-code:#f4f4f5; --accent:#0f5132; --accent-soft:#e7f1ec; --rule:#e5e5e5; }
  * { box-sizing:border-box; }
  html,body { margin:0; padding:0; background:var(--bg); color:var(--fg);
    font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
    font-size:16px; line-height:1.6; }
  main { max-width:860px; margin:0 auto; padding:32px 24px 96px; }
  a { color:var(--accent); text-decoration:none; border-bottom:1px solid var(--accent-soft); }
  code,pre { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:0.88em; }
  code { background:var(--bg-code); padding:0.1em 0.35em; border-radius:3px; }
  pre { background:var(--bg-code); padding:12px 14px; border-radius:6px; overflow-x:auto; white-space:pre-wrap; word-break:break-all; }
  pre code { background:none; padding:0; }
  h1 { font-size:1.6em; line-height:1.25; }
  h2 { font-size:1.25em; margin-top:1.8em; border-bottom:1px solid var(--rule); padding-bottom:0.3em; }
  hr { border:none; border-top:1px solid var(--rule); margin:2em 0; }
  .site-nav { font-size:0.95em; background:var(--accent-soft); border:1px solid var(--rule); border-radius:6px; padding:10px 16px; margin-bottom:28px; }
  .site-nav a { font-weight:600; }
</style>
</head>
<body>
<main>
  <nav class="site-nav" aria-label="Site navigation">
    <a href="../index.html">CAN Spec</a> ·
    <a href="../apps-without-home-networks.html">Apps Without Home Networks</a> ·
    <a href="../authorizing-access.html">Record Location &amp; Data Access</a> ·
    <a href="index.html">Artifacts</a>
  </nav>
  <div id="content"><p>Loading…</p></div>
</main>
<script src="https://cdn.jsdelivr.net/npm/marked@4.3.0/marked.min.js" integrity="sha384-QsSpx6a0USazT7nK7w8qXDgpSAPhFsb2XtpoLFQ5+X2yFN6hvCKnwEzN8M5FWaJb" crossorigin="anonymous"></script>
<script>
const renderer = {
  link(href, title, text) {
    if (!/^https?:/.test(href)) href = href.replace(/\\.md(#|$)/, '.html$1');
    return '<a href="' + href + '">' + text + '</a>';
  }
};
marked.use({ renderer, mangle: false, headerIds: true });
fetch('${source}').then(r => r.text()).then(md => {
  document.getElementById('content').innerHTML = marked.parse(md);
});
</script>
</body>
</html>
`;
}

// =====================================================================
// Phase 0 — CMS software statement
// =====================================================================
const softwareStatement = await new SignJWT({
  software_id: CMS_APP_ID,
  client_name: "BP Buddy",
  client_uri: APP_URI,
  policy_uri: `${APP_URI}/privacy`,
  contacts: ["support@bpbuddy.example"],
  grant_types: ["client_credentials"],
  token_endpoint_auth_method: "private_key_jwt",
  jwks_uri: APP_JWKS_URI,
  extensions: {
    cms_app: { version: "1", library_status: "active", app_class: "patient-access-app" },
  },
})
  .setProtectedHeader({ alg: "ES384", kid: cmsKey.jwk.kid, typ: "JWT" })
  .setIssuer(CMS_LIBRARY)
  .setSubject(CMS_APP_ID)
  .setAudience("https://framework.cms.gov/aligned-networks")
  .setIssuedAt(now)
  .setExpirationTime(now + 86400)
  .setJti(uuid())
  .sign(cmsKey.privateKey);

writePage(
  "software-statement",
  "The CMS-signed software statement",
  "CMS re-signs this statement on a short cycle for as long as BP Buddy is active in the Medicare App Library. It is the only credential the app carries into every network.",
  [
    httpMd("Request — anyone may fetch the current statement", [
      `GET ${STATEMENT_URL} HTTP/1.1`,
      "Accept: application/jwt",
    ]),
    [
      "**Response** `200 OK`, `Content-Type: application/jwt`",
      "",
      jwtMd("software_statement", softwareStatement),
    ].join("\n"),
    [
      "**The app's published JWKS** at `" + APP_JWKS_URI + "` (CMS verified control of this URL at admission and monitors it afterward):",
      "",
      "```json",
      pretty({ keys: [appKeyA.jwk] }),
      "```",
    ].join("\n"),
  ],
);


// =====================================================================
// Phase 2a — Alpha portal
// =====================================================================
const keyPossession = await new SignJWT({})
  .setProtectedHeader({ alg: "RS384", kid: appKeyA.jwk.kid, typ: "JWT" })
  .setIssuer(CMS_APP_ID)
  .setSubject(CMS_APP_ID)
  .setAudience(ALPHA_PORTAL)
  .setIssuedAt(now)
  .setExpirationTime(now + 300)
  .setJti(uuid())
  .sign(appKeyA.privateKey);

writePage(
  "portal-registration",
  "Registration through a developer portal",
  "Most of this flow is a human in a browser, so the artifacts are the two machine-verifiable pieces: the statement link the developer pastes, and a key-possession proof the portal can ask for.",
  [
    [
      "**What the developer pastes into the portal form:**",
      "",
      "```",
      STATEMENT_URL,
      "```",
      "",
      "The portal fetches it, verifies the CMS signature against CMS's published JWKS, checks `library_status: active`, and pre-fills app name, URIs, and contacts from the payload (see [software-statement](software-statement.md)).",
    ].join("\n"),
    [
      "One way Alpha can verify key possession during signup is a short-lived JWT the developer's tooling produces, verifiable against the app's CMS-verified `jwks_uri`:",
      "",
      jwtMd("key-possession proof", keyPossession),
    ].join("\n"),
    httpMd(
      "Portal provisions the registration — the developer sees",
      ["HTTP/1.1 201 Created", "Content-Type: application/json"],
      {
        client_id: "alpha-net-bp-buddy-7c31",
        grant_types: ["client_credentials"],
        token_endpoint: ALPHA_TOKEN,
        note: "Valid at every Alpha data holder; no further registrations on this network.",
      },
    ),
  ],
);

// =====================================================================
// Phase 2b — Beta dynamic registration
// =====================================================================
writePage(
  "dynamic-registration",
  "Dynamic registration with the CMS statement",
  "The same RFC 7591 call repeats at each Beta data holder; one representative exchange is shown, at Lakeside Clinic.",
  [
    httpMd(
      "Request — RFC 7591 registration",
      [
        `POST ${GAMMA_REG} HTTP/1.1`,
        "Host: lakeside.example",
        "Content-Type: application/json",
        `Authorization: Bearer ${keyPossession.slice(0, 40)}... (key-possession JWT, same shape as in 2a)`,
      ],
      {
        software_statement: `${softwareStatement.slice(0, 60)}... (full value in software-statement)`,
        grant_types: ["client_credentials"],
        token_endpoint_auth_method: "private_key_jwt",
      },
    ),
    [
      "The data holder verifies the CMS signature, reads `library_status`, confirms key possession against the statement's `jwks_uri`, and checks Beta's approval signal for this app if Beta publishes one.",
      "",
      httpMd(
        "Response — 201 Created",
        ["HTTP/1.1 201 Created", "Content-Type: application/json"],
        {
          client_id: "lakeside-dh-bp-buddy-91af",
          software_id: CMS_APP_ID,
          grant_types: ["client_credentials"],
          token_endpoint_auth_method: "private_key_jwt",
          jwks_uri: APP_JWKS_URI,
        },
      ),
    ].join("\n"),
  ],
);

// =====================================================================
// Phase 2c — Gamma UDAP registration
// =====================================================================
const udapStatement = await new SignJWT({
  client_name: "BP Buddy",
  grant_types: ["client_credentials"],
  token_endpoint_auth_method: "private_key_jwt",
  scope: "patient/Patient.rs patient/Observation.rs",
  contacts: ["support@bpbuddy.example"],
})
  .setProtectedHeader({ alg: "RS256", x5c: [x5cApp, x5cCa] })
  .setIssuer(APP_URI)
  .setSubject(APP_URI)
  .setAudience(GAMMA_REG)
  .setIssuedAt(now)
  .setExpirationTime(now + 300)
  .setJti(uuid())
  .sign(udapKey.privateKey);

writePage(
  "certificate-registration",
  "Registration with a community-issued certificate",
  "The software statement here is self-signed with the key inside an X.509 certificate that Gamma's community CA issued to the app; trust comes from the chain to the CA anchor published in NPD. The certificate is real and chains to the CA in keys-and-trust-anchors.",
  [
    [
      jwtMd("UDAP software statement (x5c carries the cert chain)", udapStatement),
      "",
      "The `x5c` header holds the DER-encoded app certificate and the community CA certificate; both appear in PEM form in [keys-and-trust-anchors](keys-and-trust-anchors.md). The app certificate's subjectAltName URI is `" + APP_URI + "`, matching `iss` and `sub`.",
    ].join("\n"),
    httpMd(
      "Request",
      [`POST ${GAMMA_REG} HTTP/1.1`, "Host: lakeside.example", "Content-Type: application/json"],
      { software_statement: `${udapStatement.slice(0, 60)}...`, udap: "1" },
    ),
    httpMd(
      "Response — 201 Created",
      ["HTTP/1.1 201 Created", "Content-Type: application/json"],
      { client_id: "gamma-dh-bp-buddy-2e64", grant_types: ["client_credentials"], token_endpoint_auth_method: "private_key_jwt" },
    ),
  ],
);

// =====================================================================
// Phase 3 — IAL2 id_token, patient-bound token, $rls
// =====================================================================
const idToken = await new SignJWT({
  identity_assurance_level: 2,
  auth_time: now - 60,
  given_name: "Maria",
  family_name: "Lopez",
  birthdate: "1962-03-15",
  address: {
    street_address: "418 Alder Court",
    locality: "Riverside",
    region: "CA",
    postal_code: "92501",
    country: "US",
  },
  ssn_itin_short: "4321",
})
  .setProtectedHeader({ alg: "RS256", kid: cspKey.jwk.kid, typ: "JWT" })
  .setIssuer(CSP_ISS)
  .setSubject(uuid())
  .setAudience(CMS_APP_ID)
  .setIssuedAt(now - 60)
  .setExpirationTime(now + 240)
  .setJti(uuid())
  .sign(cspKey.privateKey);

async function clientAssertion(clientId: string, tokenEndpoint: string) {
  return new SignJWT({
    extensions: { cms_smart: { version: "1", purpose_of_use: "PATRQT", id_token: idToken } },
  })
    .setProtectedHeader({ alg: "RS384", kid: appKeyA.jwk.kid, typ: "JWT" })
    .setIssuer(clientId)
    .setSubject(clientId)
    .setAudience(tokenEndpoint)
    .setExpirationTime(now + 300)
    .setJti(uuid())
    .sign(appKeyA.privateKey);
}

const BETA_RLS_TOKEN = "https://rls.beta-exchange.example/oauth/token";
const rlsAssertion = await clientAssertion("beta-rls-bp-buddy-5d20", BETA_RLS_TOKEN);
const rlsAccessToken = opaque();

writePage(
  "client-credentials-rls",
  "client_credentials + $rls: the app-asserted grant at a network",
  "Maria authenticated at her IAL2 CSP moments ago; her id_token travels inside the cms_smart extension of the client_assertion, following the Blue Button CMS Aligned Networks pattern. The access token comes back bound to her, so $rls can only locate her records.",
  [
    [
      jwtMd("CSP-issued IAL2 id_token (ID.me-style claims)", idToken),
      "",
      "The `aud` is the app's canonical Library identifier: the app configures its CSP registration so id_tokens carry its `software_id`. Any network or data holder can then verify the relationship between the id_token's audience and the presenting application (can-spec §9) by matching `aud` against the `software_id` it bound at registration — the identifiers are literally identical, no directory needed.",
    ].join("\n"),
    httpMd(
      "Token request",
      [`POST ${BETA_RLS_TOKEN} HTTP/1.1`, "Host: rls.beta-exchange.example", "Content-Type: application/x-www-form-urlencoded"],
      {
        grant_type: "client_credentials",
        scope: "patient/Patient.rs launch/patient",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: `${rlsAssertion.slice(0, 60)}... (decoded below)`,
      },
    ),
    jwtMd("client_assertion — note extensions.cms_smart carrying the full id_token", rlsAssertion),
    httpMd(
      "Token response — patient matched (can-spec §6), token bound to Maria",
      ["HTTP/1.1 200 OK", "Content-Type: application/json"],
      { access_token: rlsAccessToken, token_type: "Bearer", expires_in: 1800, scope: "patient/Patient.rs launch/patient", patient: "beta-master-7741" },
    ),
    httpMd(
      "$rls request — parameters are the point of using an operation",
      [`POST ${BETA_RLS}/Patient/$rls HTTP/1.1`, "Host: rls.beta-exchange.example", `Authorization: Bearer ${rlsAccessToken}`, "Content-Type: application/fhir+json"],
      {
        resourceType: "Parameters",
        parameter: [
          { name: "geographic-scope", valueString: "US-CA" },
          { name: "since", valueDate: "2020-01-01" },
          { name: "resource-interest", valueCode: "Observation" },
        ],
      },
    ),
    httpMd(
      "$rls response — endpoints likely to hold Maria's records",
      ["HTTP/1.1 200 OK", "Content-Type: application/fhir+json"],
      {
        resourceType: "Parameters",
        parameter: [
          {
            name: "location",
            part: [
              { name: "organization", valueString: "Lakeside Clinic" },
              { name: "fhir-endpoint", valueUrl: `${LAKESIDE_FHIR}` },
            ],
          },
          {
            name: "location",
            part: [
              { name: "organization", valueString: "County Health" },
              { name: "fhir-endpoint", valueUrl: "https://fhir.countyhealth.example/r4" },
            ],
          },
        ],
      },
    ),
  ],
);


// =====================================================================
// Permission-ticket alternative (Phase 3 evolution)
// =====================================================================
const TICKET_ISSUER = "https://issuer.beta-exchange.example";
// T1 evidence: the issuer ran the CSP sign-in as relying party during the
// issuance ceremony, so the id_token's aud names the ticket issuer.
const ticketEvidence = await new SignJWT({
  identity_assurance_level: 2,
  auth_time: now - 30,
  given_name: "Maria",
  family_name: "Lopez",
  birthdate: "1962-03-15",
})
  .setProtectedHeader({ alg: "RS256", kid: cspKey.jwk.kid, typ: "JWT" })
  .setIssuer(CSP_ISS)
  .setSubject(uuid())
  .setAudience(TICKET_ISSUER)
  .setIssuedAt(now - 30)
  .setExpirationTime(now + 270)
  .setJti(uuid())
  .sign(cspKey.privateKey);

const permissionTicket = await new SignJWT({
  ticket_type: "patient-self-access-v1",
  subject: {
    patient: { name: [{ family: "Lopez", given: ["Maria"] }], birthDate: "1962-03-15" },
  },
  subject_identity_evidence: ticketEvidence,
  presenter_binding: { jkt: appKeyA.jwk.kid },
  access: {
    permissions: [{ resource_type: "Observation", interactions: ["read", "search"] }],
    data_holder_filter: [{ organization: "Lakeside Clinic" }],
  },
})
  .setProtectedHeader({ alg: "ES256", kid: ticketIssuerKey.jwk.kid, typ: "JWT" })
  .setIssuer(TICKET_ISSUER)
  .setAudience(LAKESIDE_FHIR)
  .setIssuedAt(now)
  .setExpirationTime(now + 3600)
  .setJti(uuid())
  .sign(ticketIssuerKey.privateKey);

const countyTicket = await new SignJWT({
  ticket_type: "patient-self-access-v1",
  subject: {
    patient: { name: [{ family: "Lopez", given: ["Maria"] }], birthDate: "1962-03-15" },
  },
  subject_identity_evidence: ticketEvidence,
  presenter_binding: { jkt: appKeyA.jwk.kid },
  access: {
    permissions: [{ resource_type: "Observation", interactions: ["read", "search"] }],
    data_holder_filter: [{ organization: "County Health" }],
  },
})
  .setProtectedHeader({ alg: "ES256", kid: ticketIssuerKey.jwk.kid, typ: "JWT" })
  .setIssuer(TICKET_ISSUER)
  .setAudience("https://fhir.countyhealth.example/r4")
  .setIssuedAt(now)
  .setExpirationTime(now + 3600)
  .setJti(uuid())
  .sign(ticketIssuerKey.privateKey);

writePage(
  "issuance-token-response",
  "The authorization step's token response",
  "What BP Buddy receives when Maria finishes the authorization step at the shared authorization service: a standard SMART token response extended with per-site permission tickets and endpoint hints. Maria chose two sites; sites she left out appear nowhere.",
  [
    httpMd(
      "Token response — authorization code exchanged at the service's token endpoint",
      ["HTTP/1.1 200 OK", "Content-Type: application/json"],
      {
        access_token: opaque(),
        token_type: "Bearer",
        expires_in: 300,
        refresh_token: opaque(),
        scope: "permission_ticket patient/Observation.rs offline_access",
        smart_permission_ticket: [
          `${permissionTicket.slice(0, 50)}... (ticket 0, decoded below)`,
          `${countyTicket.slice(0, 50)}... (ticket 1, decoded below)`,
        ],
        smart_permission_ticket_endpoints: [
          { fhir_base_url: LAKESIDE_FHIR, organization: { resourceType: "Organization", name: "Lakeside Clinic" }, ticket_indices: [0] },
          { fhir_base_url: "https://fhir.countyhealth.example/r4", organization: { resourceType: "Organization", name: "County Health" }, ticket_indices: [1] },
        ],
      },
    ),
    jwtMd("Ticket 0 — scoped to Lakeside Clinic", permissionTicket),
    jwtMd("Ticket 1 — scoped to County Health", countyTicket),
    httpMd(
      "Renewing tickets later: the refresh_token re-mints them without re-running the authorization step",
      [`POST ${TICKET_ISSUER}/token HTTP/1.1`, "Content-Type: application/x-www-form-urlencoded"],
      { grant_type: "refresh_token", refresh_token: "(value from the response above)", client_id: "sas-bp-buddy-3f81" },
    ),
    "The refresh response has the same shape as the original: a fresh smart_permission_ticket array for the same site selection, with new expirations.",
    "If Maria instead chooses every site in the network (the alternative where the app sees every match), the response carries one blanket ticket with no data_holder_filter and endpoint hints for every match: see [blanket-ticket](blanket-ticket.md). Redeeming a per-site ticket at a data holder is shown in [permission-ticket](permission-ticket.md).",
  ],
);

writePage(
  "permission-ticket",
  "A signed permission ticket and its redemption",
  "The patient authorizes once at a shared authorization service via a SMART App Launch code flow; the token response carries per-site tickets like this one plus endpoint hints (see issuance-token-response). The app redeems the ticket at each data holder's token endpoint via RFC 8693; the data holder verifies the ticket, independently verifies the embedded identity evidence, matches the patient locally, and issues its own token with the matched id.",
  [
    [
      jwtMd("Permission ticket — note subject demographics, the embedded IAL2 id_token as subject_identity_evidence, and the presenter binding to the app's key", permissionTicket),
      "",
      "The `subject_identity_evidence` is a CSP-signed id_token whose `aud` names the ticket issuer: the issuer ran the CSP sign-in as relying party during the issuance ceremony. The data holder verifies the evidence's signature against the CSP's keys itself (evidence-issuer trust is configured separately from ticket-issuer trust) and resolves the evidence's client identifier to the ticket issuer. `presenter_binding.jkt` is the thumbprint of the app key in [keys-and-trust-anchors](keys-and-trust-anchors.md).",
    ].join("\n"),
    httpMd(
      "Redemption — RFC 8693 token exchange at the data holder",
      [`POST ${LAKESIDE_TOKEN} HTTP/1.1`, "Host: lakeside.example", "Content-Type: application/x-www-form-urlencoded"],
      {
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token_type: "https://smarthealthit.org/token-type/permission-ticket",
        subject_token: `${permissionTicket.slice(0, 60)}... (full value above)`,
        scope: "patient/Observation.rs",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: "(signed with the key named by presenter_binding.jkt)",
      },
    ),
    httpMd("Token response — the data holder's own token, with its matched patient id", ["HTTP/1.1 200 OK", "Content-Type: application/json"], {
      access_token: "(bearer token used below)",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "patient/Observation.rs",
      patient: "lakeside-449210",
    }),
    httpMd("FHIR query with that token", [
      `GET ${LAKESIDE_FHIR}/Observation?patient=lakeside-449210&category=vital-signs&_count=1 HTTP/1.1`,
      "Authorization: Bearer (token from above)",
      "Accept: application/fhir+json",
    ]),
    httpMd("FHIR response", ["HTTP/1.1 200 OK", "Content-Type: application/fhir+json"], {
      resourceType: "Bundle",
      type: "searchset",
      total: 1,
      entry: [{ resource: {
        resourceType: "Observation",
        status: "final",
        code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel" }] },
        subject: { reference: "Patient/lakeside-449210" },
        effectiveDateTime: "2026-06-02T14:10:00Z",
        component: [
          { code: { coding: [{ system: "http://loinc.org", code: "8480-6" }] }, valueQuantity: { value: 131, unit: "mmHg" } },
          { code: { coding: [{ system: "http://loinc.org", code: "8462-4" }] }, valueQuantity: { value: 82, unit: "mmHg" } },
        ],
      }}],
    }),
  ],
);

// =====================================================================
// Phase 4b — federated retrieval at Lakeside (Beta/Gamma identical)
// =====================================================================
const lakesideAssertion = await clientAssertion("lakeside-dh-bp-buddy-91af", LAKESIDE_TOKEN);
const lakesideAccessToken = opaque();

writePage(
  "cms-smart-data-holder",
  "cms_smart at a data holder: token and FHIR retrieval",
  "Same token shape as everywhere else; the only difference from 4a is that the data holder's own authorization server issues the token, and a refresh_token supports the rolling 90-day window of can-spec §9.",
  [
    httpMd(
      "Token request",
      [`POST ${LAKESIDE_TOKEN} HTTP/1.1`, "Host: lakeside.example", "Content-Type: application/x-www-form-urlencoded"],
      {
        grant_type: "client_credentials",
        scope: "patient/Observation.rs patient/MedicationRequest.rs launch/patient",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: `${lakesideAssertion.slice(0, 60)}... (decoded below)`,
      },
    ),
    jwtMd("client_assertion", lakesideAssertion),
    httpMd("Token response", ["HTTP/1.1 200 OK", "Content-Type: application/json"], {
      access_token: lakesideAccessToken,
      refresh_token: opaque(),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "patient/Observation.rs patient/MedicationRequest.rs launch/patient",
      patient: "lakeside-449210",
    }),
    httpMd(
      "FHIR query",
      [`GET ${LAKESIDE_FHIR}/Observation?patient=lakeside-449210&category=vital-signs&_count=1 HTTP/1.1`, `Authorization: Bearer ${lakesideAccessToken}`, "Accept: application/fhir+json"],
    ),
    httpMd("FHIR response", ["HTTP/1.1 200 OK", "Content-Type: application/fhir+json"], {
      resourceType: "Bundle",
      type: "searchset",
      total: 1,
      entry: [
        {
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel" }] },
            subject: { reference: "Patient/lakeside-449210" },
            effectiveDateTime: "2026-06-02T14:10:00Z",
            component: [
              { code: { coding: [{ system: "http://loinc.org", code: "8480-6" }] }, valueQuantity: { value: 131, unit: "mmHg" } },
              { code: { coding: [{ system: "http://loinc.org", code: "8462-4" }] }, valueQuantity: { value: 82, unit: "mmHg" } },
            ],
          },
        },
      ],
    }),
  ],
);

// =====================================================================
// Phase 5 — key rotation
// =====================================================================
const rotatedAssertion = await new SignJWT({
  extensions: { cms_smart: { version: "1", purpose_of_use: "PATRQT", id_token: idToken } },
})
  .setProtectedHeader({ alg: "RS384", kid: appKeyB.jwk.kid, typ: "JWT" })
  .setIssuer("lakeside-dh-bp-buddy-91af")
  .setSubject("lakeside-dh-bp-buddy-91af")
  .setAudience(LAKESIDE_TOKEN)
  .setExpirationTime(now + 300)
  .setJti(uuid())
  .sign(appKeyB.privateKey);

writePage(
  "key-rotation",
  "Key rotation",
  "The app publishes key B alongside key A, then signs with the new kid; data holders resolve it at the live jwks_uri with nothing to re-issue.",
  [
    [
      "**JWKS before rotation:**",
      "",
      "```json",
      pretty({ keys: [appKeyA.jwk] }),
      "```",
      "",
      "**JWKS during the overlap window (key B published alongside key A):**",
      "",
      "```json",
      pretty({ keys: [appKeyA.jwk, appKeyB.jwk] }),
      "```",
    ].join("\n"),
    [
      "First token request signed with the new key; note the `kid` in the header now matches key B:",
      "",
      jwtMd("client_assertion signed with key B", rotatedAssertion),
    ].join("\n"),
    [
      "After the overlap window the app removes key A from the JWKS. Nothing else in the ecosystem changed: the CMS statement binds the `jwks_uri`, not a key. For network-issued certificates, the synchronization rule in [Key rotation](../authorizing-access.md) applies.",
    ].join("\n"),
  ],
);

// =====================================================================
// Pages for the record-location-and-data-access write-up
// =====================================================================
const SAS_CSP_CLIENT = "https://issuer.beta-exchange.example"; // the service's identity at the CSP
const SAS_APP_CLIENT = "sas-bp-buddy-3f81";
const launchValue = "lch_" + opaque().slice(0, 16);
const launchClientAssertion = await new SignJWT({})
  .setProtectedHeader({ alg: "RS384", kid: appKeyA.jwk.kid, typ: "JWT" })
  .setIssuer(SAS_APP_CLIENT)
  .setSubject(SAS_APP_CLIENT)
  .setAudience(`${TICKET_ISSUER}/token`)
  .setIssuedAt(now)
  .setExpirationTime(now + 300)
  .setJti(uuid())
  .sign(appKeyA.privateKey);

writePage(
  "csp-sign-in",
  "The app signs Maria in at the CSP",
  "BP Buddy is the CSP's relying party. The id_token it receives carries the app's canonical Library identifier as its audience, which is what lets any later verifier resolve the token to this app.",
  [
    httpMd("Authorize request (browser redirect to the CSP)", [
      `GET ${CSP_ISS}/authorize?response_type=code HTTP/1.1`,
      "  &client_id=" + encodeURIComponent(CMS_APP_ID),
      "  &redirect_uri=https://bpbuddy.example/csp/callback",
      "  &scope=openid+profile",
      "  &state=af0X9 &nonce=n-7qL2",
    ]),
    httpMd("Token response after the code exchange", ["HTTP/1.1 200 OK", "Content-Type: application/json"], {
      access_token: opaque(),
      token_type: "Bearer",
      expires_in: 300,
      id_token: `${idToken.slice(0, 50)}... (decoded below)`,
    }),
    jwtMd("id_token: aud is the app's Library software_id", idToken),
  ],
);

writePage(
  "authorization-step",
  "Opening the authorization step",
  "The app exchanges Maria's app-audienced CSP id_token for a SMART launch value, then opens a standard SMART App Launch code flow at the shared authorization service. Once the SMART flow begins, the service decides whether to accept the launch context, perform local step-up, or re-authenticate her at the CSP and receive a fresh id_token audienced to itself.",
  [
    httpMd(
      "External identity evidence token exchange (back channel)",
      [`POST ${TICKET_ISSUER}/token HTTP/1.1`, "Host: issuer.beta-exchange.example", "Content-Type: application/x-www-form-urlencoded"],
      [
        `client_id=${encodeURIComponent(SAS_APP_CLIENT)}`,
        "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        `client_assertion=${launchClientAssertion.slice(0, 60)}...`,
        "grant_type=urn:ietf:params:oauth:grant-type:token-exchange",
        "subject_token_type=urn:ietf:params:oauth:token-type:id_token",
        `subject_token=${idToken.slice(0, 60)}...`,
        "requested_token_type=urn:smart:params:oauth:token-type:launch",
        `resource=${encodeURIComponent(`${TICKET_ISSUER}/authorize`)}`,
      ].join("&\n"),
      "text",
    ),
    httpMd(
      "Launch value response",
      ["HTTP/1.1 200 OK", "Content-Type: application/json"],
      {
        access_token: launchValue,
        issued_token_type: "urn:smart:params:oauth:token-type:launch",
        token_type: "N_A",
        expires_in: 300,
      },
    ),
    httpMd("The app's authorize request using the launch value (browser redirect)", [
      `GET ${TICKET_ISSUER}/authorize?response_type=code HTTP/1.1`,
      `  &client_id=${SAS_APP_CLIENT}`,
      "  &redirect_uri=https://bpbuddy.example/callback",
      "  &scope=launch+permission_ticket+patient%2FObservation.rs+offline_access",
      "  &code_challenge=E9Mt... &code_challenge_method=S256 &state=x7Hq",
      `  &launch=${launchValue}`,
    ]),
    httpMd("Local step-up option inside the SMART authorization flow", [
      "HTTP/1.1 200 OK",
      "Content-Type: text/html",
    ], "Maria confirms a one-time code sent to a phone number or email address verified in the CSP evidence.", "text"),
    httpMd("CSP re-authentication option inside the SMART authorization flow", [
      `GET ${CSP_ISS}/authorize?response_type=code&prompt=none HTTP/1.1`,
      "  &client_id=" + encodeURIComponent(SAS_CSP_CLIENT),
      "  &redirect_uri=https://issuer.beta-exchange.example/csp/callback",
      "  &scope=openid",
    ]),
    jwtMd("Fresh id_token from the silent re-auth: same person, new auth event, aud is now the service", ticketEvidence),
    "After the launch-based SMART authorization request starts, record location, consent, and permission-ticket issuance proceed the same way no matter which ceremony the service chooses.",
  ],
);

const blanketTicket = await new SignJWT({
  ticket_type: "patient-self-access-v1",
  subject: {
    patient: { name: [{ family: "Lopez", given: ["Maria"] }], birthDate: "1962-03-15" },
  },
  subject_identity_evidence: ticketEvidence,
  presenter_binding: { jkt: appKeyA.jwk.kid },
  access: {
    permissions: [{ resource_type: "Observation", interactions: ["read", "search"] }],
  },
})
  .setProtectedHeader({ alg: "ES256", kid: ticketIssuerKey.jwk.kid, typ: "JWT" })
  .setIssuer(TICKET_ISSUER)
  .setAudience("https://beta-exchange.example/data-holders")
  .setIssuedAt(now)
  .setExpirationTime(now + 3600)
  .setJti(uuid())
  .sign(ticketIssuerKey.privateKey);

writePage(
  "peer-record-location",
  "The service looks up record locations",
  "Within its own network the lookup is internal. For peer networks it has agreements with, the service queries their record location endpoints system-to-system. The wire shape is a placeholder; what matters is that the service, not the app, sees the answers.",
  [
    httpMd(
      "Request to a peer network's record location endpoint",
      ["POST https://rls.gamma-trust.example/fhir/Patient/$rls HTTP/1.1", "Authorization: Bearer (service credentials under the peering agreement)", "Content-Type: application/fhir+json"],
      {
        resourceType: "Parameters",
        parameter: [
          { name: "demographics", part: [
            { name: "family", valueString: "Lopez" },
            { name: "given", valueString: "Maria" },
            { name: "birthdate", valueDate: "1962-03-15" },
          ]},
        ],
      },
    ),
    httpMd("Response", ["HTTP/1.1 200 OK", "Content-Type: application/fhir+json"], {
      resourceType: "Parameters",
      parameter: [
        { name: "location", part: [
          { name: "organization", valueString: "Riverbend Medical" },
          { name: "fhir-endpoint", valueUrl: "https://fhir.riverbend.example/r4" },
        ]},
      ],
    }),
  ],
);

writePage(
  "blanket-ticket",
  "A blanket ticket: every match disclosed",
  "If Maria chooses every site (or the deployment does in-app selection), the token response carries a single ticket with no data_holder_filter, and endpoint hints for every match. The app learns every care relationship; this is the disclosure that service-side selection avoids.",
  [
    jwtMd("Blanket ticket: no data_holder_filter", blanketTicket),
    httpMd("Endpoint hints accompanying it: every match, all pointing at ticket 0", ["HTTP/1.1 200 OK (excerpt)"], {
      smart_permission_ticket_endpoints: [
        { fhir_base_url: LAKESIDE_FHIR, organization: { resourceType: "Organization", name: "Lakeside Clinic" }, ticket_indices: [0] },
        { fhir_base_url: "https://fhir.countyhealth.example/r4", organization: { resourceType: "Organization", name: "County Health" }, ticket_indices: [0] },
        { fhir_base_url: "https://fhir.generalhospital.example/r4", organization: { resourceType: "Organization", name: "General Hospital" }, ticket_indices: [0] },
      ],
    }),
  ],
);

// =====================================================================
// Keys and trust anchors
// =====================================================================
writePage(
  "keys-and-trust-anchors",
  "Keys and trust anchors",
  "Every signature in this library verifies against these keys. All material is throwaway, generated for the examples.",
  [
    ["**CMS statement signing JWKS** (published at a CMS well-known location):", "", "```json", pretty({ keys: [cmsKey.jwk] }), "```"].join("\n"),
    ["**BP Buddy JWKS** at `" + APP_JWKS_URI + "` (keys A and B):", "", "```json", pretty({ keys: [appKeyA.jwk, appKeyB.jwk] }), "```"].join("\n"),
    ["**CSP (ID.me-style) JWKS:**", "", "```json", pretty({ keys: [cspKey.jwk] }), "```"].join("\n"),
    ["**Beta ticket-issuer JWKS** (signs permission tickets in the alternative shape):", "", "```json", pretty({ keys: [ticketIssuerKey.jwk] }), "```"].join("\n"),
    ["**Gamma community CA certificate** (the anchor Gamma distributes to its data holders):", "", "```", caCertPem.trim(), "```"].join("\n"),
    ["**BP Buddy's Gamma-issued certificate** (subjectAltName URI = `" + APP_URI + "`, chains to the CA above):", "", "```", appCertPem.trim(), "```"].join("\n"),
  ],
);

// =====================================================================
// Index
// =====================================================================
{
  const groups: Array<[string, string[]]> = [
    ["Record location and data access ([authorizing-access.md](../authorizing-access.md))", [
      "software-statement",
      "portal-registration",
      "dynamic-registration",
      "certificate-registration",
      "csp-sign-in",
      "authorization-step",
      "peer-record-location",
      "issuance-token-response",
      "permission-ticket",
      "blanket-ticket",
      "client-credentials-rls",
      "cms-smart-data-holder",
      "key-rotation",
      "keys-and-trust-anchors",
    ]],
  ];
  const byFile = new Map(pages.map((p) => [p.file, p.title]));
  const md = [
    "# Example artifacts",
    "",
    "*Sample requests and responses, one page per step. All JWTs are really signed; each page shows the compact JWS next to its decoded header and payload. Verify anything against [keys-and-trust-anchors](keys-and-trust-anchors.md).*",
    "",
    ...groups.flatMap(([title, files]) => [
      `## ${title}`,
      "",
      ...files.map((f) => `- [${byFile.get(f)}](${f}.md)`),
      "",
    ]),
    `*Generated ${iso(now)} by \`tools/artifact-generator\` in this repository.*`,
  ].join("\n");
  writeFileSync(join(OUT, "index.md"), md);
  writeFileSync(join(OUT, "index.html"), htmlWrapper("Example artifacts", "index.md"));
}

console.log(`Wrote ${pages.length + 1} pages to ${OUT}`);
