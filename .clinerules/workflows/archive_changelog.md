# Workflow d'archivage du CHANGELOG

## Objectif

Ce workflow automatise l'archivage des entrées anciennes du `CHANGELOG.md` vers `CHANGELOG_ARCHIVE.md`.

## Politique de rétention

- **Changements récents (30 derniers jours)** : conservés dans `CHANGELOG.md`
- **Changements anciens (plus de 30 jours)** : archivés dans `CHANGELOG_ARCHIVE.md`

## Période de rétention configurable

La période de rétention (par défaut 30 jours) peut être modifiée via une variable d'environnement :

```bash
CHANGELOG_RETENTION_DAYS=60 npm run archive-changelog
```

## Processus d'archivage

### 1. Lire le contenu de CHANGELOG.md

Utilisez l'outil `read_file` pour lire le contenu complet de `/CHANGELOG.md`.

### 2. Analyser les dates d'entrées

- Identifier toutes les sections de date (format `### DD/MM` sous un header d'année `## YYYY`)
- Calculer l'âge de chaque entrée en fonction de la date actuelle
- Identifier les sections contenant uniquement des entrées de plus de 30 jours

### 3. Séparer les entrées à archiver

- **Entrées à conserver** dans `CHANGELOG.md` : sections de moins de 30 jours
- **Entrées à archiver** dans `CHANGELOG_ARCHIVE.md` : sections de plus de 30 jours

### 4. Archiver les entrées anciennes

#### 4.1. Lire le contenu de CHANGELOG_ARCHIVE.md

```bash
read_file CHANGELOG_ARCHIVE.md
```

#### 4.2. Insérer les entrées archivées

- Insérer les entrées archivées immédiatement après la section `## Archives`
- Respecter l'ordre chronologique inverse (plus récent en haut)
- Utiliser `replace_in_file` avec un bloc SEARCH/REPLACE

**Format d'insertion :**
```markdown
## Archives

## YYYY

### DD/MM

**[HH:MM:SS] Emoji [TAG]** Description...
```

### 5. Nettoyer CHANGELOG.md

Supprimer les sections archivées de `CHANGELOG.md` en utilisant `replace_in_file`.

**Format de suppression :**
```markdown
------- SEARCH
## YYYY

### DD/MM

**[HH:MM:SS] Emoji [TAG]** Description...

=======

+++++++ REPLACE
```

### 6. Valider la qualité

Exécuter le script de validation :

```bash
npm run validate
```

### 7. Enregistrer la modification dans CHANGELOG.md

Ajouter une entrée dans CHANGELOG.md pour documenter l'archivage :

```markdown
**[HH:MM:SS] 🔧 [CHORE]** Archiver les entrées CHANGELOG de plus de 30 jours vers CHANGELOG_ARCHIVE.md
```

## Règles importantes

- **Toujours conserver** la documentation et les headers dans CHANGELOG.md
- **Ne jamais archiver** les entrées de moins de 30 jours
- **Respecter** le format antéchronologique dans les deux fichiers
- **Valider** la qualité après modification avec `npm run validate`
- **Documenter** l'opération dans CHANGELOG.md

## Exceptions

Ne PAS archiver :
- Les sections de documentation (en-têtes explicatifs)
- Les entrées de moins de 30 jours
- Les sections vides ou partiellement récentes (si une section contient des entrées récentes et anciennes, ne pas l'archiver)

## Commande manuelle

Pour exécuter l'archivage manuellement, utilisez :

```bash
npm run archive-changelog
```

La commande peut être personnalisée avec une période de rétention différente :

```bash
CHANGELOG_RETENTION_DAYS=60 npm run archive-changelog