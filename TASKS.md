# Tâches à faire

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé :

- `- [ ]` → tâche à faire (à exécuter)
- `- [x]` → tâche cochée (à ignorer pour le workflow)
- Format : `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`

## Tâches à faire

- [x] **[06/02/2026 01:23:10] ✨ [FEAT]** Créer un composant LanguageSelector dans l'interface pour permettre le changement de langue
- [x] **[06/02/2026 01:23:09] ♻️ [REFACTOR]** Externaliser tous les textes hardcoded des fichiers TypeScript (services, utils, etc.) vers les fichiers de traduction
- [x] **[06/02/2026 01:23:08] ♻️ [REFACTOR]** Externaliser tous les textes hardcoded des composants React vers les fichiers de traduction
- [x] **[06/02/2026 01:23:07] ✨ [FEAT]** Créer les fichiers de traduction français et anglais dans un dossier `src/locales/`
- [x] **[06/02/2026 01:23:06] 🔧 [CHORE]** Installer et configurer une bibliothèque i18n (par exemple i18next ou react-i18next)
- [x] **[06/02/2026 01:23:05] ♻️ [REFACTOR]** Exécuter Biome pour corriger automatiquement toutes les déclarations `function` en arrow functions
- [x] **[06/02/2026 01:23:04] 🔧 [CHORE]** Configurer Biome pour forcer l'utilisation de arrow functions et interdire les déclarations `function`
- [x] **[05/02/2026 19:11:53] 🔧 [CHORE]** Modifier le workflow create_tasks.md pour classer systématiquement les tâches dans TASKS.md de la plus récente à la plus ancienne.
- [x] **[05/02/2026 19:09:00] 📝 [DOCS]** Documenter le système d'archivage dans README.md avec les instructions d'utilisation et ajouter des commentaires explicatifs dans le workflow
- [x] **[05/02/2026 19:08:55] ✨ [FEAT]** Configurer les règles d'archivage avec une période de rétention configurable et ajouter une commande npm pour l'archivage manuel
- [x] **[05/02/2026 19:08:50] ✨ [FEAT]** Développer le workflow d'archivage automatique dans .clinerules/workflows/archive_changelog.md pour déplacer les entrées anciennes vers l'archive
- [x] **[05/02/2026 19:08:45] 🔧 [CHORE]** Créer le fichier CHANGELOG_ARCHIVE.md avec la même structure que CHANGELOG.md et définir une politique de rétention (ex: 30 jours dans CHANGELOG.md actif)
