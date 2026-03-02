/**
 * Sandbox Service for Safe Command Execution
 *
 * Provides multiple levels of isolation for command execution:
 * - Level 1: Restricted environment (temp directory, limited PATH, timeout)
 * - Level 2: Docker container (optional, requires Docker)
 * - Level 3: System sandbox (Linux: firejail/bubblewrap)
 */

/**
 * Sandbox mode options
 */
export type SandboxMode = 'none' | 'restricted' | 'docker' | 'system'

/**
 * Sandbox configuration
 */
export interface SandboxConfig {
  /** Sandbox mode to use */
  mode: SandboxMode
  /** Working directory for sandbox */
  workDir?: string
  /** Timeout in milliseconds */
  timeout?: number
  /** Whether to mount current directory as read-only */
  readOnlyMount?: boolean
  /** Environment variables to set */
  env?: Record<string, string>
  /** Docker image to use (for docker mode) */
  dockerImage?: string
  /** Allowed commands (whitelist) */
  allowedCommands?: string[]
  /** Blocked commands (blacklist) */
  blockedCommands?: string[]
}

/**
 * Result of sandbox preparation
 */
export interface SandboxPrepareResult {
  /** Whether preparation was successful */
  success: boolean
  /** Sandbox ID for this session */
  sandboxId: string | null
  /** Error message if preparation failed */
  error?: string
  /** The command prefix to use (e.g., 'docker run ...') */
  commandPrefix?: string
  /** The command suffix to use */
  commandSuffix?: string
}

/**
 * Result of sandbox cleanup
 */
export interface SandboxCleanupResult {
  success: boolean
  error?: string
}

/**
 * Check if a command is allowed in sandbox mode
 */
export function isCommandAllowedInSandbox(
  command: string,
  allowedCommands?: string[],
  blockedCommands?: string[]
): { allowed: boolean; reason?: string } {
  // Extract the base command (first word)
  const baseCommand = command.trim().split(/\s+/)[0]

  // Check blocked commands first
  if (blockedCommands && blockedCommands.length > 0) {
    const isBlocked = blockedCommands.some(blocked => {
      // Support patterns like 'rm*' to block all rm variations
      if (blocked.endsWith('*')) {
        return baseCommand.startsWith(blocked.slice(0, -1))
      }
      return baseCommand === blocked
    })
    if (isBlocked) {
      return { allowed: false, reason: `Command '${baseCommand}' is blocked in sandbox mode` }
    }
  }

  // Check allowed commands (if whitelist is defined)
  if (allowedCommands && allowedCommands.length > 0) {
    const isAllowed = allowedCommands.some(allowed => {
      // Support patterns like 'ls*' to allow all ls variations
      if (allowed.endsWith('*')) {
        return baseCommand.startsWith(allowed.slice(0, -1))
      }
      return baseCommand === allowed
    })
    if (!isAllowed) {
      return { allowed: false, reason: `Command '${baseCommand}' is not in the allowed list` }
    }
  }

  return { allowed: true }
}

/**
 * Default sandbox configurations
 */
export const DEFAULT_SANDBOX_CONFIGS: Record<SandboxMode, SandboxConfig> = {
  none: {
    mode: 'none',
    timeout: 60000, // 1 minute
  },
  restricted: {
    mode: 'restricted',
    timeout: 30000, // 30 seconds
    blockedCommands: [
      'rm*',
      'dd',
      'mkfs*',
      'format',
      'shutdown',
      'reboot',
      'poweroff',
      'halt',
      'init',
      'telinit',
      '>dev/*',
    ],
    env: {
      // Restrict PATH to safe directories
      PATH: '/usr/local/bin:/usr/bin:/bin',
    },
  },
  docker: {
    mode: 'docker',
    timeout: 60000,
    dockerImage: 'alpine:latest',
    readOnlyMount: true,
    blockedCommands: [],
  },
  system: {
    mode: 'system',
    timeout: 60000,
    blockedCommands: ['rm*'],
  },
}

/**
 * Generate a unique sandbox ID
 */
export function generateSandboxId(): string {
  return `sandbox-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Prepare sandbox environment for command execution
 * Returns the command prefix/suffix to wrap the command
 */
export function prepareSandbox(config: SandboxConfig): SandboxPrepareResult {
  const sandboxId = generateSandboxId()

  switch (config.mode) {
    case 'none':
      return {
        success: true,
        sandboxId,
        commandPrefix: '',
        commandSuffix: '',
      }

    case 'restricted': {
      // For restricted mode, we'll use environment variables and timeout
      // The actual enforcement happens in the electron side
      return {
        success: true,
        sandboxId,
        commandPrefix: '',
        commandSuffix: config.timeout ? ` ; # timeout: ${config.timeout}ms` : '',
      }
    }

    case 'docker': {
      const image = config.dockerImage || 'alpine:latest'
      const workDir = config.workDir || process.cwd()
      const mountFlag = config.readOnlyMount ? ':ro' : ''

      return {
        success: true,
        sandboxId,
        commandPrefix: `docker run --rm ${mountFlag ? `-v "${workDir}:/work${mountFlag}"` : ''} -w /work ${image} sh -c "`,
        commandSuffix: '"',
      }
    }

    case 'system': {
      // Check for available system sandboxing tools
      // This is primarily for Linux
      if (process.platform === 'linux') {
        // Prefer firejail if available
        return {
          success: true,
          sandboxId,
          commandPrefix: 'firejail --quiet --noprofile --private-tmp --',
          commandSuffix: '',
        }
      }

      return {
        success: false,
        sandboxId: null,
        error: 'System sandbox mode is only available on Linux',
      }
    }

    default:
      return {
        success: false,
        sandboxId: null,
        error: `Unknown sandbox mode: ${config.mode}`,
      }
  }
}

/**
 * Wrap a command with sandbox execution
 */
export function wrapCommandForSandbox(
  command: string,
  config: SandboxConfig
): { wrappedCommand: string; sandboxId: string | null; error?: string } {
  // First check if command is allowed
  const allowedCheck = isCommandAllowedInSandbox(
    command,
    config.allowedCommands,
    config.blockedCommands
  )

  if (!allowedCheck.allowed) {
    return {
      wrappedCommand: command,
      sandboxId: null,
      error: allowedCheck.reason,
    }
  }

  // Prepare sandbox
  const prepareResult = prepareSandbox(config)

  if (!prepareResult.success) {
    return {
      wrappedCommand: command,
      sandboxId: null,
      error: prepareResult.error,
    }
  }

  // Wrap the command
  const { commandPrefix = '', commandSuffix = '' } = prepareResult
  const wrappedCommand = `${commandPrefix}${command}${commandSuffix}`.trim()

  return {
    wrappedCommand,
    sandboxId: prepareResult.sandboxId,
  }
}

/**
 * Clean up sandbox resources
 */
export async function cleanupSandbox(
  _sandboxId: string,
  _config: SandboxConfig
): Promise<SandboxCleanupResult> {
  // For now, this is a no-op
  // Docker containers are cleaned up with --rm flag
  // System sandbox processes clean up automatically
  // In the future, we might want to track and clean up resources

  return { success: true }
}

/**
 * Check if Docker is available
 */
export function isDockerAvailable(): boolean {
  // This would need to be implemented in the electron main process
  // For now, return false as a safe default
  return false
}

/**
 * Check if Firejail is available
 */
export function isFirejailAvailable(): boolean {
  // This would need to be implemented in the electron main process
  // For now, return false as a safe default
  return false
}

/**
 * Get recommended sandbox mode based on system capabilities
 */
export function getRecommendedSandboxMode(): SandboxMode {
  // Docker is most portable across platforms
  if (isDockerAvailable()) {
    return 'docker'
  }

  // Firejail is good for Linux
  if (process.platform === 'linux' && isFirejailAvailable()) {
    return 'system'
  }

  // Restricted mode works everywhere
  return 'restricted'
}
