
# Historique

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
