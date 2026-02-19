# Kanban Board

**Priority Legend:**
- 🔴 **P1** = High Priority (critical, security, blocking issues)
- 🟡 **P2** = Medium Priority (important improvements)
- 🟢 **P3** = Low Priority (nice to have, enhancements)

**Category Icons (for Ideas):**
- 🔒 **[SECURITY]**: Security improvements (validation, sanitization, etc.)
- ✅ **[TEST]**: Testing improvements (unit tests, integration tests, coverage)
- 🚀 **[PERFORMANCE]**: Performance optimizations (caching, memoization, etc.)
- 🏗️ **[ARCHITECTURE]**: Code architecture improvements (refactoring, patterns)
- 🎨 **[UX]**: User experience improvements (shortcuts, tooltips, feedback)
- 🔧 **[DEVOPS]**: DevOps improvements (CI/CD, scripts, workflows)
- 🌍 **[I18N]**: Internationalization improvements (translations, locales)
- 📦 **[DEPENDENCIES]**: Dependency updates (package updates, upgrades)
- ⚙️ **[CONFIG]**: Configuration improvements (build tools, setup)

## 📝 Backlog

### 🔴 P1 - High Priority

- [ ] **#arch-ansi [19/02/2026 08:52:00] 🔴 P1 🏗️ [ARCHITECTURE]** Factoriser les fonctions ANSI dupliquées (stripAnsiCodes, stripOscSequences) dans un module partagé
- [ ] **#test-cov [19/02/2026 08:52:00] 🔴 P1 ✅ [TEST]** Améliorer la couverture de tests (56.68% → 80%) - priorité: useToast, useStore, Header, ConfigPanel

### 🟡 P2 - Medium Priority

- [ ] **#dep-update [19/02/2026 08:52:00] 🟡 P2 📦 [DEPENDENCIES]** Mettre à jour les dépendances (electron 40.5.0, biome 2.4.2, langchain, i18next)
- [ ] **#doc-model [19/02/2026 08:52:00] 🟡 P2 📝 [DOCS]** Définir 'llama3.2:3b' comme modèle par défaut, le rendre configurable et documenter les alternatives (llama3.1:8b, mistral:7b, qwen2.5:3b)
- [ ] **#perf-wait [19/02/2026 08:52:00] 🟡 P2 🚀 [PERFORMANCE]** Implémenter une attente intelligente pour l'interprétation des commandes (détection du prompt au lieu de COMMAND_OUTPUT_WAIT_TIME_MS fixe)
- [ ] **#devops-release [19/02/2026 08:56:31] 🟡 P2 🔧 [DEVOPS]** Improve release workflow to centralize version management
    - Create `scripts/bump-version.js` to update version in all files
    - Update README.md download links automatically
    - Modify `.clinerules/workflows/release.md` to use the script
    - Current pain point: version hardcoded in package.json AND README.md download links

### 🟢 P3 - Low Priority

- [ ] **#devops-logs [19/02/2026 08:52:00] 🟢 P3 🔧 [DEVOPS]** Améliorer les logs de debugging (blocs catch silencieux)
- [ ] **#devops-hook [19/02/2026 08:52:00] 🟢 P3 🔧 [DEVOPS]** Ajouter un hook pre-push Husky pour npm run validate

## 🚧 In Progress

## ✅ Done