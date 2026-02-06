#!/usr/bin/env node

/**
 * Script d'archivage du CHANGELOG
 * Déplace les entrées anciennes de CHANGELOG.md vers CHANGELOG_ARCHIVE.md
 */

const fs = require('node:fs')
const path = require('node:path')

// Configuration de la période de rétention (30 jours par défaut)
const RETENTION_DAYS =
  process.env.CHANGELOG_RETENTION_DAYS !== undefined
    ? parseInt(process.env.CHANGELOG_RETENTION_DAYS, 10)
    : 30

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md')
const ARCHIVE_PATH = path.join(__dirname, '..', 'CHANGELOG_ARCHIVE.md')

/**
 * Parse une date au format DD/MM/YYYY
 */
function _parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Vérifie si une date est plus ancienne que la période de rétention
 */
function isOlderThanRetention(date) {
  const now = new Date()
  const cutoffDate = new Date(now)
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)
  // Si RETENTION_DAYS est 0, considérer que toutes les dates sont anciennes
  // (incluant aujourd'hui)
  if (RETENTION_DAYS === 0) {
    return date <= cutoffDate
  }
  return date < cutoffDate
}

/**
 * Parse le contenu du CHANGELOG pour extraire les sections à archiver
 */
function parseChangelog(content) {
  const lines = content.split('\n')
  const result = {
    header: [],
    sections: [],
    currentSection: null,
    currentYear: null,
  }

  // Trouver la première section d'année
  const firstYearIndex = lines.findIndex(line => line.match(/^### \d{4}$/))

  // Le header est tout ce qui est avant la première section d'année
  if (firstYearIndex !== -1) {
    result.header = lines.slice(0, firstYearIndex)
  } else {
    // Pas de section d'année trouvée
    return result
  }

  // Parser les entrées (sections d'année et de date)
  for (let i = firstYearIndex; i < lines.length; i++) {
    const line = lines[i]

    // Header d'année (### YYYY)
    const yearMatch = line.match(/^### (\d{4})$/)
    if (yearMatch) {
      if (result.currentSection) {
        result.sections.push(result.currentSection)
      }
      result.currentYear = parseInt(yearMatch[1], 10)
      result.currentSection = {
        year: result.currentYear,
        dates: [],
        content: [line],
      }
      continue
    }

    // Header de date (#### DD/MM)
    const dateMatch = line.match(/^#### (\d{2})\/(\d{2})$/)
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10)
      const month = parseInt(dateMatch[2], 10)
      const date = new Date(result.currentYear, month - 1, day)

      if (result.currentSection) {
        result.currentSection.dates.push({
          date,
          day,
          month,
          year: result.currentYear,
          lineIndex: result.currentSection.content.length,
        })
        result.currentSection.content.push(line)
      }
      continue
    }

    // Lignes de contenu
    if (result.currentSection) {
      result.currentSection.content.push(line)
    }
  }

  // Ajouter la dernière section
  if (result.currentSection) {
    result.sections.push(result.currentSection)
  }

  return result
}

/**
 * Sépare les sections en récentes et anciennes
 */
function partitionSections(sections) {
  const recent = []
  const old = []

  // Si RETENTION_DAYS est 0, archiver TOUTES les sections
  const forceArchiveAll = RETENTION_DAYS === 0

  for (const section of sections) {
    const sectionDates = section.dates
    if (sectionDates.length === 0 && !forceArchiveAll) {
      recent.push(section)
      continue
    }

    // Vérifier si toutes les dates de la section sont anciennes
    // Ou forcer l'archivage si RETENTION_DAYS est 0
    const allOld =
      forceArchiveAll || sectionDates.every(d => d.date && isOlderThanRetention(d.date))

    if (allOld) {
      old.push(section)
    } else {
      recent.push(section)
    }
  }

  return { recent, old }
}

/**
 * Construit le contenu du CHANGELOG avec les sections récentes
 */
function buildChangelogContent(header, recentSections) {
  const headerContent = header.join('\n')

  if (recentSections.length === 0) {
    // Si aucune section récente, ne garder que le header
    return headerContent
  }

  const entriesContent = recentSections.map(s => s.content.join('\n')).join('\n')

  return `${headerContent}\n${entriesContent}`
}

/**
 * Construit le contenu de l'archive avec les sections anciennes
 */
function buildArchiveContent(oldSections) {
  return oldSections.map(s => s.content.join('\n')).join('\n')
}

/**
 * Point d'entrée principal
 */
function main() {
  // Lire le CHANGELOG
  if (!fs.existsSync(CHANGELOG_PATH)) {
    process.exit(1)
  }

  const changelogContent = fs.readFileSync(CHANGELOG_PATH, 'utf-8')

  // Parser le CHANGELOG
  const parsed = parseChangelog(changelogContent)

  // Séparer les sections récentes et anciennes
  const { recent, old } = partitionSections(parsed.sections)

  if (old.length === 0) {
    process.exit(0)
  }

  // Construire le nouveau contenu du CHANGELOG
  const newChangelogContent = buildChangelogContent(parsed.header, recent)

  // Écrire le nouveau contenu du CHANGELOG
  fs.writeFileSync(CHANGELOG_PATH, `${newChangelogContent.trim()}\n`, 'utf-8')

  // Construire le contenu de l'archive
  const oldContent = buildArchiveContent(old)

  // Lire ou créer l'archive
  let archiveContent = ''
  if (fs.existsSync(ARCHIVE_PATH)) {
    archiveContent = fs.readFileSync(ARCHIVE_PATH, 'utf-8')
  } else {
    // Créer le fichier d'archive avec le header de base
    archiveContent = `# Changelog Archive

Ce fichier contient l'historique archivé des modifications du projet.

## Politique de rétention

- **Changements récents (30 derniers jours)** : conservés dans \`CHANGELOG.md\`
- **Changements anciens (plus de 30 jours)** : archivés dans \`CHANGELOG_ARCHIVE.md\`
- **Commande d'archivage manuel** : \`npm run archive-changelog\`

## Format des entrées

Voir \`.clinerules/task_format.md\` pour les règles de format détaillées.

---

## Archives
`
  }

  // Insérer les entrées archivées après la section ## Archives
  const archiveSectionEnd = archiveContent.indexOf('## Archives\n') + '## Archives\n'.length
  // Ajouter le header du CHANGELOG (sans le titre "# Changelog") en haut des entrées archivées
  const changelogHeader = parsed.header.join('\n').replace(/^# Changelog\n/, '')
  const finalArchiveContent = `${archiveContent.slice(0, archiveSectionEnd)}\n${changelogHeader}\n\n${oldContent}\n`

  fs.writeFileSync(ARCHIVE_PATH, `${finalArchiveContent.trim()}\n`, 'utf-8')
}

main()
