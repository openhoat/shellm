# Quality Check

## Objectif

Cette règle assure que chaque modification du code respecte les standards de qualité définis par Biome.

## Règles de format des tâches

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé pour TASKS.md :
- `- [ ]` → tâche à faire (à exécuter)
- `- [x]` → tâche cochée (à ignorer)

## Quand exécuter ce contrôle

Après chaque modification de code (création, édition, suppression de fichiers), exécutez systématiquement le contrôle qualité avant de passer à la tâche suivante.

## Processus de vérification

### 1. Exécuter le script `validate`

```bash
npm run validate
```

### 2. Analyser le résultat

- **Si le contrôle réussi** (pas d'erreur) : Continuez avec la tâche suivante
- **Si le contrôle échoue** (erreurs détectées) : Procédez à l'étape 3

### 3. Corriger les erreurs

Exécutez le script `qa:fix` pour corriger automatiquement les erreurs :

```bash
npm run qa:fix
```

### 4. Revérifier

Réexécutez `npm run validate` pour confirmer que toutes les erreurs sont corrigées.

## Exceptions

Si le script `qa:fix` ne parvient pas à corriger toutes les erreurs automatiquement :

1. Identifiez les erreurs restantes
2. Corrigez-les manuellement
3. Réexécutez `npm run validate` pour confirmer la correction

## Règles importantes

- **Ne jamais passer à une tâche suivante** sans avoir exécuté `npm run validate` avec succès
- **Ne jamais cocher une tâche** dans TASKS.md sans avoir passé le contrôle qualité
- En cas d'échec du contrôle qualité, **ne pas modifier TASKS.md**
