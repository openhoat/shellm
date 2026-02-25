# Workflow CLine pour utiliser les Worktrees Git Natifs

## Objectif

Ce workflow définit comment utiliser les worktrees git natifs pour travailler sur plusieurs branches simultanément avec Claude Code.

## Quand Utiliser les Worktrees

Utilisez les worktrees quand :
- L'utilisateur demande une nouvelle fonctionnalité ou correction qui nécessite une Pull Request
- Vous avez besoin de basculer entre plusieurs branches sans perdre les modifications locales
- Vous travaillez sur des changements isolés qui doivent être examinés séparément

## Structure des Répertoires de Worktree

```
/home/openhoat/work/
├── termaid/              # Worktree principal (branche main)
├── termaid-<feature>/    # Worktrees de fonctionnalité
```

## Convention de Nommage des Worktrees

- Format : `termaid-<nom-branche>`
- Les noms de branches doivent être en kebab-case
- Exemples :
  - `feat/dependabot-config` → `termaid-dependabot`
  - `feat/add-dark-mode` → `termaid-add-dark-mode`
  - `fix/login-bug` → `termaid-login-bug`

## Étapes du Workflow

### 1. Démarrer une Nouvelle Tâche

Quand l'utilisateur demande une nouvelle fonctionnalité ou correction :

1. Déterminer le nom de la branche (kebab-case à partir de la description)
2. Créer une nouvelle branche depuis main
3. Créer un worktree pour cette branche
4. Basculer vers le nouveau worktree

```bash
# Exemple : Démarrer une nouvelle fonctionnalité
git branch feat/ma-nouvelle-fonctionnalite main
git worktree add ../termaid-ma-nouvelle-fonctionnalite feat/ma-nouvelle-fonctionnalite
cd ../termaid-ma-nouvelle-fonctionnalite
```

### 2. Travailler dans le Worktree

```bash
cd ../termaid-<feature>
# Faire les modifications, commiter, tester
```

### 3. Créer une Pull Request

Quand les modifications sont prêtes :

```bash
cd ../termaid-<feature>
git push -u origin feat/ma-nouvelle-fonctionnalite
gh pr create --title "feat: description" --body "..."
```

### 4. Nettoyage Après Fusion

Après que la PR est fusionnée :

```bash
git worktree remove ../termaid-<feature>
git branch -d feat/ma-nouvelle-fonctionnalite
```

## Commandes de Gestion des Worktrees

```bash
# Lister tous les worktrees
git worktree list

# Créer un nouveau worktree
git worktree add ../termaid-<nom> <nom-branche>

# Supprimer un worktree (conserve la branche)
git worktree remove ../termaid-<nom>

# Nettoyer les références de worktree obsolètes
git worktree prune
```

## Intégration avec les Autres Règles

- Suivre **Language Rule** : Tous les commits et PRs en anglais
- Suivre **Commit Messages Rule** : Format Conventional Commits
- Suivre **Quality Check Rule** : Exécuter la validation avant de commiter
- Suivre **Log Changes Rule** : Mettre à jour CHANGELOG.md après les modifications

## Principes Clés

1. **Un worktree par feature/PR** : Chaque worktree correspond à une branche et une PR
2. **Le worktree principal reste propre** : Utiliser uniquement le worktree main pour examiner le code, pas pour faire des modifications
3. **Toujours créer une PR** : Ne jamais commiter directement sur main
4. **Nettoyer après fusion** : Supprimer les worktrees après que les PRs sont fusionnées

## Exemple de Workflow

L'utilisateur demande : "Ajouter le support du mode sombre"

1. Créer la branche et le worktree :
   ```bash
   git branch feat/add-dark-mode main
   git worktree add ../termaid-add-dark-mode feat/add-dark-mode
   ```

2. Travailler dans le nouveau worktree :
   ```bash
   cd ../termaid-add-dark-mode
   # Faire les modifications...
   ```

3. Créer la PR quand prêt :
   ```bash
   git push -u origin feat/add-dark-mode
   gh pr create --title "feat: add dark mode support" --body "..."
   ```

4. Après la fusion :
   ```bash
   git worktree remove ../termaid-add-dark-mode
   git branch -d feat/add-dark-mode
   ```

## Commandes Prêtes à Utiliser

### Créer un Nouveau Worktree

```bash
git branch <nom-branche> main
git worktree add ../termaid-<nom-branche> <nom-branche>
```

### Vérifier les Worktrees Existants

```bash
git worktree list
```

### Supprimer un Worktree

```bash
git worktree remove ../termaid-<nom>
git branch -d <nom-branche>
```
