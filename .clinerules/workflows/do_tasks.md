# Workflow Cline pour exécuter les tâches

## Objectif

Ce workflow automatise la lecture et l'exécution des tâches listées dans le fichier `/TASKS.md`.

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé pour TASKS.md :
- `- [ ]` → tâche à faire (à exécuter)
- `- [x]` → tâche cochée (à ignorer)

## Instructions d'exécution

1. **Lire le fichier TASKS.md**
    - Utilisez l'outil `read_file` pour lire le contenu du fichier `/TASKS.md` à la racine du projet

2. **Analyser et filtrer les tâches**
    - Identifiez toutes les lignes correspondant à des **tâches à faire**
    - **Ignorez** les lignes correspondant à des **tâches déjà cochées**

3. **Exécuter chaque tâche identifiée**
    - Pour chaque tâche trouvée, déterminez les actions nécessaires
    - Utilisez les outils Cline appropriés (execute_command, write_to_file, replace_in_file, etc.)
    - Procédez de manière séquentielle, une tâche à la fois

4. **Cocher la tâche dans TASKS.md après chaque succès**
    - Lorsqu'une tâche est complétée avec succès, utilisez `replace_in_file`
    - Changer la ligne pour en faire une **ligne cochée**
    - Le SEARCH block doit correspondre exactement à la ligne contenant la tâche
    - **Important** : NE PAS ajouter la date et l'heure dans TASKS.md

5. **Rapport d'exécution**
    - Informez l'utilisateur de l'avancement après chaque tâche
    - Signalez clairement les succès et les échecs
    - En cas d'échec, expliquez la raison sans modifier TASKS.md

## Règles importantes

- Ne modifiez **jamais** les lignes déjà cochées
- Ne modifiez TASKS.md qu'après avoir confirmé le succès d'une tâche
- Si une tâche échoue, passez à la suivante mais ne la cochez pas
- **Important** : La règle `log_changes.md` s'occupera d'enregistrer la modification dans CHANGELOG.md

## Exemple de flux

```
1. Lire TASKS.md → trouver 3 tâches à faire
2. Exécuter tâche 1 → succès → cocher dans TASKS.md
3. La règle log_changes.md enregistre automatiquement dans CHANGELOG.md
4. Exécuter tâche 2 → succès → cocher dans TASKS.md
5. La règle log_changes.md enregistre automatiquement dans CHANGELOG.md
6. Exécuter tâche 3 → échec → informer l'utilisateur, ne pas cocher
7. Rapport final : 2/3 tâches complétées
