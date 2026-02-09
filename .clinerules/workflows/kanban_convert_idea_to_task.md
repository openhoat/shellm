# Workflow Cline pour convertir les idées du Backlog en tâches

## Objectif

Ce workflow permet de convertir les idées de features de la section "Backlog" du fichier `/KANBAN.md` en sections "In Progress" avec des tâches associées.

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé :
- `- [ ]` → idée/tâche à faire
- `- [x]` → idée/tâche cochée
- Format idée : `- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Description`
- Format tâche : `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`

## Instructions d'exécution

### 1. Lire le fichier KANBAN.md

Utilisez l'outil `read_file` pour lire le contenu du fichier `/KANBAN.md` à la racine du projet.

### 2. Analyser et filtrer les idées

Identifiez toutes les lignes correspondant à des **idées à convertir** dans la section "## 📝 Backlog" :
- Recherchez les lignes avec le format `- [ ] **[...]] 💡 [IDEA]**`
- **Ignorez** les lignes déjà cochées (`- [x]`)
- **Ignorez** les commentaires et lignes d'en-têtes

### 3. Présenter les idées à l'utilisateur

Affichez la liste des idées trouvées avec un numéro pour chacune. Utilisez l'outil `ask_followup_question` pour demander à l'utilisateur :
- Quel(le)s idée(s) il souhaite convertir en tâche(s)
- Le cas échéant, s'il souhaite découper une idée en plusieurs tâches
- Si plusieurs idées doivent être converties, demandez toutes les sélections en une fois

### 4. Créer la section In Progress pour chaque idée

Pour chaque idée sélectionnée, créez une nouvelle section dans "## 🚧 In Progress" :

**Format de la section :**
```markdown
### [DD/MM/YYYY HH:mm:ss] 💡 [IDEA] Description de l'idée
- [ ] **[DD/MM/YYYY HH:mm:ss] ✨ [FEAT]** Tâche 1
- [ ] **[DD/MM/YYYY HH:mm:ss] 🔧 [CHORE]** Tâche 2
```

**Règles :**
- Utilisez la même date et heure que l'idée originale
- Créez autant de tâches que nécessaire
- Utilisez l'emoji et le tag appropriés selon la nature de chaque tâche :
  - `✨ [FEAT]` : Nouvelle fonctionnalité
  - `🐛 [FIX]` : Correction de bug
  - `♻️ [REFACTOR]` : Refactorisation
  - `⚡ [PERF]` : Performance
  - `📝 [DOCS]` : Documentation
  - `🎨 [STYLE]` : Style/Cosmétique
  - `✅ [TEST]` : Tests
  - `🔧 [CHORE]` : Configuration/Maintenance

### 5. Supprimer l'idée du Backlog

Une fois les tâches créées avec succès, supprimez l'idée correspondante de la section "## 📝 Backlog" :
- Utilisez `replace_in_file` pour supprimer la ligne de l'idée
- Le SEARCH block doit correspondre exactement à la ligne contenant l'idée
- **Important** : NE PAS laisser une trace cochée dans Backlog, supprimer complètement la ligne

### 6. Mettre à jour KANBAN.md

Utilisez `replace_in_file` pour ajouter la nouvelle section dans "## 🚧 In Progress" et supprimer l'idée de "## 📝 Backlog".

### 7. Rapport d'exécution

Informez l'utilisateur :
- Des tâches créées pour chaque idée
- De la suppression des idées du Backlog
- En cas d'erreur lors de la création des tâches, ne supprimez pas l'idée du Backlog

## Règles importantes

- Ne modifiez **jamais** les idées déjà en cours ou les sections existantes
- Ne supprimez une idée qu'après avoir confirmé que les tâches correspondantes ont été créées
- Si la création des tâches échoue, informez l'utilisateur sans modifier KANBAN.md
- Une idée convertie **disparaît complètement** du Backlog (pas de trace)

## Exemple de flux

```
1. Lire KANBAN.md → trouver 2 idées dans Backlog
2. Présenter les idées à l'utilisateur avec ask_followup_question
3. Utilisateur choisit l'idée #1 et demande de la découper en 3 tâches
4. Créer la section dans In Progress → succès
5. Supprimer l'idée #1 de Backlog
6. Rapport : 3 tâches créées depuis l'idée #1, idée supprimée du Backlog
```

## Exemple de conversion

**Avant - Backlog :**
```markdown
## 📝 Backlog
- [ ] **[05/02/2026 17:00:00] 💡 [IDEA]** Ajouter un système de thèmes sombre/clair
```

**Après - In Progress :**
```markdown
## 🚧 In Progress
### [05/02/2026 17:00:00] 💡 [IDEA] Ajouter un système de thèmes sombre/clair
- [ ] **[05/02/2026 17:30:15] 🔧 [CHORE]** Installer les dépendances nécessaires pour le système de thèmes
- [ ] **[05/02/2026 17:30:20] ✨ [FEAT]** Créer le composant ThemeSwitcher pour basculer entre les thèmes
- [ ] **[05/02/2026 17:30:25] 🎨 [STYLE]** Créer les styles pour le thème sombre
```

**Après - Backlog :**
```markdown
## 📝 Backlog

(Aucune idée pour le moment)
```

## Cas particulier : Tâches isolées

Pour ajouter une tâche isolée (non liée à une idée), l'utilisateur peut éditer directement KANBAN.md et ajouter :
- Dans "## 🚧 In Progress" : une tâche sans section idée
- Dans "## ✅ Done" : une tâche terminée

Exemple :
```markdown
## 🚧 In Progress
- [ ] **[05/02/2026 18:00:00] 🐛 [FIX]** Corriger un bug critique dans le login