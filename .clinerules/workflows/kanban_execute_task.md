# Workflow Cline pour exécuter les tâches du Kanban

## Objectif

Ce workflow automatise l'exécution des tâches du fichier `/KANBAN.md` et la création de commits Git. Pour les idées avec plusieurs tâches, un seul commit est créé avec le détail des tâches en description.

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé :
- `- [ ]` → tâche à faire
- `- [x]` → tâche cochée (terminée)
- Format tâche : `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`

## Instructions d'exécution

### 1. Lire le fichier KANBAN.md

Utilisez l'outil `read_file` pour lire le contenu du fichier `/KANBAN.md` à la racine du projet.

### 2. Analyser les sections "In Progress"

Identifiez toutes les sections dans "## 🚧 In Progress" :
- **Sections d'idées** : commencent par `### [DATE] 💡 [IDEA]`
  - Contiennent une ou plusieurs tâches sous-jacentes
- **Tâches isolées** : lignes avec `- [ ] **[...]]` sans section idée

### 3. Exécuter les tâches

Pour chaque section ou tâche identifiée :

#### 3a. Pour une section d'idée avec tâches

1. Exécuter chaque tâche non cochée dans l'ordre
2. Utilisez les outils Cline appropriés (execute_command, write_to_file, replace_in_file, etc.)
3. Après chaque tâche réussie, marquez-la comme cochée (`- [x]`) dans KANBAN.md

4. **Vérifier si toutes les tâches de l'idée sont terminées**
   - Si toutes les tâches sont cochées → Passer à l'étape 4a
   - Si des tâches restent à faire → Continuer avec la prochaine idée/tâche

#### 3b. Pour une tâche isolée

1. Exécuter la tâche
2. Si succès → Passer à l'étape 4b

### 4. Créer le commit Git

#### 4a. Pour une idée terminée (toutes les tâches cochées)

Générez le message de commit au format Conventional Commits :

**Format :**
```
[TAG]: Description de l'idée

- Description de la tâche 1
- Description de la tâche 2
- Description de la tâche 3
```

**Règles :**
- Utilisez le tag du type de modification principal (ex: `[FEAT]` pour les features)
- La description principale est celle de l'idée originale
- Listez toutes les tâches avec leur description
- Commencez chaque ligne par "- " (puce)

**Exemple :**
```
[FEAT]: Ajouter un système de thèmes sombre/clair

- Installer les dépendances nécessaires (npm install theme-provider)
- Créer le composant ThemeSwitcher dans src/components/
- Créer les styles CSS pour le thème sombre
- Ajouter le toggle dans le header de l'application
```

#### 4b. Pour une tâche isolée terminée

Générez le message de commit au format Conventional Commits :

**Format :**
```
[TAG]: Description de la tâche
```

**Exemple :**
```
[FIX]: Corriger le bug de connexion dans le handler d'authentification
```

### 5. Ajouter les fichiers à Git

Exécutez la commande :
```bash
git add <fichiers_modifiés>
```

Ajoutez tous les fichiers modifiés/créés/supprimés pour cette tâche/idée.

### 6. Créer le commit

Exécutez la commande :
```bash
git commit -m "Message du commit"
```

Utilisez toujours des guillemets doubles autour du message de commit pour gérer les retours à la ligne.

### 7. Supprimer la section/tâche de KANBAN.md

Une fois le commit créé avec succès :

- **Pour une idée** : Supprimer toute la section (header + tâches) de "## 🚧 In Progress"
- **Pour une tâche isolée** : Supprimer la ligne de la tâche de "## 🚧 In Progress"

Utilisez `replace_in_file` pour supprimer le bloc complet.

### 8. Répéter pour les autres idées/tâches

Continuez avec les autres sections ou tâches de "## 🚧 In Progress" jusqu'à ce que tout soit traité.

### 9. Régénérer CHANGELOG.md

Après avoir terminé toutes les tâches, exécutez :
```bash
npm run changelog
```

Cela va régénérer le fichier `CHANGELOG.md` depuis l'historique Git.

### 10. Rapport d'exécution

Informez l'utilisateur de l'avancement après chaque étape :
- Tâches exécutées avec succès
- Commits créés avec leur hash et message
- Sections/tâches supprimées de KANBAN.md
- En cas d'erreur, expliquez la raison sans modifier KANBAN.md

## Règles importantes

- **1 idée = 1 commit** : Toutes les tâches d'une idée sont commitées ensemble
- **1 tâche isolée = 1 commit** : Chaque tâche isolée est commitée individuellement
- Ne créez un commit que si **toutes** les tâches d'une idée sont terminées
- Ne supprimez une section/tâche de KANBAN.md qu'après un commit **réussi**
- Si une tâche échoue, marquez-la comme échouée et passez à la suivante (ne pas cocher)
- Incluez toujours `CHANGELOG.md` dans le commit (car il sera régénéré)

## Exemple de flux complet

```
1. Lire KANBAN.md → trouver 2 idées + 1 tâche isolée dans In Progress

2. Idée #1 : "Ajouter un système de thèmes" avec 3 tâches
   - Exécuter tâche 1 (Installer les dépendances) → succès → cocher
   - Exécuter tâche 2 (Créer ThemeSwitcher) → succès → cocher
   - Exécuter tâche 3 (Créer les styles) → succès → cocher
   - Toutes les tâches cochées → créer commit
   - git add ...
   - git commit -m "[FEAT]: Ajouter un système de thèmes sombre/clair

   - Installer les dépendances nécessaires (npm install theme-provider)
   - Créer le composant ThemeSwitcher dans src/components/
   - Créer les styles CSS pour le thème sombre"
   - Supprimer la section de KANBAN.md

3. Tâche isolée : "Corriger le bug de login"
   - Exécuter la tâche → succès → cocher
   - Créer commit
   - git add ...
   - git commit -m "[FIX]: Corriger le bug de connexion dans le formulaire de login"
   - Supprimer la tâche de KANBAN.md

4. Idée #2 : "Améliorer les performances" (tâches restantes)
   - Exécuter tâche 1 → succès → cocher
   - Tâche 2 non terminée → s'arrêter, ne pas créer de commit

5. npm run changelog → régénérer CHANGELOG.md

6. Rapport : 2 commits créés, 1 idée en cours, 1 tâche restante
```

## Exemple de KANBAN.md avant/après

**Avant - In Progress :**
```markdown
## 🚧 In Progress
### [09/02/2026 08:00:00] 💡 [IDEA] Ajouter un système de thèmes sombre/clair
- [ ] **[09/02/2026 08:30:15] 🔧 [CHORE]** Installer les dépendances nécessaires
- [ ] **[09/02/2026 08:30:20] ✨ [FEAT]** Créer le composant ThemeSwitcher
- [ ] **[09/02/2026 08:30:25] 🎨 [STYLE]** Créer les styles pour le thème sombre

- [ ] **[09/02/2026 09:00:00] 🐛 [FIX]** Corriger le bug de login
```

**Après exécution partielle - In Progress :**
```markdown
## 🚧 In Progress
### [09/02/2026 08:00:00] 💡 [IDEA] Ajouter un système de thèmes sombre/clair
- [x] **[09/02/2026 08:30:15] 🔧 [CHORE]** Installer les dépendances nécessaires
- [x] **[09/02/2026 08:30:20] ✨ [FEAT]** Créer le composant ThemeSwitcher
- [x] **[09/02/2026 08:30:25] 🎨 [STYLE]** Créer les styles pour le thème sombre
```

**Après commit - In Progress :**
```markdown
## 🚧 In Progress

(Aucun travail en cours pour le moment)
```

## Gestion des erreurs

Si une tâche échoue :
1. Ne la cochez pas
2. Informez l'utilisateur de l'erreur
3. Passez à la tâche suivante
4. Ne créez pas de commit si l'idée n'est pas complètement terminée

## Note sur CHANGELOG.md

Le fichier `CHANGELOG.md` est généré automatiquement depuis Git par le script `scripts/generate-changelog.js`. Il ne doit pas être modifié manuellement.