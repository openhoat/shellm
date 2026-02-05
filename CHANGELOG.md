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

#### 05/02

**[21:29:39] 🎨 [STYLE]** Mettre à jour l'année de copyright dans le README de 2025 à 2026
**[21:27:10] 📝 [DOCS]** Mettre à jour le README avec les badges GitHub et les meilleures pratiques open source (licence MIT, stars, forks, issues, section Démarrage rapide)
**[21:19:30] 🔧 [CHORE]** Archiver exceptionnellement toutes les entrées du CHANGELOG vers CHANGELOG_ARCHIVE.md
- Utiliser CHANGELOG_RETENTION_DAYS=0 pour forcer l'archivage de toutes les entrées
- Corriger le script d'archivage pour supporter le format du CHANGELOG (### YYYY et #### DD/MM)
- Corriger la logique de comparaison de date pour inclure aujourd'hui quand RETENTION_DAYS=0
- Corriger le parsing pour détecter correctement les sections d'année et de date
- Ajouter la variable forceArchiveAll pour forcer l'archivage quand RETENTION_DAYS=0
- Le script d'archivage fonctionne maintenant correctement pour archiver toutes les entrées sur demande
