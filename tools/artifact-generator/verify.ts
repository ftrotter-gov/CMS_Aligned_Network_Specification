// Re-verifies every compact JWS in the generated artifact pages against
// the JWKS / certs published in keys-and-trust-anchors.md.
//
// For x5c-bearing tokens, the signature is verified with the leaf
// certificate the token itself presents in its x5c header, and that leaf
// is then chained to the CA anchor from the published page. Verifying
// with a locally known cert instead would pass even if the presented
// x5c were wrong.
import { jwtVerify, importJWK, importX509 } from "jose";
import { X509Certificate } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = join(import.meta.dir, "../../example-artifacts");
const anchors = readFileSync(join(DIR, "keys-and-trust-anchors.md"), "utf8");
const jwksBlocks = [...anchors.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => JSON.parse(m[1]));
const keys = jwksBlocks.flatMap((b) => b.keys);
const pems = [...anchors.matchAll(/```\n(-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----)\n```/g)].map((m) => m[1]);
const caAnchor = new X509Certificate(pems[0]); // the CA appears first on the anchors page

// Artifacts are point-in-time examples; this is a signature-only check, so
// time claims are given a wide explicit numeric tolerance (20 years).
const CLOCK_TOLERANCE_SECONDS = 20 * 365 * 24 * 60 * 60;

const derToPem = (der: string) =>
  `-----BEGIN CERTIFICATE-----\n${der.match(/.{1,64}/g)!.join("\n")}\n-----END CERTIFICATE-----`;

let total = 0, ok = 0;
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(join(DIR, f), "utf8");
  for (const m of text.matchAll(/^(eyJ[\w-]+\.[\w-]+\.[\w-]+)$/gm)) {
    const jwt = m[1];
    total++;
    const header = JSON.parse(Buffer.from(jwt.split(".")[0], "base64url").toString());
    try {
      let key;
      if (header.x5c) {
        const leafPem = derToPem(header.x5c[0]);
        const leaf = new X509Certificate(leafPem);
        if (!leaf.verify(caAnchor.publicKey)) {
          throw new Error("presented x5c leaf does not chain to the published CA anchor");
        }
        key = await importX509(leafPem, header.alg);
      } else {
        key = await importJWK(keys.find((k: any) => k.kid === header.kid), header.alg);
      }
      await jwtVerify(jwt, key, { clockTolerance: CLOCK_TOLERANCE_SECONDS });
      ok++;
    } catch (e) {
      console.log(`FAIL ${f}: kid=${header.kid ?? "x5c"} — ${e}`);
    }
  }
}
console.log(`${ok}/${total} signatures verified (x5c leaves chained to the CA anchor)`);
if (ok !== total) process.exit(1);
