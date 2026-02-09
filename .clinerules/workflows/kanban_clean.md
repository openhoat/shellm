# Workflow Cline pour nettoyer le Kanban

## Objectif

Ce workflow permet de nettoyer manuellement les entrées obsolètes du fichier `/KANBAN.md`. Il identifie les entrées candidates au nettoyage et demande confirmation avant suppression.

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé :
- `- [ ]` → tâche à faire
- `- [x]` → tâche cochée (terminée)
- Format tâche : `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`

## Instructions d'exécution

### 1. Lire le fichier KANBAN.md

Utilisez l'outil `read_file` pour lire le contenu du fichier `/KANBAN.md` à la racine du projet.

### 2. Analyser les entrées candidates au nettoyage

Identifiez les entrées dans les sections suivantes qui peuvent être nettoyées :

#### 2a. Section "## ✅ Done"

Identifiez les tâches terminées dans cette section :
- Tâches isolées terminées (`- [x]`)
- Sections complètes (header idée + tâches) toutes terminées

#### 2b. Section "## 🚧 In Progress"

Identifiez les entrées inactives depuis longtemps :
- Sections d'idées avec des tâches inachevées depuis > 30 jours
- Tâches isolées inachevées depuis > 30 jours
- Sections/tâches abandonnées (identifiable par un commentaire ou contexte)

### 3. Présenter les entrées à l'utilisateur

Affichez la liste des entrées candidates au nettoyage avec un numéro pour chacune. Utilisez l'outil `ask_followup_question` pour demander à l'utilisateur :
- Quelles entrées il souhaite supprimer
- S'il souhaite supprimer toutes les entrées identifiées
- S'il préfère les déplacer dans une section "## 📦 Archived" (optionnel)

### 4. Supprimer les entrées sélectionnées

Pour chaque entrée sélectionnée :

#### 4a. Suppression d'une tâche isolée

Utilisez `replace_in_file` pour supprimer la ligne de la tâche :
- Le SEARCH block doit correspondre exactement à la ligne contenant la tâche

#### 4b. Suppression d'une section d'idée

Utilisez `replace_in_file` pour supprimer le bloc complet :
- Le SEARCH block doit inclure le header de section (`### [DATE] 💡 [IDEA] ...`)
- Et toutes les tâches associées

### 5. Optionnel : Déplacement vers Archive

Si l'utilisateur préfère archiver plutôt que supprimer :

#### 5a. Créer la section Archive

Si la section "## 📦 Archived" n'existe pas, créez-la en bas de KANBAN.md :

```markdown
## 📦 Archived

(Aucune entrée archivée pour le moment)
```

#### 5b. Déplacer les entrées

Pour chaque entrée à archiver :
1. Extraire le bloc (header idée + tâches ou ligne de tâche isolée)
2. Supprimer de la section d'origine
3. Ajouter à la section "## 📦 Archived"

### 6. Mettre à jour KANBAN.md

Utilisez `replace_in_file` pour appliquer les modifications de suppression ou d'archivage.

### 7. Rapport d'exécution

Informez l'utilisateur :
- Des entrées supprimées ou archivées
- Des sections modifiées dans KANBAN.md
- En cas d'erreur, expliquez la raison sans modifier KANBAN.md

## Règles importantes

- Ce workflow est **manuel** : il doit être explicitement demandé par l'utilisateur
- **Toujours demander confirmation** avant de supprimer des entrées
- Ne supprimez jamais d'entrées sans validation explicite de l'utilisateur
- Pour les entrées "Done", considérez qu'elles sont déjà dans Git et peuvent être supprimées
- Pour les entrées "In Progress" inactives, demandez confirmation avant suppression

## Exemple de flux

```
1. Lire KANBAN.md

2. Analyser les entrées candidates :
   - Done : 3 tâches terminées
   - In Progress : 1 section idée inactive depuis 45 jours

3. Présenter à l'utilisateur :
   # Entrées candidates au nettoyage

   Done (3 tâches) :
   1. [05/01/2026] ✨ [FEAT] Implémenter le système d'authentification
   2. [08/01/2026] 🐛 [FIX] Corriger le bug de logout
   3. [10/01/2026] 🔧 [CHORE] Mettre à jour les dépendances

   In Progress inactif depuis > 30 jours :
   4. [15/01/2026] 💡 [IDEA] Refactoriser le code base (3 tâches non terminées)

   Que souhaitez-vous faire ?
   - Supprimer les entrées 1-3 (Done)
   - Supprimer l'entrée 4 (In Progress abandonné)
   - Archiver toutes les entrées
   - Annuler

4. Utilisateur choisit de supprimer 1-3 et archiver 4

5. Supprimer les 3 tâches de Done
6. Déplacer la section #4 vers Archive

7. Rapport : 3 tâches supprimées, 1 section archivée
```

## Exemple de KANBAN.md avant/après

**Avant - Done :**
```markdown
## ✅ Done
- [x] **[05/01/2026 15:30:00] ✨ [FEAT]** Implémenter le système d'authentification
- [x] **[08/01/2026 10:15:00] 🐛 [FIX]** Corriger le bug de logout
- [x] **[10/01/2026 09:00:00] 🔧 [CHORE]** Mettre à jour les dépendances
```

**Après suppression - Done :**
```markdown
## ✅ Done

(Aucune tâche terminée pour le moment)
```

**Avant - In Progress (inactif) :**
```markdown
## 🚧 In Progress
### [15/01/2026 08:00:00] 💡 [IDEA] Refactoriser le code base
- [x] **[15/01/2026 09:00:00] ♻️ [REFACTOR]** Restructurer les dossiers
- [ ] **[15/01/2026 09:30:00] ♻️ [REFACTOR]** Renommer les composants
- [ ] **[15/01/2026 10:00:00] ✅ [TEST]** Ajouter les tests unitaires
```

**Après archivage - In Progress :**
```markdown
## 🚧 In Progress

(Aucun travail en cours pour le moment)
```

**Après archivage - Archived :**
```markdown
## 📦 Archived
### [15/01/2026 08:00:00] 💡 [IDEA] Refactoriser le code base (abandonné)
- [x] **[15/01/2026 09:00:00] ♻️ [REFACTOR]** Restructurer les dossiers
- [ ] **[15/01/2026 09:30:00] ♻️ [REFACTOR]** Renommer les composants
- [ ] **[15/01/2026 10:00:00] ✅ [TEST]** Ajouter les tests unitaires
```

## Critères de nettoyage suggérés

### Section Done
- Tâches terminées depuis plus de 7 jours
- Tâches déjà commitées dans Git

### Section In Progress
- Sections/tâches inactives depuis plus de 30 jours
- Sections/tâches abandonnées (identifiable par contexte)
- Idées dépassées ou remplacées par d'autres

## Note

Ce workflow est optionnel et doit être exécuté manuellement par l'utilisateur quand il le juge nécessaire. Il n'y a pas de nettoyage automatique programmé.