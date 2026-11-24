import type { FeatureKey } from "@/lib/types";

export const SYSTEM_PROMPT = `Tu es Jimini, un assistant juridique IA destiné aux professionnels du droit français (avocats, juristes d'entreprise, notaires).

Règles impératives :
- Réponds toujours en français, dans un registre professionnel, de façon claire et structurée (titres courts, listes, tableaux Markdown quand c'est utile).
- Raisonne en droit français. Si une question relève d'un autre droit, signale-le.
- Ne cite un article de code ou de loi que si tu es certain de sa numérotation et de son contenu. En cas de doute, décris la règle sans donner de numéro et indique qu'il faut vérifier la référence.
- N'invente jamais de jurisprudence, de numéro de pourvoi, de date de décision, de nom de partie ni de référence de publication. Si tu évoques une tendance jurisprudentielle, présente-la comme telle, sans référence précise inventée.
- Si des documents sont fournis dans des balises <document>, appuie-toi d'abord sur eux, en suivant les règles de citation ci-dessous, et signale ce qui n'y figure pas.
- Ne prétends pas avoir consulté des bases de données, Légifrance ou des sources en ligne.
- Termine chaque réponse par une section « Points à vérifier par l'avocat » listant les éléments à contrôler (références, faits manquants, délais, pièces).`;

export const REFLEXION_INSTRUCTIONS = `Mode Réflexion : mène une analyse approfondie.
- Commence par reformuler brièvement la question et les faits pertinents.
- Identifie les qualifications juridiques possibles et les règles applicables.
- Examine les arguments pour et contre, les risques, les exceptions et les délais.
- Propose une conclusion argumentée et des recommandations opérationnelles hiérarchisées.`;

export const RAPIDE_INSTRUCTIONS = `Mode Rapide : va à l'essentiel. Réponse concise et directement exploitable, sans développements superflus.`;

export function citationInstructions(documentCount: number): string {
  const format =
    documentCount > 1
      ? '[docN:p.X "extrait exact"], où N est le numéro (index) du document et X le numéro de page'
      : '[doc:p.X "extrait exact"], où X est le numéro de page';
  return `Règles de citation des documents joints (obligatoires) :
- Chaque affirmation tirée d'un document est suivie de sa source au format ${format}.
- L'extrait est copié mot pour mot depuis la page indiquée (balise <page number="X">) : mêmes mots, même ordre, sans reformulation, sans correction et sans ellipse. Longueur : 6 à 25 mots.
- Une citation par extrait ; place-la juste après la phrase qu'elle étaie. N'utilise jamais ce format pour autre chose qu'un extrait réel du document.
- Les citations sont vérifiées automatiquement : un extrait inexact sera signalé comme introuvable.`;
}

export const SOURCES_INSTRUCTIONS = `L'utilisateur a activé l'option Sources : termine ta réponse (après les points à vérifier) par une section « Sources » listant les textes de loi et articles de code mobilisés, uniquement ceux dont tu es certain, et les extraits des documents fournis le cas échéant. Si tu n'as aucune source certaine, écris-le.`;

export interface PromptTemplate {
  id: string;
  label: string;
  prompt: string;
}

export const CHIP_TEMPLATES: PromptTemplate[] = [
  {
    id: "magic",
    label: "Baguette magique",
    prompt:
      "Améliore et reformule ce texte juridique pour le rendre plus clair, plus précis et plus convaincant, en conservant son sens et son niveau de langue :\n\n",
  },
  {
    id: "analysis",
    label: "Grille d'analyse",
    prompt:
      "Établis une grille d'analyse des risques de ce contrat : clause, risque, gravité, recommandation. Présente le résultat sous forme de tableau.",
  },
  {
    id: "mailmerge",
    label: "Publipostage IA",
    prompt:
      "Prépare un modèle de courrier type adaptable à plusieurs destinataires, avec des champs variables entre crochets ([Nom], [Adresse], [Date], [Référence dossier]) pour : ",
  },
  {
    id: "translate",
    label: "Traduction",
    prompt:
      "Traduis ce document en anglais juridique en conservant la terminologie technique, puis signale les notions sans équivalent exact :\n\n",
  },
];

export const MORE_TEMPLATES: PromptTemplate[] = [
  {
    id: "summary",
    label: "Résumé",
    prompt:
      "Résume ce document en une page : objet, parties, obligations principales, montants, durées et points d'attention.",
  },
  {
    id: "timeline",
    label: "Chronologie des faits",
    prompt:
      "Établis une chronologie précise des faits à partir des pièces jointes, sous forme de tableau : date, fait, source (document et passage).",
  },
  {
    id: "notice",
    label: "Projet de mise en demeure",
    prompt:
      "Rédige un projet de mise en demeure adressée à [débiteur] pour [objet de la créance], avec rappel des faits, fondement contractuel et légal, délai de régularisation et conséquences en cas d'inexécution.",
  },
  {
    id: "redflags",
    label: "Red flags",
    prompt:
      "Identifie les red flags de ce document (clauses déséquilibrées, risques financiers, risques de nullité, obligations ambiguës) et classe-les par niveau de gravité.",
  },
  {
    id: "compare",
    label: "Comparaison de versions",
    prompt:
      "Compare ces deux versions du document et liste les modifications substantielles, avec leur impact juridique pour mon client.",
  },
  {
    id: "email",
    label: "Email au client",
    prompt:
      "Rédige un email clair et pédagogique à mon client pour lui expliquer la situation suivante, les options possibles et la suite recommandée : ",
  },
];

export interface FeatureInfo {
  key: FeatureKey;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  prompt: string;
}

export const FEATURES: Record<FeatureKey, FeatureInfo> = {
  analysis: {
    key: "analysis",
    title: "Grille d'analyse",
    tagline: "Analysez des dizaines de documents en une seule grille.",
    description:
      "Posez les mêmes questions à un ensemble de contrats et obtenez une grille structurée, clause par clause, avec le niveau de risque et une recommandation.",
    bullets: [
      "Extraction des clauses clés (durée, résiliation, responsabilité, non-concurrence…)",
      "Notation du risque et recommandations actionnables",
      "Citations exactes des passages sources",
    ],
    prompt: CHIP_TEMPLATES[1].prompt,
  },
  mailmerge: {
    key: "mailmerge",
    title: "Publipostage IA",
    tagline: "Générez des documents personnalisés à grande échelle.",
    description:
      "Partez d'un modèle et d'une liste de destinataires : Jimini adapte chaque document au contexte de chacun, en conservant votre style.",
    bullets: [
      "Champs variables détectés automatiquement",
      "Adaptation du ton et des mentions à chaque destinataire",
      "Export prêt à relire",
    ],
    prompt:
      "Prépare un accord de confidentialité type pour le Groupe Mercier, avec des champs variables entre crochets pour chaque partenaire ([Dénomination], [Siège], [Représentant], [Objet des échanges]).",
  },
  pdf: {
    key: "pdf",
    title: "Édition de PDF",
    tagline: "Modifiez, annotez et réorganisez vos PDF avec l'IA.",
    description:
      "Joignez un PDF : Jimini le lit, propose des modifications rédactionnelles, repère les incohérences et prépare une version annotée.",
    bullets: [
      "Lecture du texte des PDF joints",
      "Propositions de reformulation clause par clause",
      "Repérage des renvois et définitions incohérents",
    ],
    prompt:
      "Relis le PDF joint et propose une version révisée des clauses ambiguës, avec pour chacune : texte actuel, proposition, justification.",
  },
  litigation: {
    key: "litigation",
    title: "Contentieux",
    tagline: "Préparez vos dossiers contentieux plus vite.",
    description:
      "Chronologies, synthèses de pièces, trames d'assignation et de conclusions : Jimini vous aide à structurer votre argumentation.",
    bullets: [
      "Chronologie des faits à partir des pièces",
      "Trames d'actes et de conclusions",
      "Identification des moyens et des points faibles",
    ],
    prompt:
      "Rédige un projet d'assignation en référé pour trouble manifestement illicite. Faits : [résumé des faits]. Demandeur : [partie]. Défendeur : [partie].",
  },
  library: {
    key: "library",
    title: "Bibliothèque",
    tagline: "Vos modèles et clauses, toujours à portée de main.",
    description:
      "Centralisez vos modèles d'actes, clauses types et prompts favoris pour les réutiliser dans le chat en un clic.",
    bullets: [
      "Modèles de prompts partagés par l'équipe",
      "Clauses types annotées",
      "Réutilisation directe dans le chat",
    ],
    prompt:
      "Propose une clause de limitation de responsabilité équilibrée pour un contrat de prestation de services informatiques B2B, avec deux variantes (favorable au prestataire / favorable au client).",
  },
};
