// Génère la réponse IA de la conversation de démo en appelant la route /api/chat
// de l'app (serveur local), puis stocke texte et vérification dans src/lib/demo-conversation.json.
// Usage : node scripts/generate-demo-answer.mjs [url de base, défaut http://localhost:3000]
import { readFileSync, writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const META = "\u0000__JIMINI_META__:";
const ERROR = "\u0000__JIMINI_ERROR__:";

const lease = JSON.parse(readFileSync("src/lib/demo-lease.json", "utf8"));
const question =
  "Analyse ce bail commercial du point de vue du preneur : identifie les clauses discutables, le risque juridique de chacune et ce que je peux renégocier avant la signature. Sois synthétique : 900 mots maximum, une section courte par clause.";

const res = await fetch(`${BASE}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: question }],
    mode: "reflexion",
    sources: true,
    documents: [{ name: lease.name, pageTexts: lease.pageTexts }],
  }),
});
if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
const raw = await res.text();
if (raw.includes(ERROR)) throw new Error(raw.slice(raw.indexOf(ERROR)));
const metaIndex = raw.indexOf(META);
if (metaIndex === -1) throw new Error("Vérification absente de la réponse");
const answer = raw.slice(0, metaIndex);
// La réponse stockée doit être complète : pas de coupure, points à vérifier et sources en fin.
if (answer.includes("Réponse interrompue")) throw new Error("Réponse tronquée (max_tokens) : relancez.");
const tail = answer.slice(-2500);
if (!/points à vérifier/i.test(answer) || !/#+\s*sources|\*\*sources\*\*/i.test(tail)) {
  writeFileSync("/tmp/demo-answer-rejected.md", answer);
  throw new Error("Réponse incomplète (points à vérifier ou sources manquants), voir /tmp/demo-answer-rejected.md");
}
const verification = JSON.parse(raw.slice(metaIndex + META.length));

writeFileSync(
  "src/lib/demo-conversation.json",
  `${JSON.stringify({ question, answer, verification }, null, 2)}\n`,
);
const ok = verification.citations.filter((c) => c.status !== "not-found").length;
console.log(
  `${answer.length} caractères · ${verification.citations.length} citations (${ok} vérifiées) · ${verification.legalRefs.length} références`,
);
for (const c of verification.citations) console.log(` ${c.status} p.${c.page} « ${c.excerpt.slice(0, 60)} »`);
for (const r of verification.legalRefs) console.log(` ${r.complete ? "✓" : "?"} ${r.label}`);
