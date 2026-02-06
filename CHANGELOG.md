# Changements

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

### 06/02

**[03:13:50] 🐛 [FIX]** Corriger l'erreur ENOENT lors du chargement des prompts Ollama
- Modifier package.json pour copier le dossier electron/prompts/ vers dist-electron/electron/prompts/
- Ajouter une étape de copie dans le script build:electron
- Les fichiers de prompts sont maintenant inclus dans le build

**[03:11:15] ♻️ [REFACTOR]** Extraire les prompts Ollama dans des fichiers séparés
- Créer electron/prompts/system-prompt.md
- Créer electron/prompts/explain-command-prompt.md
- Modifier electron/ipc-handlers/ollama.ts pour charger les prompts depuis les fichiers
- Améliorer la maintenabilité des prompts

**[03:04:30] 🐛 [FIX]** Corriger l'affichage incohérent des messages de test de connexion dans ConfigPanel (succès/échec affichaient le même message)

## 2026

#### 06/02

**[02:58:19] ♻️ [REFACTOR]** Déplacer le sélecteur de langue du header vers les paramètres
- Supprimer LanguageSelector du composant Header
- Ajouter LanguageSelector dans ConfigPanel (section Interface)
- Améliorer l'accessibilité avec htmlFor et id

**[02:53:43] ♻️ [REFACTOR]** Convertir toutes les propriétés private vers la syntaxe moderne avec #
- Modifier electron/ipc-handlers/ollama.ts (OllamaService)
- Modifier src/utils/logger.ts (Logger)
- Modifier src/services/ollamaService.ts (OllamaService)
- Convertir 9 propriétés et 4 méthodes privées

**[02:49:00] 🔧 [CHORE]** Archiver toutes les entrées du CHANGELOG vers CHANGELOG_ARCHIVE.md
- Utiliser CHANGELOG_RETENTION_DAYS=0 pour forcer l'archivage de toutes les entrées
- Archiver 22 entrées du 06/02 et 3 entrées du 05/02
- Conserver uniquement les headers dans CHANGELOG.md
- Les entrées archivées sont maintenant dans CHANGELOG_ARCHIVE.md
