# Workflow Cline pour créer des tâches depuis le Backlog

## Objectif

Ce workflow permet de convertir les idées de features du fichier `/BACKLOG.md` en tâches exécutables dans le fichier `/TASKS.md`.

## Règles de format

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé pour BACKLOG.md :
- `- [ ]` → idée de feature à convertir (à traiter)
- `- [x]` → idée déjà convertie (à ignorer)

En résumé pour TASKS.md :
- `- [ ]` → tâche à faire (à exécuter)
- `- [x]` → tâche cochée (à ignorer)

## Instructions d'exécution

### 1. Lire le fichier BACKLOG.md
- Utilisez l'outil `read_file` pour lire le contenu du fichier `/BACKLOG.md` à la racine du projet

### 2. Analyser et filtrer les idées
- Identifiez toutes les lignes correspondant à des **idées à convertir** (`- [ ]`)
- **Ignorez** les lignes déjà cochées (`- [x]`)
- **Ignorez** les lignes de commentaires (`[//]: #`)
- Excluez les lignes d'en-têtes et de règles de format

### 3. Présenter les idées à l'utilisateur
- Affichez la liste des idées trouvées avec un numéro pour chacune
- Utilisez l'outil `ask_followup_question` pour demander à l'utilisateur :
  - Quel(le)s idée(s) il souhaite convertir en tâche(s)
  - Le cas échéant, s'il souhaite découper une idée en plusieurs tâches
  - Si plusieurs idées doivent être converties, demandez toutes les sélections en une fois

### 4. Créer les tâches dans TASKS.md
- Pour chaque idée sélectionnée, créez une ou plusieurs tâches dans `/TASKS.md`
- Utilisez `replace_in_file` pour ajouter les tâches dans la section "## Tâches à faire"
- **Important : Les nouvelles tâches doivent être ajoutées au début de la liste (ordre antéchronologique, plus récent en haut)**
- Le format des tâches doit être : `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`
- Utilisez la date et l'heure actuelles
- Choisissez l'emoji et le tag appropriés selon la nature de la tâche :
  - `✨ [FEAT]` : Nouvelle fonctionnalité
  - `🐛 [BUG]` : Correction de bug
  - `♻️ [REFACTOR]` : Refactorisation
  - `⚡ [PERF]` : Performance
  - `📝 [DOCS]` : Documentation
  - `🎨 [STYLE]` : Style/Cosmétique
  - `✅ [TEST]` : Tests
  - `🔧 [CHORE]` : Configuration/Maintenance

### 5. Cocher l'idée convertie dans BACKLOG.md
- Une fois les tâches créées avec succès, cochez l'idée correspondante dans BACKLOG.md
- Utilisez `replace_in_file` pour changer la ligne de `- [ ]` à `- [x]`
- Le SEARCH block doit correspondre exactement à la ligne contenant l'idée
- **Important** : NE PAS modifier la date et l'heure dans BACKLOG.md

### 6. Rapport d'exécution
- Informez l'utilisateur des tâches créées
- Confirmez que l'idée a été cochée dans BACKLOG.md
- En cas d'erreur lors de la création des tâches, ne cochez pas l'idée

## Règles importantes

- Ne modifiez **jamais** les idées déjà cochées dans BACKLOG.md
- Ne cochez une idée qu'après avoir confirmé que les tâches correspondantes ont été créées
- Si la création des tâches échoue, informez l'utilisateur sans modifier BACKLOG.md
- **Important** : La règle `log_changes.md` s'occupera d'enregistrer la modification dans CHANGELOG.md lors de la création des tâches

## Exemple de flux

```
1. Lire BACKLOG.md → trouver 3 idées à convertir
2. Présenter les idées à l'utilisateur avec ask_followup_question
3. Utilisateur choisit l'idée #1 et demande de la découper en 2 tâches
4. Créer les 2 tâches dans TASKS.md → succès
5. La règle log_changes.md enregistre automatiquement dans CHANGELOG.md
6. Cocher l'idée #1 dans BACKLOG.md
7. Rapport : 2 tâches créées depuis l'idée #1, idée cochée
```

## Exemple de conversion

**Idée dans BACKLOG.md :**
```markdown
- [ ] **[05/02/2026 17:00:00] 💡 [IDEA]** Ajouter un système de thèmes sombre/clair
```

**Tâches créées dans TASKS.md :**
```markdown
- [ ] **[05/02/2026 17:30:15] 🔧 [CHORE]** Installer les dépendances nécessaires pour le système de thèmes
- [ ] **[05/02/2026 17:30:20] ✨ [FEAT]** Créer le composant ThemeSwitcher pour basculer entre les thèmes
- [ ] **[05/02/2026 17:30:25] 🎨 [STYLE]** Créer les styles pour le thème sombre
```

**BACKLOG.md après conversion :**
```markdown
- [x] **[05/02/2026 17:00:00] 💡 [IDEA]** Ajouter un système de thèmes sombre/clair