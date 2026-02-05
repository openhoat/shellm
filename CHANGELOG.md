
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
