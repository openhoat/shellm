
# History

## Modification History









### 2026

#### 10/02

**[21:06:45] ✨ [FEAT]** Add resizable split pane between terminal and chat - implement Resizer component with drag-to-resize functionality, handle xterm resize on panel resize using ResizeObserver, set minimum width of 300px for both panels, remove max-width constraint from ChatPanel to allow full resizing
**[21:06:44] 🐛 [FIX]** Fix input disabled state when AI command is proposed - allow user to continue typing in chat input even when a command is displayed, auto-hide proposed command when user starts typing
**[08:43:00] 🐛 [FIX]** Fix Vitest configuration - exclude 'release' directory from test execution to prevent external node-pty tests from failing validation
**[08:38:00] 🐛 [FIX]** Improve AI response language detection and error messages - add language parameter to Ollama service, translate fallback messages to French/English, update system prompt to detect user language and ask clarifying questions for ambiguous requests
**[08:30:15] 🐛 [FIX]** Fix Ollama JSON parsing error - add fallback to return text response when JSON is not found in AI response, preventing "No JSON found in response" error
**[08:23:05] 🐛 [FIX]** Fix DevTools opening in production - improved detection using app.isPackaged to ensure DevTools only open in development mode
**[08:18:39] 🐛 [FIX]** Fix AppImage loading issue - corrected production file path to use relative path from compiled main.js
**[08:18:39] 🎨 [STYLE]** Hide menu bar by default with autoHideMenuBar option
**[08:15:13] 🐛 [FIX]** Fix npm run dist:linux command - corrected production file path in electron/main.ts, moved electron to devDependencies, added homepage field to package.json
