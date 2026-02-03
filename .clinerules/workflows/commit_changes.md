# Workflow Cline pour créer les commits Git depuis CHANGELOG.md

## Objectif

Ce workflow automatise la création des commits Git en utilisant les entrées de `/CHANGELOG.md` comme source de messages de commit.

## Instructions d'exécution

### 1. Analyser l'état Git

Exécutez `git status` pour identifier :
- Les fichiers modifiés (modifié : ...)
- Les nouveaux fichiers (Fichiers non suivis : ...)
- Les fichiers supprimés (supprimé : ...)

### 2. Lire CHANGELOG.md

Utilisez `read_file` pour lire le contenu de `/CHANGELOG.md`.

### 3. Analyser et extraire les entrées de modifications

Identifiez toutes les entrées de modification dans le format :
```
**[HH:MM:SS] Emoji [TAG]** Description
```

Extrayez pour chaque entrée :
- Le tag (ex: [FEAT], [FIX], [REFACTOR], etc.)
- L'emoji
- La description principale
- Les détails (les puces après la description)

### 4. Déterminer les fichiers à inclure pour chaque entrée

Pour chaque entrée du CHANGELOG, analysez les détails pour identifier les fichiers mentionnés :
- Cherchez les noms de fichiers dans les descriptions (ex: "dans src/components/Header.tsx")
- Utilisez les patterns de chemins pour identifier les fichiers concernés
- Associez les fichiers modifiés/non suivis de `git status` aux entrées correspondantes

**Règles d'association :**
- Si une entrée mentionne explicitement des fichiers, utilisez-les
- Si plusieurs entrées partagent des fichiers communs, incluez ces fichiers dans chaque commit pertinent
- Les fichiers de configuration (.clinerules/, CHANGELOG.md, etc.) doivent être inclus dans le commit correspondant à la modification

### 5. Générer le message de commit

Pour chaque entrée, créez un message de commit en format conventionnel :

**Format :**
```
[TAG]: Description principale

Détails de la modification...
```

**Exemples :**
```
[FEAT]: Ajouter le composant UserDashboard pour l'interface utilisateur

Créer src/components/UserDashboard.tsx avec la configuration de base
Ajouter les styles dans src/components/UserDashboard.css
```

```
[REFACTOR]: Restructurer l'architecture de gestion des tâches et idées

Renommer BACKLOG.md en TASKS.md (préservation du contenu existant)
Créer un nouveau BACKLOG.md pour noter les idées de features
Créer le workflow .clinerules/workflows/create_tasks.md
Mettre à jour .clinerules/task_format.md avec les règles pour TASKS.md
```

### 6. Exécuter les commits

Pour chaque entrée identifiée :

#### 6.1. Ajouter les fichiers concernés
```bash
git add fichier1 fichier2 fichier3 ...
```

#### 6.2. Créer le commit avec le message généré
```bash
git commit -m "Message du commit"
```

**Important :** Utilisez toujours des guillemets doubles autour du message de commit pour gérer les retours à la ligne et les caractères spéciaux.

#### 6.3. Vérifier le commit
Exécutez `git log -1` pour confirmer que le commit a été créé correctement.

### 7. Rapport d'exécution

Une fois tous les commits créés :
- Informez l'utilisateur du nombre de commits créés
- Résumez les commits avec leur hash et leur message
- Confirmer qu'il n'y a plus de modifications non commitées (vérifier avec `git status`)

## Règles importantes

- **Toujours inclure CHANGELOG.md** dans chaque commit (car il contient l'entrée correspondante)
- **Un commit par entrée** du CHANGELOG, pas de commits groupés
- **Préserver l'ordre** des entrées (du plus récent au plus ancien)
- **Ne pas modifier** le message généré automatiquement à partir du CHANGELOG
- **Gérer les erreurs** : si un commit échoue, informez l'utilisateur et continuez avec les entrées suivantes

## Exemple de flux complet

```
1. git status → 25 fichiers modifiés, 8 fichiers non suivis
2. Lire CHANGELOG.md → 3 entrées identifiées
3. Entrée 1 : "[18:03:15] ♻️ [REFACTOR]** Restructurer l'architecture..."
   - Fichiers identifiés : TASKS.md, BACKLOG.md, .clinerules/workflows/create_tasks.md, etc.
   - git add TASKS.md BACKLOG.md .clinerules/workflows/create_tasks.md .clinerules/task_format.md ...
   - git commit -m "[REFACTOR]: Restructurer l'architecture de gestion des tâches et idées
   - 
   - Renommer BACKLOG.md en TASKS.md (préservation du contenu existant)
   - Créer un nouveau BACKLOG.md pour noter les idées de features
   - ..."
4. Entrée 2 : "[15:53:10] 🎨 [STYLE]** Renommer l'application de "ShellM" à "SheLLM""
   - Fichiers identifiés : README.md, package.json, index.html, src/components/Header.tsx, etc.
   - git add README.md package.json index.html src/components/Header.tsx ...
   - git commit -m "[STYLE]: Renommer l'application de "ShellM" à "SheLLM""
5. Entrée 3 : "[15:42:30] ✅ [TEST]** Standardiser les tests..."
   - Fichiers identifiés : src/services/commandExecutionService.ts, src/services/commandExecutionService.test.ts, etc.
   - git add src/services/commandExecutionService.ts src/services/commandExecutionService.test.ts ...
   - git commit -m "[TEST]: Standardiser les tests avec `test` au lieu de `it`..."
6. Vérification finale : git status → "nothing to commit, working tree clean"
7. Rapport : 3 commits créés avec succès
```

## Cas particuliers

### Fichiers modifiés non documentés dans CHANGELOG.md

Si git status montre des fichiers modifiés qui ne correspondent à aucune entrée du CHANGELOG :
1. Informez l'utilisateur de ces fichiers orphelins
2. Demandez à l'utilisateur s'il souhaite :
   - Créer une entrée dans CHANGELOG.md pour ces fichiers
   - Les inclure dans le commit existant le plus pertinent
   - Les laisser non commités

### Conflits dans les fichiers

Si un fichier modifié est mentionné dans plusieurs entrées du CHANGELOG :
1. Informez l'utilisateur du conflit
2. Demandez dans quel commit inclure ce fichier
3. N'incluez le fichier que dans un seul commit

### Fichiers supprimés

Pour les fichiers supprimés mentionnés dans le CHANGELOG :
- Utilisez `git add fichier_supprimé` pour préparer la suppression
- Le commit inclura automatiquement la suppression du fichier