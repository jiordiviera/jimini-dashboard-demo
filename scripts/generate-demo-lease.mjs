// Génère le bail commercial fictif de la démo (public/demo/bail-commercial-fictif.pdf)
// puis en extrait le texte page par page avec unpdf (src/lib/demo-lease.json),
// pour que la conversation de démo utilise exactement le texte que lirait l'app.
// Usage : node --experimental-strip-types scripts/generate-demo-lease.mjs
import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { extractText, getDocumentProxy } from "unpdf";
import { stripRunningLines } from "../src/lib/citations.ts";

const TITLE = "BAIL COMMERCIAL";
const SUBTITLE = "Soumis aux articles L. 145-1 et suivants du Code de commerce";

/** @type {Array<{ h?: string; p?: string }>} */
const CONTENT = [
  { h: "ENTRE LES SOUSSIGNÉS" },
  {
    p: "La SCI DES TILLEULS, société civile immobilière au capital de 10 000 euros, dont le siège est situé 8 place des Acacias, 69006 Lyon, représentée par sa gérante, ci-après dénommée « le Bailleur »,",
  },
  {
    p: "ET la SARL LE FOURNIL DES PENTES, société à responsabilité limitée au capital de 20 000 euros, dont le siège est situé 14 rue des Pentes, 69004 Lyon, représentée par son gérant, ci-après dénommée « le Preneur ».",
  },
  {
    p: "Les parties déclarent que le présent document est entièrement fictif. Il a été rédigé pour une démonstration et ne doit pas être utilisé comme modèle.",
  },
  { h: "ARTICLE 1 - DÉSIGNATION" },
  {
    p: "Le Bailleur donne à bail au Preneur, qui accepte, un local commercial situé au rez-de-chaussée d'un immeuble sis 14 rue des Pentes, 69004 Lyon, d'une surface d'environ 85 mètres carrés, comprenant une boutique, un fournil, une réserve et un sanitaire, ainsi qu'une cave d'environ 20 mètres carrés. Le Preneur déclare bien connaître les lieux pour les avoir visités.",
  },
  { h: "ARTICLE 2 - DESTINATION" },
  {
    p: "Les locaux sont exclusivement destinés à l'activité de boulangerie, pâtisserie, viennoiserie et vente de boissons non alcoolisées à emporter. Toute autre activité, même connexe ou complémentaire, est interdite sans l'accord préalable et écrit du Bailleur.",
  },
  { h: "ARTICLE 3 - DURÉE" },
  {
    p: "Le présent bail est consenti pour une durée de neuf années entières et consécutives, qui commenceront à courir le 1er janvier 2025 pour se terminer le 31 décembre 2033.",
  },
  {
    p: "Par dérogation expresse, le Preneur renonce à la faculté de donner congé à l'expiration de chaque période triennale. Il ne pourra quitter les lieux qu'à l'expiration de la neuvième année, sauf accord exprès du Bailleur.",
  },
  { h: "ARTICLE 4 - LOYER" },
  {
    p: "Le bail est consenti moyennant un loyer annuel hors taxes et hors charges de 24 000 euros, payable trimestriellement et d'avance, le premier jour de chaque trimestre civil, par virement sur le compte désigné par le Bailleur. Le loyer est soumis à la TVA, le Bailleur ayant opté pour l'assujettissement.",
  },
  { h: "ARTICLE 5 - INDEXATION" },
  {
    p: "Le loyer sera révisé automatiquement chaque année à la date anniversaire du bail, en fonction de la variation de l'indice des loyers commerciaux (ILC) publié par l'INSEE, l'indice de référence étant celui du deuxième trimestre 2024.",
  },
  {
    p: "Il est expressément convenu que la présente clause ne pourra en aucun cas avoir pour effet de réduire le loyer. En cas de baisse de l'indice, le loyer en vigueur sera maintenu jusqu'à la prochaine révision.",
  },
  { h: "ARTICLE 6 - DÉPÔT DE GARANTIE" },
  {
    p: "Le Preneur verse ce jour au Bailleur une somme de 6 000 euros, correspondant à trois mois de loyer hors taxes, à titre de dépôt de garantie. Cette somme ne sera pas productive d'intérêts et sera restituée au Preneur dans un délai de deux mois suivant la remise des clés, déduction faite des sommes dues au Bailleur.",
  },
  { h: "ARTICLE 7 - CHARGES, IMPÔTS ET TRAVAUX" },
  {
    p: "Le Preneur remboursera au Bailleur, en sus du loyer, l'intégralité des charges, taxes et prestations afférentes aux locaux et à l'immeuble, et notamment la taxe foncière, la taxe d'enlèvement des ordures ménagères, les primes d'assurance de l'immeuble et les honoraires de gestion du Bailleur.",
  },
  {
    p: "Le Preneur supportera également le coût des grosses réparations visées à l'article 606 du Code civil, ainsi que l'ensemble des travaux de mise en conformité de l'immeuble prescrits par l'administration, quelle qu'en soit la nature.",
  },
  {
    p: "Une provision trimestrielle de 900 euros sera versée avec chaque terme de loyer. Une régularisation interviendra chaque année au vu des dépenses réelles.",
  },
  { h: "ARTICLE 8 - ÉTAT DES LIEUX ET ENTRETIEN" },
  {
    p: "Un état des lieux contradictoire sera établi lors de la remise des clés. Le Preneur entretiendra les locaux en bon état de réparations locatives pendant toute la durée du bail. Il ne pourra effectuer aucun percement de mur, aucun changement de distribution ni aucune démolition sans l'autorisation écrite du Bailleur.",
  },
  {
    p: "Les travaux et améliorations réalisés par le Preneur resteront acquis au Bailleur en fin de bail, sans indemnité, à moins que le Bailleur ne préfère exiger la remise des lieux dans leur état primitif, aux frais du Preneur.",
  },
  { h: "ARTICLE 9 - CESSION ET SOUS-LOCATION" },
  {
    p: "Le Preneur ne pourra céder son droit au bail qu'à l'acquéreur de son fonds de commerce, par acte authentique auquel le Bailleur sera appelé. Le cédant restera garant solidaire du cessionnaire pour le paiement des loyers et l'exécution des conditions du bail pendant une durée de trois ans à compter de la cession. Toute sous-location, totale ou partielle, est interdite.",
  },
  { h: "ARTICLE 10 - ASSURANCES" },
  {
    p: "Le Preneur s'assurera auprès d'une compagnie notoirement solvable contre l'incendie, le dégât des eaux, les risques locatifs et le recours des voisins et des tiers, et justifiera de ces assurances à première demande du Bailleur.",
  },
  { h: "ARTICLE 11 - CLAUSE RÉSOLUTOIRE" },
  {
    p: "À défaut de paiement d'un seul terme de loyer ou de charges à son échéance, ou d'inexécution de l'une quelconque des clauses du présent bail, et un mois après un commandement de payer ou une sommation d'exécuter restés sans effet, le bail sera résilié de plein droit si bon semble au Bailleur, sans qu'il soit besoin de remplir aucune formalité judiciaire.",
  },
  { h: "ARTICLE 12 - DIAGNOSTICS ET ANNEXES" },
  {
    p: "Sont annexés au présent bail : l'état des risques et pollutions, le diagnostic de performance énergétique, l'inventaire des catégories de charges, impôts, taxes et redevances, ainsi que l'état des lieux d'entrée.",
  },
  { h: "ARTICLE 13 - ÉLECTION DE DOMICILE" },
  {
    p: "Pour l'exécution des présentes et de leurs suites, les parties font élection de domicile en leur siège respectif. Tout litige relatif au présent bail relèvera de la compétence des juridictions de Lyon.",
  },
  { p: "Fait à Lyon, le 15 décembre 2024, en deux exemplaires originaux." },
  { p: "Le Bailleur                                                                  Le Preneur" },
];

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN_X = 80;
const TOP = 770;
const BOTTOM = 80;
const SIZE = 12;
const LEADING = 18;

const pdf = await PDFDocument.create();
pdf.setTitle("Bail commercial fictif - démo Jimini");
pdf.setAuthor("Démo non officielle");
const regular = await pdf.embedFont(StandardFonts.TimesRoman);
const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
const sans = await pdf.embedFont(StandardFonts.Helvetica);
const maxWidth = PAGE.width - MARGIN_X * 2;
const ink = rgb(0.12, 0.13, 0.19);

function wrap(text, font, size) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

let page = pdf.addPage([PAGE.width, PAGE.height]);
let y = TOP;

function newPage() {
  page = pdf.addPage([PAGE.width, PAGE.height]);
  y = TOP;
}

function ensure(height) {
  if (y - height < BOTTOM) newPage();
}

// Titre
page.drawText(TITLE, {
  x: (PAGE.width - bold.widthOfTextAtSize(TITLE, 18)) / 2,
  y,
  size: 18,
  font: bold,
  color: ink,
});
y -= 22;
page.drawText(SUBTITLE, {
  x: (PAGE.width - regular.widthOfTextAtSize(SUBTITLE, 10)) / 2,
  y,
  size: 10,
  font: regular,
  color: ink,
});
y -= 34;

for (const block of CONTENT) {
  if (block.h) {
    ensure(LEADING * 3);
    y -= 6;
    page.drawText(block.h, { x: MARGIN_X, y, size: SIZE, font: bold, color: ink });
    y -= LEADING + 2;
  } else if (block.p) {
    const lines = wrap(block.p, regular, SIZE);
    for (const line of lines) {
      ensure(LEADING);
      page.drawText(line, { x: MARGIN_X, y, size: SIZE, font: regular, color: ink });
      y -= LEADING;
    }
    y -= 6;
  }
}

const pages = pdf.getPages();
pages.forEach((p, index) => {
  const footer = `Document fictif généré pour une démonstration - page ${index + 1}/${pages.length}`;
  p.drawText(footer, {
    x: (PAGE.width - sans.widthOfTextAtSize(footer, 8)) / 2,
    y: 40,
    size: 8,
    font: sans,
    color: rgb(0.45, 0.47, 0.55),
  });
});

const bytes = await pdf.save();
writeFileSync("public/demo/bail-commercial-fictif.pdf", bytes);

const proxy = await getDocumentProxy(new Uint8Array(bytes));
const { totalPages, text } = await extractText(proxy, { mergePages: false });
const cleaned = stripRunningLines(
  text.map((t) =>
    t
      .replace(/\u0000/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  ),
);
writeFileSync(
  "src/lib/demo-lease.json",
  `${JSON.stringify({ name: "bail-commercial-fictif.pdf", size: bytes.length, pages: totalPages, pageTexts: cleaned }, null, 2)}\n`,
);
console.log(`PDF : ${totalPages} pages, ${bytes.length} octets`);
cleaned.forEach((t, i) => console.log(`--- page ${i + 1} (${t.length} car.)\n${t.slice(0, 160)}`));
