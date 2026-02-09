# Backlog d'idées de features

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé :
- `- [ ]` → idée de feature à convertir en tâche
- `- [x]` → idée déjà convertie (à ignorer)
- Format : `- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Description de l'idée`

## Idées de features

<!-- Ajoutez vos idées de features ici -->

- [ ] **[09/02/2026 07:54:00] 💡 [IDEA]** Faire évoluer les workflows Cline pour :
    - create_tasks.md : Supprimer l'idée de BACKLOG.md lorsque les tâches associées ont été créées dans TASKS.md
    - do_tasks.md : Supprimer une tâche de TASKS.md lorsqu'elle a été réalisée et ajoutée à CHANGELOG.md
    - trouver un moyen de conserver une référence à l'idée avec sa date dans TASKS.md et CHANGELOG.md, lorsqu'elle a disparu de BACKLOG.md
    - changer le mode de fonctionnement de la changelog pour avoir :
        - un historique complet dans HISTORY.md
        - une changelog CHANGELOG.md qui ne contient que les features et une synthèse des changements (dont la vocation est d'être lu par des utilisateurs)
- [ ] **[06/02/2026 03:40:00] 💡 [IDEA]** Dans les workflows Cline, lorsqu'une tâche est réalisée et que la changelog a été alimentée, il faut supprimer la tâche de la liste
- [x] **[06/02/2026 03:20:00] 💡 [IDEA]** Interpréter les résultats d'exécution de commande pour répondre dans le chat
- [x] **[06/02/2026 01:17:00] 💡 [IDEA]** Ajouter le support multilangue (uniquement français, anglais pour l'instant), et externaliser les textes des sources
- [x] **[06/02/2026 00:43:00] 💡 [IDEA]** Forcer l'utilisation de arrow functions plutôt que `function` dans Biome
- [x] **[05/02/2026 19:03:35] 💡 [IDEA]** Créer un système d'archive pour CHANGELOG.md afin d'éviter l'inflation : un fichier CHANGELOG_ARCHIVE.md contenant l'historique complet, CHANGELOG.md gardant uniquement les modifications récentes/en cours, et un workflow Cline pour gérer l'archivage automatique
