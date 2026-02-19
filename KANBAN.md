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

- [ ] **#test-cov [19/02/2026 08:52:00] 🔴 P1 ✅ [TEST]** Améliorer la couverture de tests (56.68% → 80%) - priorité: useToast, useStore, Header, ConfigPanel

### 🟡 P2 - Medium Priority

- [ ] **#config-dist [19/02/2026 10:15:00] 🟡 P2 ⚙️ [CONFIG]** Centraliser les fichiers générés dans `dist/` (coverage, demo, distribuables) et simplifier le script npm clean
- [ ] **#config-rules [19/02/2026 10:15:00] 🟡 P2 ⚙️ [CONFIG]** Ajouter des règles de qualité TypeScript
    - Utiliser des arrow functions plutôt que `function`
    - S'appuyer sur IntelliJ qui détecte des erreurs TS
- [ ] **#perf-wait [19/02/2026 08:52:00] 🟡 P2 🚀 [PERFORMANCE]** Implémenter une attente intelligente pour l'interprétation des commandes (détection du prompt au lieu de COMMAND_OUTPUT_WAIT_TIME_MS fixe)

### 🟢 P3 - Low Priority

- [ ] **#devops-logs [19/02/2026 08:52:00] 🟢 P3 🔧 [DEVOPS]** Améliorer les logs de debugging (blocs catch silencieux)
- [ ] **#devops-hook [19/02/2026 08:52:00] 🟢 P3 🔧 [DEVOPS]** Ajouter un hook pre-push Husky pour npm run validate

## 🚧 In Progress

## ✅ Done

### [19/02/2026 10:08:00] 💡 [IDEA] #arch-ansi - Factoriser les fonctions ANSI dupliquées

- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Create shared/ansi.ts with stripAnsiCodes and stripOscSequences
- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Update Terminal.tsx to import from @shared/ansi
- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Update base-provider.ts to import from @shared/ansi
- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Remove duplicate function implementations

### [19/02/2026 09:49:00] 💡 [IDEA] #dep-update - Mettre à jour les dépendances

- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update electron to 40.5.0
- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update @biomejs/biome to 2.4.2
- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update i18next to 25.8.11
- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update @langchain/* packages

### [19/02/2026 10:05:00] 💡 [IDEA] #doc-model - Définir llama3.2:3b comme modèle par défaut

- [x] **[19/02/2026 10:05:00] 📝 [DOCS]** Set llama3.2:3b as default model in shared/config.ts
- [x] **[19/02/2026 10:05:00] 📝 [DOCS]** Add recommended models section to README.md
- [x] **[19/02/2026 10:05:00] 📝 [DOCS]** Update getting-started.md with model alternatives

### [19/02/2026 10:05:00] 💡 [IDEA] #devops-release - Improve release workflow

- [x] **[19/02/2026 10:05:00] 🔧 [DEVOPS]** Create scripts/bump-version.js for centralized version management
- [x] **[19/02/2026 10:05:00] 🔧 [DEVOPS]** Add bump-version npm script to package.json
- [x] **[19/02/2026 10:05:00] 🔧 [DEVOPS]** Update release workflow documentation