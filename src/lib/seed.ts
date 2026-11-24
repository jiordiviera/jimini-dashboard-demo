import demoConversation from "@/lib/demo-conversation.json";
import demoLease from "@/lib/demo-lease.json";
import type { AnswerVerification, AppState, Conversation, Folder } from "@/lib/types";

export const STATE_VERSION = 3;

/** Conversation ouverte au premier chargement. */
export const DEMO_CONVERSATION_ID = "c_demo_bail";

const DAY = 86_400_000;

function fixedDate(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day, 10, 30).getTime();
}

export function createSeedFolders(): Folder[] {
  const base = fixedDate(2025, 3, 1);
  return [
    {
      id: "f_mercier",
      name: "Groupe Mercier",
      docCount: 45,
      starred: true,
      tone: "periwinkle",
      members: ["JK", "TB", "AR"],
      createdAt: base,
    },
    {
      id: "f_fontaine",
      name: "SARL Fontaine",
      docCount: 52,
      starred: false,
      tone: "periwinkle",
      members: ["JK", "CD"],
      createdAt: base + 1,
    },
    {
      id: "f_natix",
      name: "NATIX c/ ALTIMA",
      docCount: 147,
      starred: true,
      tone: "teal",
      members: ["JK", "PG", "SB", "AR"],
      createdAt: base + 2,
    },
    {
      id: "f_vernet",
      name: "Succession Vernet",
      docCount: 34,
      starred: false,
      tone: "periwinkle",
      members: ["JK", "JV"],
      createdAt: base + 3,
    },
    {
      id: "f_leblanc",
      name: "Leblanc & Associés",
      docCount: 28,
      starred: false,
      tone: "periwinkle",
      members: ["JK", "EL", "TB"],
      createdAt: base + 4,
    },
  ];
}

function conv(
  partial: Omit<Conversation, "documents" | "mode" | "sources" | "updatedAt"> & {
    updatedAt?: number;
  },
): Conversation {
  return {
    documents: [],
    mode: "rapide",
    sources: false,
    updatedAt: partial.updatedAt ?? partial.createdAt,
    ...partial,
  };
}

function createDemoConversation(now: number): Conversation {
  const asked = now - 5 * 60_000;
  return {
    id: DEMO_CONVERSATION_ID,
    title: "Analyse du bail commercial – Le Fournil des Pentes",
    kind: "analysis",
    folderId: null,
    members: ["JK", "AR"],
    mode: "reflexion",
    sources: true,
    createdAt: asked,
    updatedAt: asked + 40_000,
    documents: [
      {
        id: "d_demo_lease",
        name: demoLease.name,
        text: demoLease.pageTexts.join("\n\n"),
        pageTexts: demoLease.pageTexts,
        pages: demoLease.pages,
        size: demoLease.size,
        url: "/demo/bail-commercial-fictif.pdf",
      },
    ],
    messages: [
      {
        id: "m_demo_1",
        role: "user",
        content: demoConversation.question,
        createdAt: asked,
        attachments: [{ name: demoLease.name, pages: demoLease.pages }],
      },
      {
        id: "m_demo_2",
        role: "assistant",
        content: demoConversation.answer,
        createdAt: asked + 40_000,
        verification: demoConversation.verification as AnswerVerification,
      },
    ],
  };
}

export function createSeedConversations(now = Date.now()): Conversation[] {
  const today = now - 2 * 3_600_000;
  const yesterday = now - DAY;
  return [
    createDemoConversation(now),
    conv({
      id: "c_refere",
      title:
        "Rédige un projet d'assignation en référé pour trouble manifestement illicite",
      kind: "draft",
      folderId: "f_natix",
      members: ["JK", "PG"],
      createdAt: today,
      messages: [
        {
          id: "m_refere_1",
          role: "user",
          content:
            "Rédige un projet d'assignation en référé pour trouble manifestement illicite",
          createdAt: today,
        },
        {
          id: "m_refere_2",
          role: "assistant",
          createdAt: today + 20_000,
          content: `## Trame d'assignation en référé

**Juridiction** : Président du tribunal judiciaire (ou du tribunal de commerce selon la nature du litige), statuant en référé.

### 1. Rappel des faits
- [Exposé chronologique et factuel des agissements reprochés]
- [Pièces justificatives : constat, échanges, mises en demeure]

### 2. Discussion
- **Sur le trouble manifestement illicite** : démontrer la violation évidente d'une règle de droit ou d'un droit (contractuel, de propriété, etc.) et son caractère actuel.
- **Sur les mesures sollicitées** : mesures conservatoires ou de remise en état, proportionnées au trouble.
- **Sur l'astreinte** : en assurer l'effectivité.

### 3. Par ces motifs
- Ordonner la cessation des agissements sous astreinte de [montant] € par jour de retard ;
- Condamner le défendeur aux dépens et au titre des frais irrépétibles.

### Points à vérifier par l'avocat
- Compétence matérielle et territoriale
- Références exactes des textes applicables au référé
- Caractère actuel du trouble à la date de l'audience`,
        },
      ],
    }),
    conv({
      id: "c_redflag",
      title: "Red Flag audit SARL Fontaine",
      kind: "analysis",
      folderId: "f_fontaine",
      members: ["JK", "CD"],
      createdAt: yesterday,
      messages: [
        {
          id: "m_redflag_1",
          role: "user",
          content:
            "Red Flag audit SARL Fontaine : identifie les principaux risques dans la documentation transmise.",
          createdAt: yesterday,
        },
        {
          id: "m_redflag_2",
          role: "assistant",
          createdAt: yesterday + 30_000,
          content: `## Synthèse des red flags

| Domaine | Constat | Gravité | Recommandation |
|---|---|---|---|
| Corporate | Approbation des comptes à confirmer | Moyenne | Demander les PV d'AG |
| Contrats | Clause de changement de contrôle chez un client clé | Élevée | Obtenir une renonciation |
| Social | Contrats de travail sans clause de non-concurrence | Faible | Évaluer le besoin |

### Points à vérifier par l'avocat
- Exhaustivité de la data room
- Dates d'échéance des contrats significatifs`,
        },
      ],
    }),
    conv({
      id: "c_technova",
      title: "Adapte le contrat de travail TechNova pour Madame Julie Lester",
      kind: "draft",
      folderId: null,
      members: ["JK"],
      createdAt: fixedDate(2025, 3, 22),
      messages: [
        {
          id: "m_technova_1",
          role: "user",
          content:
            "Adapte le contrat de travail TechNova pour Madame Julie Lester",
          createdAt: fixedDate(2025, 3, 22),
        },
        {
          id: "m_technova_2",
          role: "assistant",
          createdAt: fixedDate(2025, 3, 22) + 25_000,
          content: `Pour adapter le contrat, j'ai besoin des éléments suivants :

1. **Poste et classification** selon la convention collective applicable
2. **Date d'entrée** et durée de la période d'essai
3. **Rémunération** fixe et variable
4. **Temps de travail** (forfait jours ou horaire)

Joignez le modèle TechNova et je produirai une version complétée, en signalant chaque modification.

### Points à vérifier par l'avocat
- Convention collective applicable
- Conformité de la période d'essai et de son renouvellement`,
        },
      ],
    }),
    conv({
      id: "c_vernet",
      title:
        "Compare les déclarations des héritiers et identifie les incohérences",
      kind: "chat",
      folderId: "f_vernet",
      members: ["JK", "JV"],
      createdAt: fixedDate(2025, 3, 21),
      messages: [
        {
          id: "m_vernet_1",
          role: "user",
          content:
            "Compare les déclarations des héritiers et identifie les incohérences",
          createdAt: fixedDate(2025, 3, 21),
        },
        {
          id: "m_vernet_2",
          role: "assistant",
          createdAt: fixedDate(2025, 3, 21) + 40_000,
          content: `Je peux comparer les déclarations dès qu'elles sont jointes. Je produirai :

- un **tableau comparatif** par thème (donations antérieures, biens communs, comptes bancaires, dettes) ;
- la liste des **incohérences** avec citation des passages concernés ;
- les **questions à poser** à chaque héritier.

### Points à vérifier par l'avocat
- Inventaire notarié et relevés bancaires
- Existence de donations rapportables`,
        },
      ],
    }),
    conv({
      id: "c_nda",
      title: "Publipostage IA - Accord de confidentialité Groupe Mercier",
      kind: "mailmerge",
      folderId: "f_mercier",
      members: ["JK", "TB", "AR"],
      createdAt: fixedDate(2025, 3, 19),
      messages: [
        {
          id: "m_nda_1",
          role: "user",
          content:
            "Publipostage IA - Accord de confidentialité Groupe Mercier pour nos 12 partenaires",
          createdAt: fixedDate(2025, 3, 19),
        },
        {
          id: "m_nda_2",
          role: "assistant",
          createdAt: fixedDate(2025, 3, 19) + 35_000,
          content: `## Modèle d'accord de confidentialité

**Entre** Groupe Mercier, [forme sociale], dont le siège est situé [adresse],
**et** [Dénomination du partenaire], représentée par [Représentant].

**Article 1 – Objet** : encadrer les échanges relatifs à [Objet des échanges].
**Article 2 – Informations confidentielles** : toute information transmise, quel qu'en soit le support.
**Article 3 – Durée** : [durée] à compter de la signature.

Les champs entre crochets seront remplis pour chacun des 12 partenaires.

### Points à vérifier par l'avocat
- Durée de confidentialité post-contractuelle
- Juridiction compétente et loi applicable`,
        },
      ],
    }),
  ];
}

export function createSeedState(now = Date.now()): AppState {
  return {
    version: STATE_VERSION,
    folders: createSeedFolders(),
    conversations: createSeedConversations(now),
  };
}
