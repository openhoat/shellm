# Configuration

## LLM Provider

Select your provider in the configuration panel. The selection is also configurable via the `SHELLM_LLM_PROVIDER` environment variable (`ollama`, `claude`, or `openai`).

### Ollama

- **URL**: Address of your Ollama instance (local or remote)
- **API Key**: Optional, if your Ollama instance requires authentication
- **Model**: Ollama model to use (llama2, mistral, etc.)
- **Temperature**: Controls AI creativity (0 = more precise, 1 = more creative)
- **Max Tokens**: Maximum number of tokens in the response

### Claude

- **API Key**: Your Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))
- **Model**: Claude model to use (claude-haiku-4-5-20251001, claude-sonnet-4-5-20250929, etc.)
- **Temperature**: Controls AI creativity (0 = more precise, 1 = more creative)
- **Max Tokens**: Maximum number of tokens in the response

### OpenAI

- **API Key**: Your OpenAI API key (from [platform.openai.com](https://platform.openai.com))
- **Model**: OpenAI model to use (gpt-4o, gpt-4, gpt-3.5-turbo, etc.)
- **Temperature**: Controls AI creativity (0 = more precise, 1 = more creative)
- **Max Tokens**: Maximum number of tokens in the response

## Interface

- **Theme**: Dark (default) or Light
- **Font Size**: Adjust text size (10-20px)

## Environment Variables

Environment variables take **priority** over the UI configuration. Copy `.env.example` to `.env` to get started.

| Variable | Description | Default |
|----------|-------------|---------|
| `SHELLM_LLM_PROVIDER` | LLM provider to use (`ollama`, `claude`, or `openai`) | `ollama` |
| `SHELLM_OLLAMA_URL` | Ollama instance URL | `http://localhost:11434` |
| `SHELLM_OLLAMA_API_KEY` | API key for Ollama authentication | *(none)* |
| `SHELLM_OLLAMA_MODEL` | Ollama model to use | `gemini-3-flash-preview:cloud` |
| `SHELLM_OLLAMA_TEMPERATURE` | Ollama temperature (0–1) | `0.7` |
| `SHELLM_OLLAMA_MAX_TOKENS` | Maximum tokens for Ollama response | `1000` |
| `SHELLM_CLAUDE_API_KEY` | Anthropic API key for Claude | *(none)* |
| `ANTHROPIC_API_KEY` | Standard Anthropic API key (fallback for `SHELLM_CLAUDE_API_KEY`) | *(none)* |
| `SHELLM_CLAUDE_MODEL` | Claude model to use | `claude-haiku-4-5-20251001` |
| `SHELLM_OPENAI_API_KEY` | OpenAI API key | *(none)* |
| `SHELLM_OPENAI_MODEL` | OpenAI model to use | `gpt-4o` |
| `SHELLM_SHELL` | Shell to use (`auto` for system default, or explicit path) | `auto` |
| `SHELLM_DEVTOOLS` | Open DevTools on launch (`true`/`false`) | `false` |
| `ELECTRON_OZONE_PLATFORM_HINT` | Force X11 on Linux Wayland (`x11`) | *(unset)* |
