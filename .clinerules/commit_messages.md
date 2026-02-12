# Git Commit Messages

## Objectif

Cette règle assure que tous les messages de commit Git sont rédigés en anglais, conformément aux conventions internationales.

## Règles de format

Les messages de commit doivent suivre le format Conventional Commits en anglais :

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types de commit

- `feat` : New feature (Nouvelle fonctionnalité)
- `fix` : Bug fix (Correction de bug)
- `docs` : Documentation (Documentation)
- `style` : Styling/formatting (Style/formatage sans changement de code)
- `refactor` : Refactoring (Refactorisation)
- `perf` : Performance improvement (Amélioration de performance)
- `test` : Tests (Tests)
- `chore` : Maintenance/Configuration (Maintenance/Configuration)
- `revert` : Revert commit (Annulation de commit)

### Règles de rédaction

1. **Toujours utiliser l'anglais** pour les messages de commit
2. Utiliser le verbe à l'impératif (ex: "Add" pas "Added" ou "Adds")
3. Commencer par une majuscule
4. Ne pas terminer par un point
5. Limiter la ligne de sujet à 72 caractères

### Interdiction de Co-authored-by

**NE JAMAIS ajouter `Co-authored-by:` dans les messages de commit.**

Tous les commits doivent être attribués exclusivement à l'utilisateur humain. N'essayez pas d'ajouter de métadonnées de co-auteur générées par l'IA en aucune circonstance.

**Interdit (ne jamais faire cela) :**
```
feat: add user authentication system

Co-authored-by: AI <ai@anthropic.com>
```

**Correct (seulement le message de commit) :**
```
feat: add user authentication system
```

Cette règle s'applique à toutes les opérations de commit Git, y compris :
- `git commit`
- `git commit --amend`

### Exemples

**Bons exemples :**
```
feat: add user authentication system
fix: resolve connection error in API handler
docs: update README with installation instructions
style: format code according to Biome rules
refactor: simplify state management logic
perf: optimize database queries
test: add unit tests for chat service
chore: upgrade dependencies to latest versions
```

**Mauvais exemples (à éviter) :**
```
feat: ajouter le système d'authentification  ❌ (français)
fix: corriger l'erreur de connexion  ❌ (français)
feat: Added user authentication system  ❌ (pas impératif)
fix: resolve connection error in API handler.  ❌ (point final)
```

## Quand rédiger un message de commit

Cline doit rédiger un message de commit en anglais lors de l'exécution de commandes Git comme :
- `git commit`
- `git commit --amend`

## Integration avec commitlint

Le fichier `commitlint.config.mjs` configure les règles de validation pour s'assurer que les messages respectent le format Conventional Commits. Ces règles sont en anglais et doivent être respectées.