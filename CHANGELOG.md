# Changements

Voir `.clinerules/task_format.md` pour les règles de format détaillées.

En résumé :
- Format : `**[HH:MM:SS] Emoji [TAG]** Description`
- Tags et emojis :
  - `✨ [FEAT]` - Nouvelle fonctionnalité
  - `🐛 [FIX]` - Correction de bug
  - `♻️ [REFACTOR]` - Refactorisation
  - `⚡ [PERF]` - Performance
  - `📝 [DOCS]` - Documentation
  - `🎨 [STYLE]` - Style/Cosmétique
  - `✅ [TEST]` - Tests
  - `🔧 [CHORE]` - Configuration/Maintenance
- Classé par ordre antéchronologique (plus récent en haut)
- Organisation par année/mois/jour (la date complète est dans les sections)

## Historique des modifications


### 2026

### 09/02

**[07:32:00] 🎨 [STYLE]** Nettoyer les logs de débogage temporaires
- Supprimer tous les console.log() temporaires dans ChatPanel.tsx (11 logs)
- Supprimer tous les console.log() temporaires dans electron/ipc-handlers/ollama.ts (5 logs)
- Le code est maintenant propre et prêt pour la production

### 08/02

**[11:30:00] 🐛 [FIX]** Corriger le passage du paramètre de langue dans preload.ts
- Modifier electron/preload.ts pour accepter et passer le paramètre language au handler IPC
- Le frontend envoyait "fr" mais le backend recevait toujours "en" à cause d'un paramètre manquant
- Les interprétations sont maintenant correctement dans la langue de l'interface utilisateur

**[10:50:00] ✨ [FEAT]** Implémenter le support multilingue pour l'interprétation des résultats de commande
- Modifier le prompt d'interprétation pour accepter une variable de langue {language}
- Modifier la méthode OllamaService.interpretOutput() pour accepter un paramètre de langue
- Modifier le handler IPC ollama:interpret-output pour accepter et passer le paramètre de langue
- Modifier src/types/electron.d.ts pour ajouter le paramètre de langue optionnel
- Modifier ChatPanel.tsx pour importer useTranslation et passer i18n.language à l'interprétation
- Nettoyer le cache et refaire un build complet pour prendre en compte toutes les modifications
- Les interprétations sont maintenant automatiquement dans la langue de l'interface utilisateur

**[10:15:00] ✨ [FEAT]** Implémenter le support multilingue pour l'interprétation des résultats de commande
- Modifier le prompt d'interprétation pour accepter une variable de langue {language}
- Modifier la méthode OllamaService.interpretOutput() pour accepter un paramètre de langue
- Modifier le handler IPC ollama:interpret-output pour accepter et passer le paramètre de langue
- Modifier ChatPanel.tsx pour passer la langue de l'interface (i18n.language) à l'interprétation
- Les interprétations sont maintenant automatiquement dans la langue de l'interface utilisateur

**[09:30:00] ♻️ [REFACTOR]** Implémenter une nouvelle architecture de capture dans le backend Electron
- Déplacer la capture des données de sortie du frontend vers le backend Electron
- Ajouter les handlers terminal:startCapture et terminal:getCapture dans electron/ipc-handlers/terminal.ts
- Les données sont maintenant capturées directement dans le backend avant d'être envoyées au renderer
- Cela évite les problèmes de timing et de dépendance au hot-reload du frontend
- Supprimer la dépendance à terminalOutput dans ChatPanel.tsx

### 07/02

**[11:05:00] 🐛 [FIX]** Simplifier l'interprétation en laissant le LLM filtrer les codes ANSI et prompts shell
- Supprimer tout le filtrage complexe dans Terminal.tsx - capturer la sortie brute
- Modifier le prompt LLM pour ignorer les codes ANSI, prompts shell et séquences de contrôle
- Laisser le modèle LLM extraire les informations pertinentes de la sortie brute
- Approche beaucoup plus simple qui évite les problèmes de filtrage complexes

**[09:41:00] 🐛 [FIX]** Forcer bash avec --norc et améliorer le nettoyage des codes ANSI
- Ajouter l'option --norc à bash pour ignorer .bashrc et autres fichiers de configuration
- Renforcer le nettoyage des codes ANSI pour capturer toutes les séquences CSI, OSC et DCS
- Nettoyer tous les caractères de contrôle ASCII (\x00-\x1F\x7F)
- Ajouter des logs de débogage détaillés pour voir les lignes filtrées
- Garantir que seul le texte brut des résultats de commande est envoyé au LLM

### 06/02

**[07:41:00] 🐛 [FIX]** Forcer l'utilisation de bash avec un prompt simple pour simplifier le filtrage
- Changer le shell de zsh à bash dans electron/ipc-handlers/terminal.ts
- Configurer le prompt bash avec PS1='\\u@\\h:\\w\\$ ' (format: user@hostname:~$)
- Ajouter des fonctions pour nettoyer les codes ANSI et séquences OSC des lignes conservées
- Mettre à jour le filtre pour détecter et exclure les prompts bash (pattern: user@hostname:~$)
- Les résultats de commande sont maintenant envoyés au LLM sans codes de formatage ni prompts shell

**[06:59:00] 🐛 [FIX]** Filtrer les prompts shell lors de la capture de la sortie de terminal
- Ajouter un filtre regex dans Terminal.tsx pour exclure les prompts shell (user@hostname:~$)
- Améliorer le prompt d'interprétation pour mieux guider le modèle vers l'analyse des résultats réels
- Les lignes de prompt shell ne sont plus envoyées au modèle LLM pour interprétation
- Cela permet d'obtenir des interprétations plus pertinentes basées sur les résultats de commande réels

**[04:13:00] 🐛 [FIX]** Corriger le problème de JSON tronqué en augmentant la limite de tokens
- Identifier le problème grâce aux logs de débogage : JSON tronqué à 93 caractères
- Augmenter num_predict de 500 à 2000 pour permettre une génération JSON complète
- Ajouter des logs détaillés pour diagnostiquer les problèmes de génération
- Activer les Developer Tools dans Electron avec raccourci Ctrl+Shift+I

**[04:04:00] 🐛 [FIX]** Créer un prompt universel compatible avec tous les modèles LLM
- Créer un prompt neutre et universel qui fonctionne avec n'importe quel modèle (Ollama, Gemini, etc.)
- Utiliser des exemples simples sans markdown pour éviter les confusions
- Conserver les paramètres optimisés : température 0.1, tokens 500, top_p 0.9, repeat_penalty 1.1
- Formuler les instructions de manière claire et directe pour maximiser la conformité du modèle

**[04:01:00] 🐛 [FIX]** Améliorer le prompt et les paramètres pour forcer le format JSON strict
- Simplifier drastiquement le prompt (supprimer les exemples complexes, utiliser un format JSON minimaliste)
- Ajuster les paramètres Ollama : température 0.1 (très basse), tokens 500, top_p 0.9, repeat_penalty 1.1
- Utiliser un format JSON sur une seule ligne sans markdown pour réduire la confusion du modèle
- Ajouter l'instruction "JSON:" à la fin pour guider la réponse

**[03:58:00] ⚡ [PERF]** Améliorer le prompt d'interprétation de sortie avec 8 exemples concrets
- Ajouter des instructions critiques répétées pour forcer le format JSON strict
- Ajouter 8 exemples détaillés couvrant différents scénarios (ls, df, grep, ps, erreurs de permission, commande introuvable, erreur de syntaxe, fichier introuvable)
- Utiliser des délimiteurs JSON explicites dans les exemples (```json ... ```)
- Rendre les instructions plus strictes et répétitives pour assurer la conformité du modèle LLM

**[03:49:00] 🐛 [FIX]** Corriger l'erreur JSON et améliorer la vitesse d'interprétation
- Améliorer le prompt pour forcer le format JSON strict (MUST respond with ONLY valid JSON)
- Ajouter un fallback simple si le JSON n'est pas trouvé (interprétation basée sur des heuristiques)
- Réduire les délais d'attente de 3s à 1.5s pour une réponse plus rapide
- Limiter la sortie à 50 lignes pour réduire le temps de traitement
- Réduire la température à 0.3 et les tokens max à 300 pour des réponses plus cohérentes et rapides
- Ajouter des vérifications de type pour éviter les erreurs de parsing JSON

**[03:42:00] 🐛 [FIX]** Corriger l'affichage de l'interprétation des résultats de commande dans le chat
- Corriger l'index du message en le stockant lors de l'ajout à la conversation
- Améliorer la capture de la sortie dans Terminal.tsx pour capturer toutes les lignes
- Implémenter un mécanisme de détection intelligent de fin de commande (vérification périodique)
- Ajouter un indicateur de chargement pendant l'interprétation des résultats
- Ajouter des logs détaillés pour le débogage

**[03:23:30] 🔧 [CHORE]** Créer la tâche "Interpréter les résultats d'exécution de commande pour répondre dans le chat" dans TASKS.md depuis le backlog
**[03:19:30] 🐛 [FIX]** Corriger l'erreur TypeScript TS18028 dans tsconfig.json
- Ajouter "target": "ES2022" dans les compilerOptions
- Permettre l'utilisation des identifiants privés avec # syntaxe

**[03:13:50] 🐛 [FIX]** Corriger l'erreur ENOENT lors du chargement des prompts Ollama
- Modifier package.json pour copier le dossier electron/prompts/ vers dist-electron/electron/prompts/
- Ajouter une étape de copie dans le script build:electron
- Les fichiers de prompts sont maintenant inclus dans le build

**[03:11:15] ♻️ [REFACTOR]** Extraire les prompts Ollama dans des fichiers séparés
- Créer electron/prompts/system-prompt.md
- Créer electron/prompts/explain-command-prompt.md
- Modifier electron/ipc-handlers/ollama.ts pour charger les prompts depuis les fichiers
- Améliorer la maintenabilité des prompts

**[03:04:30] 🐛 [FIX]** Corriger l'affichage incohérent des messages de test de connexion dans ConfigPanel (succès/échec affichaient le même message)

## 2026

#### 06/02

**[02:58:19] ♻️ [REFACTOR]** Déplacer le sélecteur de langue du header vers les paramètres
- Supprimer LanguageSelector du composant Header
- Ajouter LanguageSelector dans ConfigPanel (section Interface)
- Améliorer l'accessibilité avec htmlFor et id

**[02:53:43] ♻️ [REFACTOR]** Convertir toutes les propriétés private vers la syntaxe moderne avec #
- Modifier electron/ipc-handlers/ollama.ts (OllamaService)
- Modifier src/utils/logger.ts (Logger)
- Modifier src/services/ollamaService.ts (OllamaService)
- Convertir 9 propriétés et 4 méthodes privées

**[02:49:00] 🔧 [CHORE]** Archiver toutes les entrées du CHANGELOG vers CHANGELOG_ARCHIVE.md
- Utiliser CHANGELOG_RETENTION_DAYS=0 pour forcer l'archivage de toutes les entrées
- Archiver 22 entrées du 06/02 et 3 entrées du 05/02
- Conserver uniquement les headers dans CHANGELOG.md
- Les entrées archivées sont maintenant dans CHANGELOG_ARCHIVE.md
