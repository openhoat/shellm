# Log Changes

## Objectif

Cette règle assure que chaque modification réalisée par Cline est automatiquement consignée dans le fichier `/CHANGELOG.md`.

## Quand exécuter cette règle

Après **chaque modification réussie** du projet (création, édition ou suppression de fichiers), **avant** d'utiliser `attempt_completion`.

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé pour CHANGELOG.md :
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

## Processus d'enregistrement

### 1. Identifier la modification

Déterminez le type de modification réalisée :
- **Nouvelle fonctionnalité** : Utilisez `✨ [FEAT]`
- **Correction de bug** : Utilisez `🐛 [FIX]`
- **Refactorisation** : Utilisez `♻️ [REFACTOR]`
- **Amélioration de performance** : Utilisez `⚡ [PERF]`
- **Documentation** : Utilisez `📝 [DOCS]`
- **Style** : Utilisez `🎨 [STYLE]`
- **Tests** : Utilisez `✅ [TEST]`
- **Configuration/Maintenance** : Utilisez `🔧 [CHORE]`

### 2. Créer l'entrée CHANGELOG

Ajoutez une nouvelle entrée dans la section appropriée de `/CHANGELOG.md` :

**Format :**
```markdown
**[HH:MM:SS] ✨ [FEAT]** Description concise de la modification
```

Ou :
```markdown
**[HH:MM:SS] 🐛 [FIX]** Description concise du bug corrigé
```

**Règles de rédaction :**
- Commencer par un verbe à l'infinitif ou l'impératif (ex: "Ajouter", "Corriger", "Implémenter")
- Être concis mais informatif
- Mentionner les fichiers modifiés si pertinent
- Remplacer HH:MM:SS par l'heure actuelle

### 3. Placement dans le fichier

Utilisez `replace_in_file` pour ajouter l'entrée :

**Si la date du jour existe déjà :**
- Trouver le header de la date `### DD/MM` correspondant
- Insérer la nouvelle entrée immédiatement après ce header (après les deux sauts de ligne)
- Les entrées doivent être classées antéchronologiquement (plus récent en haut)

**Si la date du jour n'existe pas :**
- Créer le header de date sous le header de l'année `## YYYY`
- Format : `### DD/MM\n\n**[HH:MM:SS] Emoji [TAG]** Description`

**Si l'année n'existe pas :**
- Créer le header d'année en haut du fichier
- Format : `## YYYY\n\n### DD/MM\n\n**[HH:MM:SS] Emoji [TAG]** Description`

### 4. Exemples concrets

#### Exemple 1 : Ajout d'une nouvelle fonctionnalité

Vous venez de créer le composant `UserDashboard.tsx` :

```markdown
## 2026

### 03/02

**[17:30:15] ✨ [FEAT]** Ajouter le composant UserDashboard pour l'interface utilisateur
```

#### Exemple 2 : Correction d'un bug

Vous venez de corriger une erreur de connexion :

```markdown
## 2026

### 03/02

**[17:45:22] 🐛 [FIX]** Corriger l'erreur de connexion API dans ipc-handlers/ollama.ts
```

#### Exemple 3 : Modification de configuration

Vous venez de mettre à jour la configuration Biome :

```markdown
## 2026

### 03/02

**[18:00:10] 🔧 [CHORE]** Configurer Biome avec les règles de linting strictes
```

### 5. Méthode d'implémentation avec replace_in_file

Utilisez `replace_in_file` avec un SEARCH/REPLACE pour ajouter l'entrée :

```markdown
------- SEARCH
## 2026

### 03/02

**[17:30:15] ✨ [FEAT]** Dernière tâche existante...
=======
## 2026

### 03/02

**[17:35:15] ✨ [FEAT]** Nouvelle tâche ajoutée...
**[17:30:15] ✨ [FEAT]** Dernière tâche existante...
+++++++ REPLACE
```

## Règles importantes

- **Toujours enregistrer** les modifications réussies dans CHANGELOG.md
- Utiliser le tag et l'emoji appropriés
- Inclure toujours l'heure au format `HH:MM:SS` (la date complète est dans les sections)
- Ne pas enregistrer les modifications annulées ou échouées
- Ne pas enregistrer les lectures de fichiers ou les analyses simples

## Exceptions

Ne PAS enregistrer dans CHANGELOG.md :
- Les simples lectures de fichiers pour analyse
- Les exécutions de commandes de validation/linting
- Les tests unitaires
- Les modifications temporaires ou expérimentales
- Les changements de formatage automatique (ex: auto-fix de Biome)
- Les modifications triviales (ajustements mineurs de moins de 3 lignes)
- Les mises à jour de commentaires ou de documentation existante