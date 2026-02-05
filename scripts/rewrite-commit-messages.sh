#!/bin/bash

# Script to rewrite all Git commit messages in English
# This uses git filter-branch to rewrite commit messages

git filter-branch -f --msg-filter '
cat | sed \
  -e "s/^chore: Archiver exceptionnellement toutes les entrées du CHANGELOG/chore: exceptionally archive all CHANGELOG entries/g" \
  -e "s/^docs: Mettre à jour le README avec les badges GitHub/docs: update README with GitHub badges/g" \
  -e "s/^style: Mettre à jour l'\''année de copyright dans le README de 2025 à 2026/style: update copyright year in README from 2025 to 2026/g" \
  -e "s/^chore: archiver exceptionnellement toutes les entrées du CHANGELOG/chore: exceptionally archive all CHANGELOG entries/g" \
  -e "s/^chore: supprimer le script restructure-electron.js inutile/chore: remove unnecessary restructure-electron.js script/g" \
  -e "s/^refactor: restructurer l'\''architecture de gestion des tâches et idées/refactor: restructure task and idea management architecture/g" \
  -e "s/^chore: configurer commitlint pour normaliser les messages de commit/chore: configure commitlint to standardize commit messages/g" \
  -e "s/^fix: corriger et tester le script d'\''archivage du CHANGELOG/fix: fix and test CHANGELOG archive script/g" \
  -e "s/^chore: Corriger le hook commit-msg husky/chore: fix husky commit-msg hook/g" \
  -e "s/^chore: Configurer commitlint pour normaliser les messages de commit/chore: configure commitlint to standardize commit messages/g" \
  -e "s/^Initial import/Initial import/g"
' HEAD