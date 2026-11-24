import type { Metadata } from "next";
import Link from "next/link";
import { JiminiLogo } from "@/components/jimini-logo";

export const metadata: Metadata = {
  title: "Comment je l'ai construit · démo Jimini",
  description: "Architecture, vérification des citations, limites et prochaines étapes de la démo.",
};

const sections: { title: string; items: string[] }[] = [
  {
    title: "Architecture",
    items: [
      "Next.js 16 (App Router, TypeScript strict), Tailwind CSS v4, shadcn/ui. L'interface est une seule page client ; l'état (dossiers, historique, profil) vit dans le localStorage, sans base de données.",
      "/api/chat appelle Claude directement avec le SDK Anthropic (runtime Node, sans proxy) et renvoie la réponse en streaming texte. Les 20 derniers messages servent de contexte.",
      "/api/extract lit les PDF avec unpdf en conservant le découpage par page (TXT, MD et CSV comptent pour une page). Les pages sont transmises au modèle dans des balises <document> et <page number>.",
    ],
  },
  {
    title: "Vérification des citations",
    items: [
      "Quand un document est joint, le modèle doit sourcer chaque affirmation au format [doc:p.X \"extrait exact\"].",
      "À la fin du flux, le serveur normalise les textes (espaces, apostrophes, guillemets, casse) et cherche chaque extrait à la page indiquée, puis dans tout le document. Résultat : vérifié, trouvé sur une autre page, ou « extrait introuvable » en rouge.",
      "Les références légales (articles et code, lois) sont repérées par motif. Une référence sans code, sans numéro ou sans date est marquée « à vérifier ». Chaque pastille ouvre une recherche Légifrance.",
    ],
  },
  {
    title: "Limites",
    items: [
      "Un extrait vérifié existe bien dans le document ; cela ne prouve pas qu'il soutienne l'argument.",
      "Les références légales sont contrôlées sur leur forme, pas sur leur existence ni sur la version en vigueur.",
      "Pas d'OCR : un PDF scanné ne livre aucun texte. Au-delà d'environ 150 000 caractères, le document est tronqué.",
      "Démo sans authentification : les données restent dans le navigateur, et les fichiers ne sont pas conservés côté serveur.",
    ],
  },
  {
    title: "Prochaines étapes",
    items: [
      "RAG : découpage en passages, embeddings et recherche hybride pour interroger des dossiers volumineux au lieu d'injecter chaque document en entier.",
      "Évaluations : un jeu de questions annoté par des juristes, avec le taux de citations vérifiées et de références inventées mesuré à chaque changement de prompt ou de modèle.",
      "Vérification des articles contre l'API Légifrance (PISTE), version en vigueur à la date de l'acte comprise.",
      "Hébergement des données : en France ou dans l'UE, chiffrement, cloisonnement par cabinet, journalisation des accès, et aucune rétention des données côté fournisseur de modèle.",
    ],
  },
];

export default function HowIBuiltItPage() {
  return (
    <main className="h-full overflow-y-auto bg-jm-page">
      <div className="mx-auto max-w-[680px] px-5 py-12 sm:py-16">
        <Link
          href="/"
          className="text-[13px] font-medium text-jm-muted transition-colors hover:text-jm-ink"
        >
          ← Retour à la démo
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <JiminiLogo className="h-6 text-jm-blue" />
          <span className="text-[12px] font-medium tracking-[0.08em] text-jm-subtle uppercase">
            Démo non officielle
          </span>
        </div>
        <h1 className="mt-4 font-serif text-[34px] leading-tight text-jm-ink">
          Comment je l&apos;ai construit
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-jm-ink-3">
          Une reproduction fonctionnelle du tableau de bord Jimini, avec un parti pris : chaque
          affirmation tirée d&apos;un document doit pouvoir être vérifiée en un clic.
        </p>

        <div className="mt-10 flex flex-col gap-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[15px] font-semibold text-jm-ink">{section.title}</h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 text-[14px] leading-relaxed text-jm-ink-2 before:absolute before:top-[0.7em] before:left-0 before:size-1.5 before:rounded-full before:bg-jm-folder"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-jm-border pt-5 text-[12.5px] text-jm-muted">
          Jiordi Kengne ·{" "}
          <a href="https://jiordiviera.me" target="_blank" rel="noreferrer" className="hover:text-jm-ink hover:underline">
            jiordiviera.me
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/jiordiviera/jimini-dashboard-demo"
            target="_blank"
            rel="noreferrer"
            className="hover:text-jm-ink hover:underline"
          >
            code source
          </a>
          . Projet non affilié à Jimini.
        </p>
      </div>
    </main>
  );
}
