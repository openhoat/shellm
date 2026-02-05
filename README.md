# SheLLM - AI-Powered Terminal

Un terminal moderne alimenté par l'intelligence artificielle avec Ollama, inspiré de WARP. SheLLM vous permet de décrire ce que vous voulez faire en langage naturel et l'IA génère les commandes shell appropriées.

## 🚀 Fonctionnalités

- **Terminal de base** : Interface de terminal complète avec xterm.js
- **IA Intégrée** : Génération de commandes shell à partir de descriptions en langage naturel
- **Support Ollama** : Connexion configurable à des instances Ollama (locales ou distantes)
- **Interface moderne** : Design sombre par défaut avec thème clair optionnel
- **Configuration flexible** : URL Ollama, modèle, température, et plus encore
- **Historique** : Suivi des conversations et des commandes exécutées

## 📋 Prérequis

- Node.js 18+ et npm
- Ollama installé et en cours d'exécution (pour l'utilisation locale)
- Python 3 et make (pour la compilation de node-pty sur Linux)

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd shellm
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Installer et configurer Ollama

#### Installation d'Ollama

Visitez [ollama.ai](https://ollama.ai) et suivez les instructions d'installation pour votre système d'exploitation.

#### Démarrer Ollama

```bash
ollama serve
```

#### Télécharger un modèle

```bash
ollama pull llama2
# ou tout autre modèle de votre choix
```

#### Utilisation d'une instance distante

Si vous utilisez Ollama sur une machine distante, configurez l'URL dans le panneau de configuration de SheLLM.

## 🎮 Utilisation

### Mode développement

```bash
npm run dev
```

Cela lancera :
- Le serveur de développement Vite (http://localhost:5173)
- L'application Electron

### Build pour production

```bash
npm run build
```

### Créer des exécutables

#### Linux

```bash
npm run dist:linux
```

#### macOS

```bash
npm run dist:mac
```

#### Windows

```bash
npm run dist:win
```

Les fichiers exécutables seront créés dans le dossier `release/`.

## 📖 Guide d'utilisation

### Première utilisation

1. Lancez l'application avec `npm run dev`
2. Cliquez sur l'icône d'engrenage en haut à droite pour ouvrir la configuration
3. Configurez l'URL de votre instance Ollama (par défaut : `http://localhost:11434`)
4. Cliquez sur "Tester la connexion" pour vérifier la connexion
5. Sélectionnez le modèle que vous souhaitez utiliser
6. Cliquez sur "Enregistrer"

### Utiliser l'IA

1. Dans le panneau de droite (AI Assistant), tapez votre demande en langage naturel
   - Exemple : "Liste tous les fichiers de plus de 10MB dans le dossier courant"
2. L'IA analysera votre demande et proposera une commande shell
3. Vous pouvez :
   - **Exécuter** : Lancer directement la commande dans le terminal
   - **Modifier** : Ajuster la commande avant exécution
   - **Annuler** : Ignorer la proposition

### Utiliser le terminal

Le terminal de gauche fonctionne comme un terminal classique. Vous pouvez :
- Tapez des commandes directement
- Naviguer dans les dossiers
- Exécuter n'importe quelle commande shell

## ⚙️ Configuration

### Ollama

- **URL** : Adresse de votre instance Ollama (locale ou distante)
- **Clé API** : Optionnel, si votre instance Ollama nécessite une authentification
- **Modèle** : Modèle Ollama à utiliser (llama2, mistral, etc.)
- **Température** : Contrôle la créativité de l'IA (0 = plus précis, 1 = plus créatif)
- **Max Tokens** : Nombre maximum de tokens dans la réponse

### Interface

- **Thème** : Sombre (par défaut) ou Clair
- **Taille de police** : Ajustez la taille du texte (10-20px)

## 🏗️ Architecture

### Structure du projet

```
shellm/
├── electron/              # Processus principal Electron
│   ├── main.ts           # Point d'entrée
│   ├── preload.ts        # Script de préchargement
│   ├── ipc-handlers/     # Handlers IPC
│   │   ├── terminal.ts   # Gestion du terminal
│   │   ├── ollama.ts     # Service Ollama
│   │   └── config.ts     # Gestion de la configuration
│   └── tsconfig.json     # Configuration TypeScript
├── src/                   # Processus de rendu (React)
│   ├── components/       # Composants React
│   │   ├── Terminal.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── Header.tsx
│   │   └── ConfigPanel.tsx
│   ├── store/            # Gestion d'état (Zustand)
│   ├── types/            # Types TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── App.css
├── shared/               # Code partagé
│   └── types.ts          # Types TypeScript communs
├── dist/                 # Build React (généré)
├── dist-electron/        # Build Electron (généré)
├── release/              # Exécutables (généré)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Technologies utilisées

- **Electron** : Framework d'applications de bureau
- **React** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Vite** : Build tool et serveur de développement
- **xterm.js** : Émulateur de terminal
- **node-pty** : Émulation de terminal PTY
- **Zustand** : Gestion d'état
- **Ollama** : LLM local
- **Axios** : Client HTTP

## 🧪 Tests

SheLLM utilise une architecture de test avec **Vitest** qui sépare la logique métier de la couche Electron, permettant de tester environ **80% du code** sans dépendre d'Electron.

### Ce qui est testé

✅ **Logique d'état (Zustand)** : Gestion de l'état, actions (setConfig, setAiCommand, addToHistory, etc.)
✅ **Composants React** : Logique de rendu et interactions utilisateur
✅ **Types partagés** : Structures de données

### Ce qui n'est pas testé

❌ **Couche Electron IPC** : `electron/ipc-handlers/`
❌ **Fenêtre Electron** : `electron/main.ts`
❌ **Intégration complète** : Tests E2E

### Exécution des tests

```bash
# Exécuter les tests
npm test

# Mode watch (re-exécution automatique)
npm run test:watch

# Mode UI (interface interactive)
npm run test:ui
```

### Structure des tests

```
src/
├── test/
│   ├── setup.ts              # Configuration + mocks window.electronAPI
│   └── README.md             # Documentation des tests
├── store/
│   └── useStore.test.ts      # Tests du store Zustand
└── components/
    └── Header.test.tsx       # Tests des composants React
```

### Ajouter un nouveau test

1. Créez un fichier `.test.ts` ou `.test.tsx` dans le dossier correspondant
2. Utilisez les mocks de `window.electronAPI` définis dans `src/test/setup.ts`
3. Exécutez les tests avec `npm test`

## 📝 Conventions de commit

Ce projet utilise **commitlint** pour normaliser les messages de commit selon le format [Conventional Commits](https://www.conventionalcommits.org/).

### Format de commit

```
<type>(<scope>): <subject>
```

### Types autorisés

- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation
- **style** : Style/formatage (pas de changement de code)
- **refactor** : Refactorisation
- **perf** : Performance
- **test** : Tests
- **chore** : Maintenance/Configuration
- **revert** : Revert d'un commit

### Exemples

```bash
git commit -m "feat: ajouter le support de la configuration Ollama"
git commit -m "fix: corriger l'erreur de connexion au terminal"
git commit -m "docs: mettre à jour le README"
git commit -m "style: formater le code avec Biome"
git commit -m "refactor: simplifier la logique du store Zustand"
git commit -m "perf: optimiser les performances de rendu"
git commit -m "test: ajouter des tests pour le composant Terminal"
git commit -m "chore: mettre à jour les dépendances"
```

### Validation automatique

Un hook Git automatique valide le format de chaque commit avant son application. Si le format est incorrect, le commit sera rejeté.

### Validation manuelle

Pour valider un message de commit manuellement :

```bash
npm run commit:lint
```

## 🔒 Sécurité

- Les commandes proposées par l'IA ne sont pas exécutées automatiquement
- Vous avez toujours le contrôle : validation avant exécution
- Possibilité de modifier les commandes avant exécution
- Configuration stockée localement avec electron-store

## 🐛 Dépannage

### Erreur de connexion Ollama

1. Vérifiez qu'Ollama est en cours d'exécution : `ollama serve`
2. Vérifiez l'URL dans la configuration
3. Testez la connexion depuis votre navigateur : `http://localhost:11434/api/tags`

### Problèmes de build

- Linux : Assurez-vous d'avoir Python 3 et make installés
- macOS : Assurez-vous d'avoir Xcode Command Line Tools installés
- Windows : Assurez-vous d'avoir les outils de build Visual Studio installés

### node-pty ne compile pas

Sur Linux :
```bash
sudo apt-get install build-essential python3
npm rebuild node-pty
```

## 📝 Exemples de requêtes

- "Liste tous les fichiers Python dans le dossier courant"
- "Trouve les fichiers de plus de 100MB dans /home"
- "Affiche l'utilisation du disque"
- "Compte le nombre de lignes dans tous les fichiers .txt"
- "Crée un dossier avec la date d'aujourd'hui"

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

ISC

## 👨‍💻 Auteur

Olivier Penhoat <openhoat@gmail.com>

## 🙏 Remerciements

- WARP pour l'inspiration
- L'équipe Ollama pour leur excellent outil
- La communauté open-source