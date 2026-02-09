#!/usr/bin/env node

/**
 * Script de génération du CHANGELOG.md depuis l'historique Git
 *
 * Ce script analyse l'historique Git pour générer un CHANGELOG.md orienté utilisateur.
 * Il détecte automatiquement les versions via les tags Git et filtre les commits
 * pertinents (FEAT, FIX, et REFACTOR majeurs).
 */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

// Configuration
const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md')
const COMMIT_TYPES = ['FEAT', 'FIX', 'REFACTOR']
const REFACTOR_KEYWORDS = ['breaking', 'major', 'important', 'refactor: major']

/**
 * Exécute une commande Git et retourne le résultat
 */
function execGit(command) {
  try {
    return execSync(command, { encoding: 'utf-8', cwd: process.cwd() })
  } catch (_error) {
    // biome-ignore lint/suspicious/noConsole: Script CLI - logging warnings
    console.warn(`Warning: Git command failed: ${command}`)
    return ''
  }
}

/**
 * Récupère tous les tags Git
 */
function getTags() {
  const tags = execGit('git tag --sort=-version:refname')
    .split('\n')
    .filter(tag => tag.trim() !== '')
  return tags
}

/**
 * Parse un message de commit au format Conventional Commits
 */
function parseCommitMessage(message) {
  const lines = message.trim().split('\n')
  const firstLine = lines[0]

  // Format: [TYPE]: description ou type(scope): description
  const match =
    firstLine.match(/^\[?([A-Z]+)\]?:(.+)/) || firstLine.match(/^(\w+)(?:\([^)]+\))?:(.+)/)

  if (!match) {
    return null
  }

  const type = match[1].toUpperCase()
  const description = match[2].trim()

  // Vérifier si c'est un REFACTOR majeur
  const body = lines.slice(1).join('\n').toLowerCase()
  const isMajorRefactor =
    type === 'REFACTOR' &&
    REFACTOR_KEYWORDS.some(
      keyword => body.includes(keyword) || description.toLowerCase().includes(keyword)
    )

  return {
    type,
    description,
    body: lines.slice(1).join('\n'),
    isMajorRefactor,
    rawMessage: message,
  }
}

/**
 * Récupère les commits entre deux références
 */
function getCommitsBetween(from, to = 'HEAD') {
  const commits = execGit(`git log ${from}..${to} --pretty=format:"%H|%s|%ci|%b" --reverse`)
    .split('\n')
    .filter(line => line.trim() !== '')

  return commits.map(line => {
    const [hash, subject, date, body] = line.split('|')
    return {
      hash,
      subject,
      date: new Date(date),
      body,
    }
  })
}

/**
 * Récupère les commits non taggés (depuis le dernier tag jusqu'à HEAD)
 */
function getUntaggedCommits() {
  const tags = getTags()
  const fromTag = tags.length > 0 ? tags[0] : null

  if (!fromTag) {
    return getCommitsBetween('')
  }

  return getCommitsBetween(fromTag)
}

/**
 * Récupère les commits pour un tag spécifique
 */
function getCommitsForTag(tag, previousTag = null) {
  const range = previousTag ? `${previousTag}..${tag}` : `${tag}^..${tag}`
  return getCommitsBetween(range, tag)
}

/**
 * Filtre les commits pertinents (FEAT, FIX, REFACTOR majeurs)
 */
function filterRelevantCommits(commits) {
  return commits.filter(commit => {
    const parsed = parseCommitMessage(commit.subject)
    if (!parsed) return false

    if (parsed.type === 'REFACTOR' && !parsed.isMajorRefactor) {
      return false
    }

    return COMMIT_TYPES.includes(parsed.type)
  })
}

/**
 * Regroupe les commits par type
 */
function groupCommitsByType(commits) {
  const grouped = {
    FEAT: [],
    FIX: [],
    REFACTOR: [],
  }

  for (const commit of commits) {
    const parsed = parseCommitMessage(commit.subject)
    if (parsed && grouped[parsed.type]) {
      grouped[parsed.type].push({
        ...commit,
        parsed,
      })
    }
  }

  return grouped
}

/**
 * Génère le contenu du CHANGELOG pour un groupe de commits
 */
function generateChangelogSection(version, date, commits) {
  const grouped = groupCommitsByType(commits)
  const sections = []

  // Nouveautés
  if (grouped.FEAT.length > 0) {
    sections.push('### Nouveautés')
    for (const commit of grouped.FEAT) {
      sections.push(`- ${commit.parsed.description}`)
    }
    sections.push('')
  }

  // Corrections
  if (grouped.FIX.length > 0) {
    sections.push('### Corrections')
    for (const commit of grouped.FIX) {
      sections.push(`- ${commit.parsed.description}`)
    }
    sections.push('')
  }

  // Refactorisation majeure
  if (grouped.REFACTOR.length > 0) {
    sections.push('### Refactorisation')
    for (const commit of grouped.REFACTOR) {
      sections.push(`- ${commit.parsed.description}`)
    }
    sections.push('')
  }

  if (sections.length === 0) {
    return null
  }

  const versionHeader = version ? `## ${version} (${date})` : `## ${date}`
  return `${versionHeader}\n\n${sections.join('\n')}\n`
}

/**
 * Formate une date en format français
 */
function formatDate(date) {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Génère le CHANGELOG complet
 */
function generateChangelog() {
  const tags = getTags()
  const untaggedCommits = getUntaggedCommits()
  const untaggedRelevant = filterRelevantCommits(untaggedCommits)

  const sections = []

  // Header
  sections.push('# Changelog\n')
  sections.push("Ce fichier est généré automatiquement depuis l'historique Git.\n")
  sections.push("Pour visualiser l'historique complet, utilisez : `git log`\n")

  // Version actuelle (non taggée)
  if (untaggedRelevant.length > 0) {
    const currentDate = formatDate(new Date())
    const section = generateChangelogSection(null, currentDate, untaggedRelevant)
    if (section) {
      sections.push(section)
    }
  }

  // Versions taggées
  tags.forEach((tag, index) => {
    const previousTag = index < tags.length - 1 ? tags[index + 1] : null
    const commits = getCommitsForTag(tag, previousTag)
    const relevant = filterRelevantCommits(commits)

    if (relevant.length > 0) {
      const tagDate = execGit(`git log -1 --format=%ci ${tag}`)
      const date = formatDate(new Date(tagDate))
      const section = generateChangelogSection(tag, date, relevant)
      if (section) {
        sections.push(section)
      }
    }
  })

  return sections.join('\n')
}

/**
 * Point d'entrée principal
 */
function main() {
  // biome-ignore lint/suspicious/noConsole: Script CLI - logging progress
  console.log("Génération du CHANGELOG.md depuis l'historique Git...")

  try {
    const changelog = generateChangelog()
    fs.writeFileSync(CHANGELOG_PATH, changelog, 'utf-8')
    // biome-ignore lint/suspicious/noConsole: Script CLI - logging success
    console.log('✓ CHANGELOG.md généré avec succès')
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Script CLI - logging errors
    console.error('Erreur lors de la génération du CHANGELOG:', error.message)
    process.exit(1)
  }
}

// Exécuter le script
if (require.main === module) {
  main()
}

module.exports = { generateChangelog }
