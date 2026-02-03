# Task Format Rules

## Objectif

Définit les règles de format communes pour tous les fichiers de tâches du projet (BACKLOG.md, CHANGELOG.md, etc.).

## Règles de format générales

### Cases à cocher

- **Tâche à faire** : `- [ ] Description de la tâche`
- **Tâche cochée** : `- [x] Description de la tâche`
- **Tâche ignorée** : Utiliser une case cochée pour mettre en pause ou exclure temporairement

### Commentaires (optionnel)

- Les commentaires peuvent être utilisés pour documenter ou expliquer le contexte
- Utilisez le format HTML des commentaires Markdown :
  ```markdown
  [//]: # Ceci est un commentaire explicatif
  ```
- Pattern regex pour détection : `^\[\/\/\]: # (.*)$`
- Les lignes correspondant à ce pattern doivent être ignorées lors des traitements

### Tags de catégorisation et Emojis

Chaque tâche doit utiliser le format avec emojis et tags entre crochets :
- **✨ [FEAT]** : Nouvelle fonctionnalité ou évolution
- **🐛 [BUG]** : Correction de bug ou de problème
- **♻️ [REFACTOR]** : Refactorisation
- **⚡ [PERF]** : Performance
- **📝 [DOCS]** : Documentation
- **🎨 [STYLE]** : Style/Cosmétique
- **✅ [TEST]** : Tests
- **🔧 [CHORE]** : Configuration/Maintenance

### Dates et heures

- **Format** : `DD/MM/YYYY HH:mm:ss`
- **Exemple** : `03/02/2026 17:30:15`
- Utilisé dans CHANGELOG.md pour les entrées de modifications

### Description des tâches

- Commencer par un verbe à l'infinitif ou l'impératif (ex: "Ajouter", "Corriger", "Implémenter")
- Être concis mais informatif
- Mentionner les fichiers modifiés si pertinent

### Hiérarchie et sous-tâches

Les sous-tâches peuvent être indentées avec 4 espaces :

```markdown
- [ ] **[DD/MM/YYYY HH:mm:ss] ✨ [FEAT]** Tâche principale
    - [ ] Sous-tâche 1
    - [ ] Sous-tâche 2
```

Les sous-tâches n'ont pas besoin d'emoji ni de tag : l'information de catégorie est portée par la tâche parente.


## Règles spécifiques par fichier

### TASKS.md

- Contient les tâches **à exécuter** (`- [ ]`)
- Les tâches cochées (`- [x]`) sont considérées comme ignorées/pausées
- Format : `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`
- Les emojis et tags sont les mêmes que pour CHANGELOG.md :
  - `✨ [FEAT]` : Nouvelle fonctionnalité ou évolution
  - `🐛 [BUG]` : Correction de bug ou de problème
  - `♻️ [REFACTOR]` : Refactorisation
  - `⚡ [PERF]` : Performance
  - `📝 [DOCS]` : Documentation
  - `🎨 [STYLE]` : Style/Cosmétique
  - `✅ [TEST]` : Tests
  - `🔧 [CHORE]` : Configuration/Maintenance
- La date et l'heure indiquent le moment de création de la tâche
- Les commentaires sont optionnels et servent uniquement à documenter le contexte

### BACKLOG.md

- Contient les **idées de features** à convertir en tâches (`- [ ]`)
- Les idées cochées (`- [x]`) sont considérées comme déjà converties (à ignorer)
- Format : `- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Description de l'idée`
- Utilise uniquement l'emoji `💡` et le tag `[IDEA]`
- La date et l'heure indiquent le moment de création de l'idée dans le backlog
- Les commentaires sont optionnels et servent uniquement à documenter le contexte
- Ce fichier n'est pas utilisé par le workflow `do_tasks.md`

### CHANGELOG.md

- Contient uniquement des entrées de modifications réalisées
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


## Utilisation

Cette règle est importée/utilisée par :
- `.clinerules/workflows/do_tasks.md` (pour lire TASKS.md)
- `.clinerules/workflows/create_tasks.md` (pour lire BACKLOG.md et créer des tâches dans TASKS.md)
- `.clinerules/log_changes.md` (pour écrire dans CHANGELOG.md)
- `.clinerules/quality_check.md` (pour valider les formats)

Toute modification des règles de format doit être faite **ici uniquement**.
