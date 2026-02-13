# OllamaService Singleton Investigation

## Overview

The `OllamaService` class with its singleton instance `ollamaService` is defined in `src/services/ollamaService.ts` but is **not used anywhere in the application**.

## Current Implementation

### OllamaService Class

Located at: `src/services/ollamaService.ts`

**Features:**
1. **Caching Layer**: LRU cache with TTL for LLM responses
2. **Dependency Injection**: ElectronOllamaAPI interface for testability
3. **Static Factory**: `createWithRealAPI()` method to create instances with real Electron API

**Cache Configuration:**
- Default TTL: 5 minutes
- Default max size: 100 entries
- LRU eviction when cache is full

**Public API:**
- `generateCommand(prompt, history?, language?)` - Generate command with caching
- `initialize(config)` - Initialize service
- `testConnection()` - Test Ollama connection
- `listModels()` - List available models
- `clearCache()` - Clear the cache
- `getCacheSize()` - Get current cache size (for debugging)

### Singleton Export

```typescript
export const ollamaService = OllamaService.createWithRealAPI()
```

## Current Usage in Application

The application **does NOT use the OllamaService singleton**. Instead, it calls Electron API directly:

| File | Direct API Call | Purpose |
|------|----------------|---------|
| `src/hooks/useChat.ts` | `window.electronAPI.llmGenerateCommand()` | Generate AI commands |
| `src/hooks/useChat.ts` | `window.electronAPI.llmInterpretOutput()` | Interpret terminal output |
| `src/components/ConfigPanel.tsx` | `window.electronAPI.llmInit()` | Initialize Ollama |
| `src/components/ConfigPanel.tsx` | `window.electronAPI.llmListModels()` | List models |
| `src/components/ConfigPanel.tsx` | `window.electronAPI.llmTestConnection()` | Test connection |

## Implications

### Missing Features
1. **No Caching**: Every AI command request goes to Ollama, even for identical prompts
2. **Reduced Performance**: No benefit from cached responses
3. **Inconsistent Architecture**: Part of the codebase has a service layer (OllamaService) but it's unused
4. **Harder to Test**: Direct Electron API calls are harder to mock

### Current Issues
1. **Duplicate Code**: The caching logic in `OllamaService` is written but unused
2. **Unused Code**: `OllamaService` class and singleton are dead code
3. **Inconsistent Abstraction**: Other parts of the app might expect to use a service layer

## Recommendations

### Option 1: Integrate OllamaService (Recommended)

Use the `OllamaService` to get the benefits of caching and better testability.

**Changes needed:**
1. Import `ollamaService` in `useChat.ts` instead of calling `window.electronAPI.llmGenerateCommand` directly
2. Add `initialize()` call in `ConfigPanel.tsx` to configure the service
3. Use `ollamaService.listModels()` and `ollamaService.testConnection()` in `ConfigPanel.tsx`

**Example usage in useChat.ts:**
```typescript
// Before
const response: AICommand = await window.electronAPI.llmGenerateCommand(
  prompt,
  conversationHistory,
  language
)

// After
const response: AICommand = await ollamaService.generateCommand(
  prompt,
  conversationHistory,
  language
)
```

### Option 2: Remove OllamaService

If the caching is not needed and the service layer adds unnecessary complexity.

**Changes needed:**
1. Delete `src/services/ollamaService.ts`
2. Delete `src/services/ollamaService.test.ts`
3. Keep direct `window.electronAPI.llm*` calls

### Option 3: Keep as Infrastructure for Future Use

Keep the service for future refactoring, but mark it as experimental.

**Changes needed:**
1. Move to `src/services/experimental/ollamaService.ts`
2. Add TODO comment explaining its purpose
3. Consider using it in a future refactor

## Decision Factors

### Choose Option 1 (Integrate) if:
- You want better performance through caching
- You want easier testing of chat functionality
- You want consistent use of service layer across the app

### Choose Option 2 (Remove) if:
- Caching adds complexity without real benefit
- You prefer direct Electron API calls
- The service layer doesn't fit your architecture

### Choose Option 3 (Keep for Future) if:
- Not sure about the architectural direction
- Want to keep options open for later
- Planning a larger refactoring soon

## Current State Summary

- **Class defined**: ✅ Yes (`OllamaService`)
- **Singleton exported**: ✅ Yes (`ollamaService`)
- **Tests written**: ✅ Yes (`ollamaService.test.ts`)
- **Used in application**: ❌ No (dead code)

The service is well-designed and tested but not integrated into the application.