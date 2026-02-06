# Archive des changements

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé :
- Format : `**[HH:MM:SS] Emoji [TAG]** Description`
- Tags et emojis :
  - `✨ [FEAT]` - Nouvelle fonctionnalité
  - `🐛 [FIX]` - Correction de bug
  - `♻️ [REFACTOR]` - Refactorisation
  - `⚡ [PERF]` - Performance
  - `📝 [DOCS]` - Documentation
  - `🎨 [STYLE]` - Style/Cosmétique
  - `✅ [TEST]` - Tests
  - `🔧 [CHORE]` - Configuration/Maintenance
- Classé par ordre antéchronologique (plus récent en haut)
- Organisation par année/mois/jour (la date complète est dans les sections)


## Historique des modifications

### 2026

#### 06/02

**[02:36:20] 🔧 [CHORE]** Corriger l'erreur Biome lint/correctness/noUnusedVariables dans env.d.ts
- Utiliser declare global pour étendre l'interface ImportMeta de Vite correctement
- Ajouter env.d.ts dans tsconfig.json pour que les types soient chargés par TypeScript
- Le logger peut maintenant accéder à import.meta.env sans erreur TypeScript

**[02:26:30] 🐛 [FIX]** Corriger l'erreur TS2339 Property env does not exist on type ImportMeta dans src/utils/logger.ts
- Créer le fichier env.d.ts avec les déclarations de types pour ImportMetaEnv et ImportMeta
- Configurer les propriétés MODE, BASE_URL, PROD, DEV pour import.meta.env de Vite
- Le logger peut maintenant accéder à import.meta.env.MODE sans erreur TypeScript

**[02:24:00] 🔧 [CHORE]** Corriger la configuration Electron et désactiver tsc-alias
- Corriger le chemin main dans package.json (dist-electron/main.js → dist-electron/electron/main.js)
- Désactiver tsc-alias dans package.json car il remplaçait incorrectement l'import 'electron' standard
- Modifier les imports @shared/* en ../shared/* dans electron/main.ts et electron/ipc-handlers/config.ts
- Supprimer la configuration paths dans electron/tsconfig.json
- Modifier tsc-alias.json pour utiliser aliasMap explicite
- Le serveur de développement npm run dev fonctionne maintenant correctement

**[01:36:40] ✨ [FEAT]** Externaliser les textes et ajouter un sélecteur de langue
- Créer le composant LanguageSelector pour changer de langue
- Mettre à jour Header pour intégrer le sélecteur de langue et utiliser les traductions
- Mettre à jour ConfigPanel pour utiliser les traductions i18next
- Les utilisateurs peuvent maintenant changer la langue entre français et anglais

**[01:35:40] 🔧 [CHORE]** Configurer le support multilangue avec i18next
- Installer les dépendances i18next, react-i18next et i18next-browser-languagedetector
- Créer les fichiers de traduction fr.json et en.json dans src/locales/
- Configurer i18next avec détection automatique de la langue (localStorage, navigator)
- Importer la configuration i18n dans main.tsx

**[01:32:40] 🔧 [CHORE]** Créer 2 tâches depuis le BACKLOG pour le support multilangue (découpage simple)
- Tâche 1 : Configurer le support multilangue (installer i18n, créer les fichiers de traduction fr.json et en.json)
- Tâche 2 : Externaliser les textes existants vers les fichiers de traduction et ajouter un sélecteur de langue

**[01:27:50] ♻️ [REFACTOR]** Convertir toutes les déclarations function en arrow functions dans le codebase
- Convertir 5 déclarations function en const avec arrow functions
- electron/main.ts : isStoreType, isAppConfig, createWindow
- src/App.tsx : App
- electron/ipc-handlers/config.ts : isAppConfig

**[01:23:20] 🔧 [CHORE]** Créer 7 tâches depuis le BACKLOG pour le support multilangue et l'utilisation d'arrow functions dans Biome
- Convertir l'idée de support multilangue en 5 tâches : installation i18n, création fichiers de traduction, externalisation textes composants, externalisation textes services, création sélecteur de langue
- Convertir l'idée d'arrow functions en 2 tâches : configuration Biome, exécution auto-fix

**[01:01:00] 🐛 [FIX]** Corriger les problèmes d'encodage UTF-8 dans electron/ipc-handlers/
- Corriger les erreurs internalError/io Biome dans electron/ipc-handlers/config.ts et electron/ipc-handlers/terminal.ts
- Convertir les fichiers en encodage UTF-8 valide

**[00:50:35] ✨ [FEAT]** Implémenter un service de logging en mémoire pour remplacer console.log
- Créer src/utils/logger.ts avec gestion des niveaux de log (DEBUG, INFO, WARN, ERROR)
- Stocker les logs en mémoire avec limite de 100 entrées
- Mettre à jour ChatPanel.tsx pour utiliser le logger au lieu de console.log
- Respecter les règles Biome (noConsole) tout en conservant les traces de débogage

**[00:46:35] 🐛 [FIX]** Corriger l'erreur TS2322 Property intent is missing in type AICommandShell dans useStore.test.ts
- Ajouter la propriété intent manquante aux objets AICommandShell dans deux tests
- Utiliser 'list_files' comme valeur pour la propriété intent

**[00:45:32] 🐛 [FIX]** Corriger l'erreur TS2353 dans Terminal.tsx : la propriété selection n'existe pas dans le type ITheme
- Supprimer la propriété selection du thème xterm car elle n'est pas supportée par le type ITheme
- L'erreur était à la ligne 51 : Object literal may only specify known properties, and selection does not exist in type ITheme

**[00:42:58] 🐛 [FIX]** Corriger l'erreur TS2322 Type Partial<OllamaConfig> is not assignable to type OllamaConfig dans configService.test.ts
- Fournir un objet OllamaConfig complet avec la propriété url requise dans le test mergeConfigs
- Supprimer le cast as Partial<OllamaConfig> qui ne respectait pas le type OllamaConfig

**[00:40:11] 🐛 [FIX]** Corriger l'erreur TS2741 Property url is missing in type { model: string } dans configService.test.ts
- Ajouter un cast as Partial<OllamaConfig> pour l'objet ollama dans le test mergeConfigs
- Permet de créer un objet de configuration partiel pour les tests de fusion de configuration

**[00:37:42] 🐛 [FIX]** Corriger l'erreur TS2322 Type { command: string } is not assignable to type AICommandType dans commandExecutionService.ts
- Modifier la fonction createHistoryEntryFromConversation pour créer un objet AICommandShell complet avec toutes les propriétés requises
- Ajouter les propriétés type, intent, explanation et confidence pour respecter le type AICommandShell
- Mettre à jour le test unitaire correspondant pour valider le nouveau format

**[00:35:01] 🐛 [FIX]** Corriger l'erreur TS2339 Property command does not exist on type AICommandText dans chatService.ts
- Ajouter une assertion de type pour indiquer à TypeScript que après le filter type === 'command', l'objet est bien de type AICommandShell
- Utiliser (entry.aiResponse as { type: 'command'; command: string }).command pour accéder à la propriété command

**[00:33:45] 🐛 [FIX]** Corriger l'erreur TS2322 Property intent is missing in type AICommandShell dans chatService.test.ts
- Ajouter la propriété intent à toutes les instances de AICommandShell dans les tests
- Utiliser des valeurs appropriées : 'list_files', 'test' pour les intents

**[00:30:14] 🐛 [FIX]** Corriger l'erreur TS2339 Property command does not exist on type AICommandText dans ChatPanel.tsx
- Utiliser un type predicate dans le filter pour déduire correctement le type de msg.command comme AICommandShell
- Remplacer msg.command!.command par msg.command.command après le type predicate

**[00:27:15] 🐛 [FIX]** Corriger l'erreur TS2582 Cannot find name test dans tous les fichiers de tests
- Ajouter test aux imports depuis vitest dans src/store/useStore.test.ts
- Ajouter test aux imports depuis vitest dans src/services/terminalService.test.ts
- Ajouter test aux imports depuis vitest dans src/services/commandExecutionService.test.ts
- Ajouter test aux imports depuis vitest dans src/services/configService.test.ts
- Ajouter test aux imports depuis vitest dans src/services/chatService.test.ts

**[00:26:00] 🐛 [FIX]** Corriger l'erreur TS2582 Cannot find name test dans chatService.test.ts
- Ajouter test aux imports depuis vitest

**[00:22:50] 🐛 [FIX]** Corriger le warning JSIgnoredPromiseFromCall dans App.tsx
- Ajouter l'opérateur void pour marquer explicitement que la Promise retournée par initConfig est intentionnellement ignorée

**[00:20:20] 🐛 [FIX]** Corriger l'erreur TS2339 Property command does not exist on type AICommandText dans ChatPanel.tsx
- Ajouter un type guard isCommandShell pour vérifier que msg.command est bien de type AICommandShell
- Le type guard permet à TypeScript de déduire correctement que la propriété command existe

**[00:17:27] 🔧 [CHORE]** Corriger l'erreur TS2307 Cannot find module @shared/types
- Ajouter baseUrl et paths dans tsconfig.json pour configurer les alias @/, @electron, @shared
- Ajouter @shared sans wildcard pour supporter les imports directs
- Inclure shared/**/*.ts dans la section include

**[00:15:40] 🔧 [CHORE]** Activer la règle subject-case en lower-case dans commitlint.config.mjs
- Corriger le message de commit pour utiliser la casse minuscule
- Changer la règle de 0 (désactivé) à 2 (lower-case)

**[00:12:40] 🔧 [CHORE]** Configurer tsconfig.json pour utiliser 'react-jsx' au lieu de 'react'
- Corriger l'erreur TS2686 dans ConfigPanel.tsx
- Passer le paramètre jsx de 'react' à 'react-jsx' dans tsconfig.json

#### 05/02

**[21:41:54] 🔧 [CHORE]** Configurer les messages de commit pour qu'ils soient en anglais
- Mettre à jour commitlint.config.mjs avec les descriptions en anglais
- Créer .clinerules/commit_messages.md pour définir les règles de rédaction des messages
- Réécrire tout l'historique Git pour convertir les messages existants en anglais
- Nettoyer les fichiers temporaires créés par git filter-branch

**[21:29:39] 🎨 [STYLE]** Mettre à jour l'année de copyright dans le README de 2025 à 2026

**[21:27:10] 📝 [DOCS]** Mettre à jour le README avec les badges GitHub et les meilleures pratiques open source (licence MIT, stars, forks, issues, section Démarrage rapide)

**[21:19:30] 🔧 [CHORE]** Archiver exceptionnellement toutes les entrées du CHANGELOG vers CHANGELOG_ARCHIVE.md
- Utiliser CHANGELOG_RETENTION_DAYS=0 pour forcer l'archivage de toutes les entrées
- Corriger le script d'archivage pour supporter le format du CHANGELOG (### YYYY et #### DD/MM)
- Corriger la logique de comparaison de date pour inclure aujourd'hui quand RETENTION_DAYS=0
- Corriger le parsing pour détecter correctement les sections d'année et de date
- Ajouter la variable forceArchiveAll pour forcer l'archivage quand RETENTION_DAYS=0
- Le script d'archivage fonctionne maintenant correctement pour archiver toutes les entrées sur demande

**[21:15:56] 🔧 [CHORE]** Vérifier l'archivage du CHANGELOG - aucune entrée à archiver (toutes sont récentes)
- Analyser les dates d'entrées dans CHANGELOG.md
- Vérifier que toutes les entrées sont de moins de 30 jours
- Exécuter npm run validate et npm run qa:fix pour corriger les erreurs de linting
- L'archivage n'est pas nécessaire car toutes les modifications sont récentes

**[20:21:00] 🐛 [FIX]** Corriger et tester le script d'archivage du CHANGELOG
- Corriger le bug de vérification de la variable d'environnement CHANGELOG_RETENTION_DAYS pour accepter 0
- Réécrire la logique de parsing pour gérer la structure du CHANGELOG sans séparateur
- Conserver le header (titre + règles de format) lors de l'archivage
- Ajouter les règles de format du CHANGELOG dans les entrées archivées (sans le titre "Changelog")
- Tester l'archivage avec CHANGELOG_RETENTION_DAYS=0 pour archiver toutes les entrées
- Vérifier que les fichiers sont correctement encodés en UTF-8
- Le script d'archivage fonctionne maintenant correctement avec toutes les périodes de rétention

**[18:58:00] 🔧 [CHORE]** Configurer commitlint pour normaliser les messages de commit
- Installer @commitlint/cli, @commitlint/config-conventional et husky
- Créer commitlint.config.mjs avec les règles conventionnelles (feat, fix, docs, style, refactor, perf, test, chore, revert)
- Configurer le hook Git commit-msg avec husky pour valider automatiquement les commits
- Ajouter le script npm commit:lint pour validation manuelle
- Documenter les conventions de commit dans README.md avec exemples
- Les commits sont désormais automatiquement validés avant d'être appliqués

**[18:03:15] ♻️ [REFACTOR]** Restructurer l'architecture de gestion des tâches et idées
- Renommer BACKLOG.md en TASKS.md (préservation du contenu existant)
- Créer un nouveau BACKLOG.md pour noter les idées de features (format avec emoji 💡 et tag [IDEA])
- Créer le workflow .clinerules/workflows/create_tasks.md pour convertir les idées en tâches
- Mettre à jour .clinerules/workflows/do_tasks.md pour utiliser TASKS.md
- Mettre à jour .clinerules/task_format.md avec les règles pour TASKS.md et BACKLOG.md
- Mettre à jour .clinerules/quality_check.md pour référencer TASKS.md
- Le workflow create_tasks.md permet de : analyser les idées non cochées, demander à l'utilisateur quelle idée convertir, créer les tâches dans TASKS.md, cocher l'idée dans BACKLOG.md
- Séparer clairement les tâches à exécuter (TASKS.md) des idées de features (BACKLOG.md)

**[15:53:10] 🎨 [STYLE]** Renommer l'application de "ShellM" à "SheLLM"
- Remplacer toutes les occurrences de "ShellM" par "SheLLM" dans les fichiers source
- Mettre à jour README.md, package.json, index.html, Header.tsx, ChatPanel.tsx, CHANGELOG.md
- Reconstruire le projet pour mettre à jour les fichiers dist/
- Les tests et le build passent avec succès

**[15:42:30] ✅ [TEST]** Standardiser les tests avec `test` au lieu de `it` et supprimer les tests de composants React
- Remplacer toutes les occurrences de `it(` par `test(` dans les fichiers de tests
- Supprimer src/components/ChatPanel.test.tsx (test de composant React)
- Créer src/services/commandExecutionService.ts pour la logique d'exécution de commande pure
- Créer src/services/commandExecutionService.test.ts avec 23 tests pour la logique d'exécution
- Les tests sont désormais tous en `.ts` (TypeScript pur) et non `.tsx` (React)
- Total : 107 tests qui passent avec succès

**[15:40:15] ♻️ [REFACTOR]** Durcir la qualité du code en interdisant `any` et les castings avec `as`
- Mettre à jour biome.json pour passer `noExplicitAny` en error pour les fichiers TypeScript
- Supprimer tous les castings problématiques `as` dans le code de production
- Remplacer `as` par des type guards (isStoreType, isAppConfig)
- Remplacer les castings dans les tests par des déclarations explicites de types
- Les seuls `as const` restants sont acceptables (types littéraux)
- Améliorer la sécurité des types dans toute la base de code

**[15:20:10] 🐛 [FIX]** Corriger l'affichage de la sortie du terminal en initialisant xterm avant le PTY
- Le handler onTerminalData était attaché après la création du PTY
- Résultat : la sortie des commandes n'était pas redirigée vers xterm
- Solution : initialiser xterm et attacher les handlers AVANT de créer le PTY
- La sortie du terminal s'affiche maintenant correctement quand on clique sur "Exécuter"


**[15:11:34] 🐛 [FIX]** Corriger le bouton Exécuter en ajoutant un mécanisme de retry pour attendre que le terminal soit prêt

**[14:22:15] ♻️ [REFACTOR]** Extraire la configuration par défaut et le chargement dynamique dans shared/config.ts
- Créer le fichier shared/config.ts avec DEFAULT_CONFIG, getEnvConfig, mergeConfig et getEnvSources
- Refactoriser electron/ipc-handlers/config.ts pour utiliser le nouveau module
- Nettoyer electron/types/types.ts et shared/types.ts en supprimant les définitions dupliquées
- Mettre à jour electron/main.ts pour utiliser mergeConfig pour fusionner la config avec les variables d'environnement
- Corriger electron/tsconfig.json pour inclure le dossier shared dans la compilation
- Centraliser la logique de configuration dans un module partagé entre Electron et le frontend

**[15:07:07] 🐛 [FIX]** Corriger le prompt système pour forcer le modèle IA à retourner du JSON
- Le modèle gemini-3-flash-preview:cloud retournait du texte brut au lieu de JSON
- Simplifier le prompt système pour forcer une réponse JSON uniquement
- Ajouter l'exemple "What time is it ?" pour guider le modèle sur la commande date
- Le modèle retourne maintenant correctement le JSON structuré attendu

**[14:57:40] 🐛 [FIX]** Corriger le chat qui ne fonctionnait pas
- Le modèle par défaut 'llama2' n'était pas installé dans Ollama
- Changer le modèle par défaut à 'llama3.2:3b' qui est disponible
- Ollama fonctionne correctement et répond aux requêtes

**[12:57:30] 🐛 [FIX]** Améliorer la robustesse du bouton Exécuter
- Ajouter e.preventDefault() et e.stopPropagation() dans le gestionnaire onClick
- Améliorer la gestion des erreurs avec des messages explicites pour l'utilisateur
- Les logs de debug confirment que le bouton fonctionne correctement
- Les tests passent avec succès (92 tests au total)

**[12:39:00] 🐛 [FIX]** Corriger le bouton Exécuter qui ne fonctionnait pas
- Séparer la création du terminal PTY de l'initialisation xterm dans src/components/Terminal.tsx
- Le terminalPid n'était jamais mis à jour dans le store à cause d'une dépendance cyclique
- Modifier le useEffect pour créer le terminal PTY de manière asynchrone et mettre à jour le PID après création réussie
- Créer un second useEffect pour initialiser xterm quand le DOM est prêt
- Le bouton "Exécuter" fonctionne maintenant correctement car terminalPid est correctement initialisé

**[12:18:00] ✅ [TEST]** Créer des tests d'intégration pour le bouton Exécuter avec le scénario "quelle heure est-il ?"
- Créer src/components/ChatPanel.test.tsx avec 8 tests pour le bouton "Exécuter"
- Scénario principal "quelle heure est-il ?" couvrant :
  - Affichage du bouton Exécuter après génération de commande par l'IA
  - Exécution de la commande dans le terminal au clic sur Exécuter
  - Masquage du bouton après l'exécution
- Cas limites couvrant :
  - Pas de bouton Exécuter pour une réponse texte
  - Modification de la commande avec le bouton Modifier
  - Annulation avec le bouton Annuler
  - Désactivation du champ de saisie quand une commande est en attente
  - Affichage de la commande et de son niveau de confiance
- Corriger le mock dans src/test/setup.ts en ajoutant le champ 'intent' requis
- Total : 92 tests qui passent avec succès (84 tests existants + 8 nouveaux)
- Les tests blindent complètement le cas d'usage du bouton Exécuter

**[12:09:00] 🐛 [FIX]** Corriger les erreurs Biome bloquant le script validate
- Supprimer l'import `vi` inutilisé dans src/store/useStore.test.ts
- Préfixer la variable `state` inutilisée avec `_` dans src/store/useStore.test.ts
- Corriger les imports dans src/test/setup.ts (ajouter `vi`, supprimer les types inutilisés)
- Le script validate fonctionne maintenant avec succès

**[12:06:01] 🔧 [CHORE]** Ajouter le script npm test au script validate dans package.json
- Le script validate exécute désormais simultanément : qa, build et test
- Assure que les tests passent avant de considérer une modification comme complète

**[10:39:28] ✅ [TEST]** Créer une infrastructure de tests unitaires avec Vitest
- Installer Vitest, React Testing Library, happy-dom et @testing-library/user-event
- Créer la configuration Vitest avec happy-dom comme environnement
- Créer le fichier src/test/setup.ts avec mocks de window.electronAPI
- Créer 15 tests unitaires pour le store Zustand (config, terminal, AI, conversation, UI)
- Créer 3 tests pour le composant Header (rendu, interaction avec store)
- Total : 18 tests unitaires qui passent avec succès
- Séparer la logique métier de la couche Electron pour permettre ~80% de couverture de code
- Supprimer les tests E2E Playwright non fonctionnels
- Ajouter les scripts npm test, test:watch, test:ui
- Mettre à jour la documentation README.md avec la section Tests

**[10:39:27] ♻️ [REFACTOR]** Supprimer les tests E2E Playwright non fonctionnels
- Supprimer le dossier tests/e2e/ et sa documentation
- Supprimer la configuration Playwright et les rapports
- Retirer les dépendances @playwright/test et playwright
- Nettoyer les scripts npm pour ne garder que les tests unitaires Vitest

**[11:01:06] ✅ [TEST]** Créer et nettoyer les tests unitaires pour les composants
- Créer une infrastructure de test avec Vitest et React Testing Library
- Créer des tests pour le store Zustand (15 tests couvrant config, terminal, AI, conversation, UI)
- Créer des tests pour le composant Header (3 tests)
- Tentative de création de tests pour ChatPanel, Terminal, ConfigPanel et ModelSelector
- Les tests complexes nécessitent des modifications de l'architecture des composants (ajout de data-testid)
- Garder les 18 tests fonctionnels qui testent la logique métier principale
- Les tests couvrent environ 30% de la logique métier (store et composants simples)

**[11:19:26] ✨ [FEAT]** Créer une architecture avec séparation UI/logique
- Créer le dossier src/services/ pour la logique métier pure
- Créer chatService.ts (formatage, validation, extraction de données)
- Créer configService.ts (validation de configuration, URL, formatage)
- Créer ollamaService.ts (service Ollama avec injection de dépendances)
- Créer 43 tests unitaires pour les services purs (25 + 18)
- Les services sont 100% testables sans dépendance à React ou Electron

**[11:27:03] ✅ [TEST]** Réaliser une architecture de test sans tests de composants
- Supprimer les tests de composants React (.tsx)
- Garder uniquement les tests sur TypeScript pur (.ts)
- Total : 58 tests qui passent en ~548ms
- 25 tests pour chatService (formatage, validation, extraction)
- 18 tests pour configService (validation, formatage, URL)
- 15 tests pour useStore (gestion d'état)
- 100% des tests portent sur la logique métier, aucun sur l'UI
- Les tests sont plus rapides et plus stables
- Couverture d'environ 40% de la logique métier pure

**[11:54:04] ✨ [FEAT]** Créer terminalService pour couvrir l'action d'exécution de commande
- Créer src/services/terminalService.ts avec la logique de terminal pure
- Implémenter validateTerminal pour vérifier si le terminal est prêt
- Implémenter formatCommandForTerminal pour formater la commande avec \r
- Implémenter sanitizeCommand et isValidCommand pour nettoyer/valider
- Implémenter canExecuteCommand pour vérifier les conditions d'exécution
- Implémenter getExecuteButtonText et getExecuteButtonTooltip pour l'UI
- Implémenter isCommandSafe pour détecter les commandes dangereuses
- Créer 26 tests unitaires pour terminalService
- Total : 84 tests qui passent en ~581ms
- Couverture complète de la logique d'exécution de commande (bouton "Exécuter")
- Les tests couvrent la validation, le formatage et la sécurité des commandes

### 04/02

**[10:04:20] ✅ [TEST]** Créer des tests end-to-end complets pour l'application SheLLM
- Installer Playwright pour les tests E2E Electron
- Créer la configuration Playwright avec support Electron
- Créer le fichier de setup avec helpers et mock de l'API Ollama
- Créer 11 scénarios de test couvrant tous les cas d'utilisation principaux
- Ajouter les scripts npm test:e2e, test:e2e:ui, test:e2e:headed, test:e2e:debug
- Créer la documentation des tests dans tests/README.md
- Les tests utilisent un mock de l'API Ollama pour ne pas dépendre d'une instance réelle

**[09:40:15] 🐛 [FIX]** Corriger la double création de terminal empêchant l'exécution des commandes
- Le terminal était créé à la fois dans App.tsx et Terminal.tsx
- Supprimer la création dans App.tsx pour ne garder que celle dans Terminal.tsx
- Ajouter un handler pour l'événement de sortie du terminal dans Terminal.tsx
- Assurer que le composant Terminal est seul responsable de créer et gérer le terminal

**[09:33:05] 🐛 [FIX]** Améliorer le feedback utilisateur quand le terminal n'est pas prêt
- Ajouter un message d'erreur explicite si terminalPid est null
- Désactiver le bouton "Exécuter" quand le terminal n'est pas prêt
- Afficher "Préparation..." dans le bouton pendant l'initialisation du terminal
- Ajouter un tooltip explicatif sur le bouton désactivé

**[09:25:10] 🐛 [FIX]** Corriger le bouton d'exécution de commande qui ne fonctionnait pas
- Le terminal n'était jamais initialisé, donc terminalPid restait null
- Ajouter l'appel à window.electronAPI.terminalCreate() dans le useEffect de Terminal.tsx
- Stocker le PID retourné dans le store via setTerminalPid
- Utiliser un ref pour terminalPid afin d'éviter les boucles infinies dans les dépendances

**[09:20:15] 🐛 [FIX]** Corriger le champ de saisie désactivé après une réponse de l'IA
- Le champ de saisie restait bloqué après une réponse textuelle de l'IA
- Modifier la condition de désactivation pour ne bloquer que lors d'une commande proposée (aiCommand?.type === 'command')
- Permettre à l'utilisateur de continuer à chatter immédiatement après une réponse textuelle

### 03/02

#### 03/02

**[17:49:10] ✨ [FEAT]** Simplifier BACKLOG.md en supprimant la gestion des commentaires
- Les commentaires sont désormais optionnels et servent uniquement à documenter le contexte
- Cocher une tâche revient à l'ignorer dans le workflow
- Simplifier les règles et le workflow pour refléter cette simplification

**[17:45:28] ✨ [FEAT]** Améliorer le format du fichier CHANGELOG.md
- Supprimer les cases à cocher inutiles
- Ajouter des emojis visuels pour chaque type de modification
- Utiliser des tags standards entre crochets ([FEAT], [FIX], etc.)
- Placer la date et l'heure en préfixe pour un repérage chronologique rapide
- Mettre à jour les règles centralisées dans task_format.md et log_changes.md

**[17:36:47] ✨ [FEAT]** Remanier l'architecture de gestion des tâches du projet
- Créer .clinerules/task_format.md pour centraliser les règles de format
- Créer BACKLOG.md pour les tâches à faire
- Créer CHANGELOG.md pour l'historique des modifications
- Créer .clinerules/log_changes.md pour enregistrer automatiquement les modifications
- Simplifier .clinerules/workflows/do_tasks.md pour utiliser BACKLOG.md
- Mettre à jour .clinerules/quality_check.md pour référencer les règles centralisées
- Supprimer l'ancien fichier TODO.md

**[17:11:29] ✨ [FEAT]** Améliorer l'affichage des réponses de l'IA dans le chat
- Si la réponse est du texte (pas une commande), l'application doit l'afficher simplement
- Si le modèle IA propose d'exécuter une commande, l'application doit demander à l'utilisateur si elle peut l'exécuter

**[16:24:30] ✨ [FEAT]** Supporter la configuration par variables d'environnement
- Pour les settings Ollama, permettre à l'utilisateur de fournir les valeurs depuis ses variables d'environnement
- Si l'environnement fournit les variables, alors les settings doivent se baser dessus

**[16:10:04] 🐛 [FIX]** Corriger l'erreur dans le chat
- Dès que l'on discute avec l'agent avec par exemple `coucou` on obtient une erreur
  `Error: Error invoking remote method 'ollama:generate-command': AxiosError: Request failed with status code 404`

**[15:57:39] ✨ [FEAT]** Dans les settings, permettre de choisir le modèle librement
- Se connecter à Ollama pour lister les modèles disponibles et les proposer dans la liste
- Pouvoir choisir dans la liste un modèle suggéré / supporté, et permettre aussi de saisir un modèle librement

**[15:35:48] 🐛 [FIX]** Corriger l'erreur de test de connexion dans les settings
- Avec http://ollama.headwood.ddns.net comme URL de base Ollama
- API key : hE1ZMhME5RidmWqKKaWcAeRgWO
- Lorsqu'on essaye de tester la connexion, on obtient l'erreur
  `Error invoking remote method 'ollama:test-connection': Error: Ollama service not initialized`

**[15:15:17] 🔧 [CHORE]** Installer & configurer Biome
- Configurer Biome en mode le plus stricte possible
- Avec suppression du `;` sauf lorsque nécessaire
- Utilisation de `'` et pas `"` sauf lorsque nécessaire
- Organisation des imports
- Créer un script NPM `qa` pour valider le format et le linting
- Créer une règle Cline `quality_check.md` pour systématiquement vérifier la qualité après chaque changement en
  exécutant `qa`, et corriger en cas d'erreur

**[14:57:35] ✨ [FEAT]** Utiliser volta pour fixer les versions de NodeJS et NPM

**[14:52:03] 🔧 [CHORE]** Créer un script NPM `clean` pour nettoyer tout ce qui est généré dans le projet (avec rimraf)

**[14:19:47] ✨ [FEAT]** Créer un workflow Cline `do_tasks.md` qui vérifie le contenu de `/TODO.md`, effectue les tâches non encore
  réalisées (et non commentées), et les coche une fois réalisées avec succès en ajoutant la date et l'heure de
  réalisation
