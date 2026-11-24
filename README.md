# Jimini · tableau de bord (démo)

> **Démo non officielle, non affiliée à Jimini.** Projet de candidature réalisé par Jiordi Kengne ([jiordiviera.me](https://jiordiviera.me)).

Reproduction fonctionnelle du tableau de bord de l'assistant juridique IA [Jimini](https://www.jimini.ai) : l'IA répond vraiment, en streaming, via l'API Anthropic.

## Fonctionnalités

- Chat IA en streaming (Markdown, Stop, Copier, Régénérer), contexte des 20 derniers messages
- Modes **Rapide** et **Réflexion**, option **Sources** (textes de loi cités en fin de réponse)
- Pièces jointes PDF, TXT, MD et CSV (glisser-déposer, 5 fichiers de 8 Mo) injectées dans des balises `<document>`
- Modèles de prompts (chips, actions rapides ⚡, menu « Plus »)
- Dossiers (créer, renommer, supprimer, favoris, recherche) et rattachement des conversations
- Historique sauvegardé automatiquement (recherche, renommage, suppression)
- Dictée vocale (Web Speech API, fr-FR), sidebar repliable, version mobile avec Sheet

Aucune base de données : l'état est conservé dans le `localStorage` du navigateur.

## Stack

Next.js 16 (App Router, TypeScript strict) · Tailwind CSS v4 · shadcn/ui · Heroicons · `@anthropic-ai/sdk` (appelé côté serveur, sans proxy) · `unpdf` · polices Inter et Newsreader via `next/font`.

## Lancer en local

```bash
pnpm install
cp .env.example .env.local   # puis renseigner ANTHROPIC_API_KEY
pnpm dev
```

| Variable | Rôle |
| --- | --- |
| `ANTHROPIC_API_KEY` | Obligatoire, utilisée uniquement côté serveur |
| `ANTHROPIC_MODEL` | Optionnelle, `claude-sonnet-5-5` par défaut |

## Structure

```
src/app/api/chat       Route de streaming (Anthropic)
src/app/api/extract    Extraction de texte des pièces jointes
src/components         Sidebar, composer, cartes dossiers, chat…
src/components/views   Accueil, dossier(s), historique, pages fonctionnalités
src/lib                Store localStorage, prompts, types, données de départ
```

Le logo et le favicon appartiennent à Jimini et ne sont utilisés ici qu'à titre de démonstration.
