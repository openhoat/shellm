# Post LinkedIn - Retour d'expérience Vibe Coding

---

Pourquoi le **vibe coding** n'est pas à la portée du premier venu.

**Termaid** (github.com/openhoat/termaid) — un terminal construit par l'IA pour l'IA — a été pour moi un terrain d'**expérience** grandeur nature pour éprouver cette nouvelle posture. Si l'on vise un produit de qualité et une **developer expérience** satisfaisante, l'exercice devient extrêmement **exigeant**.

J'en tire un enseignement majeur : on peut livrer un produit **production-ready** (Electron, tests E2E, i18n) en un temps record, mais l'efficience ne vient pas du "chat".

La plupart du temps, on **peaufine le cadre** plus qu'on ne demande à produire. Sans ces **rails** méthodologiques, l'IA multiplie le chaos plus vite qu'elle ne génère de valeur.

### 1. La combinatoire tout terrain

Travailler avec Claude Code et Opus ou Sonnet, c'est très efficace, mais attention à la facture, un forfait Pro suffit rarement.

Par ailleurs, dans les phases de réflexions et ajustements préparatoires, comme le découpage d'une épique, 
le mode plan de Cline se révèle plus naturel, là où Claude Code a tendance à aimer passer à l'action un peu trop rapidement, sans consentement.

C'est pour cette raison que je joue sur une **matrice d'outils** selon le besoin et sa criticité :
- **Claude Code** (Opus/Sonnet) pour l'architecture lourde, la rapidité et l'efficacité.
- **Cline** avec **Gemini Flash** pour la vélocité cloud, les questions périphériques au code.
- le couple **Ollama/GLM5** (utilisé aussi bien via Claude Code que Cline) :
  - alternative à Sonnet
  - moins coûteuse
  - quasiment équivalente en terme d'efficacité, bien que plus lente.

L'avantage est double : on préserve les crédits pour la haute valeur ajoutée et on itère sans limite (voire gratuitement en local).

> Astuce :
> Faire tourner une stack ollama dans un conteneur docker (par exemple propulsé par une toute petite VM freebox, avec 2Go de RAM) 
> et utiliser une 10aine de modèles cloud (glm, gptoss, qwen, …), ça offre un compromis intéressant entre l'outillage local et la puissance du modèle, 
> avec une endurance intéressante pour 20€/mois

### 2. Poser les rails

L'IA ne "comprend" pas votre projet, elle suit vos **contraintes**. La réussite tient à la préparation du terrain :

*   Un **Kanban intégré** (`KANBAN.md`) comme source unique de vérité. C'est le point de synchronisation vital entre l'humain et les agents.
*   Des **Git Worktrees** pour forcer l’**isolation des contextes**. Une branche, une feature, un répertoire dédié. C'est le seul moyen d'éviter les pollutions croisées quand on délègue massivement.
*   Des **Rules** (`.clinerules`) et des **Skills** qui servent de garde-fous. L'IA s'auto-valide via des scripts de **quality check** avant chaque commit.

### 3. Du développeur à l'orchestrateur

L’**écueil** classique est de traiter l’IA comme un simple générateur de code. Le vrai **sens** de cette approche est d'automatiser le processus (le fameux "comment") pour se concentrer sur le **produit** (le "quoi").

Réussir son vibe coding, c'est passer 80% de son temps à **définir le cadre** et 20% à **valider les sorties**.

L'efficience n'est pas dans le volume de code produit, mais dans la **maîtrise du flux**.

👌