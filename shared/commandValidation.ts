/**
 * Command Validation Service
 * Provides proactive command validation with heuristic analysis and risk levels
 */

/**
 * Risk levels for command execution
 */
export type RiskLevel = 'safe' | 'warning' | 'dangerous'

/**
 * Categories of command risks
 */
export type RiskCategory =
  | 'file_deletion'
  | 'system_modification'
  | 'network_operation'
  | 'privilege_escalation'
  | 'disk_operation'
  | 'process_control'
  | 'data_destruction'
  | 'configuration_change'
  | 'unknown'

/**
 * Result of command validation
 */
export interface ValidationResult {
  /** Risk level of the command */
  riskLevel: RiskLevel
  /** Categories of risks identified */
  categories: RiskCategory[]
  /** Human-readable reason for the risk level */
  reason: string
  /** Specific patterns detected */
  patterns: string[]
  /** Suggestions for safer alternatives */
  suggestions: string[]
  /** Whether the command should be blocked */
  blocked: boolean
  /** Whether sandbox mode is recommended */
  sandboxRecommended: boolean
}

/**
 * Command pattern definition for risk detection
 */
interface CommandPattern {
  pattern: RegExp
  category: RiskCategory
  riskLevel: RiskLevel
  reason: string
  suggestion?: string
}

/**
 * Heuristic patterns for command analysis
 */
const COMMAND_PATTERNS: CommandPattern[] = [
  // File deletion patterns
  {
    pattern: /^rm\s+(-[rf]+\s+)*\//i,
    category: 'file_deletion',
    riskLevel: 'dangerous',
    reason: 'Recursive deletion of root or system directories',
    suggestion: 'Use specific paths instead of root directories',
  },
  {
    pattern: /^rm\s+(-[rf]+\s+)*\*\s*$/i,
    category: 'file_deletion',
    riskLevel: 'dangerous',
    reason: 'Recursive deletion of all files in current directory',
    suggestion: 'Specify files explicitly or use a safer method',
  },
  {
    pattern: /^rm\s+(-[rf]+\s+)*.+\*$/i,
    category: 'file_deletion',
    riskLevel: 'warning',
    reason: 'Recursive deletion with wildcard pattern',
    suggestion: 'Review the wildcard pattern carefully',
  },
  {
    pattern: /^rmdir\s+/i,
    category: 'file_deletion',
    riskLevel: 'safe',
    reason: 'Remove empty directory',
  },

  // Disk operations
  {
    pattern: /^dd\s+.*of=\/dev\//i,
    category: 'disk_operation',
    riskLevel: 'dangerous',
    reason: 'Direct disk write operation',
    suggestion: 'Ensure target device is correct',
  },
  {
    pattern: /^mkfs\./i,
    category: 'disk_operation',
    riskLevel: 'dangerous',
    reason: 'Format filesystem operation',
    suggestion: 'Verify the target device before formatting',
  },
  {
    pattern: /^mkfs\s+/i,
    category: 'disk_operation',
    riskLevel: 'dangerous',
    reason: 'Format filesystem operation',
    suggestion: 'Verify the target device before formatting',
  },
  {
    pattern: /^format\s/i,
    category: 'disk_operation',
    riskLevel: 'dangerous',
    reason: 'Format disk operation',
    suggestion: 'Verify the target disk before formatting',
  },
  {
    pattern: /^wipefs/i,
    category: 'disk_operation',
    riskLevel: 'dangerous',
    reason: 'Wipe filesystem signature',
    suggestion: 'Ensure you want to remove the filesystem signature',
  },
  {
    pattern: /^shred\s+/i,
    category: 'data_destruction',
    riskLevel: 'warning',
    reason: 'Secure file deletion with overwrite',
    suggestion: 'Verify files to be permanently deleted',
  },

  // System modification
  {
    pattern: /^shutdown/i,
    category: 'system_modification',
    riskLevel: 'dangerous',
    reason: 'System shutdown command',
    suggestion: 'Use with caution - will power off the system',
  },
  {
    pattern: /^poweroff/i,
    category: 'system_modification',
    riskLevel: 'dangerous',
    reason: 'System power off command',
    suggestion: 'Use with caution - will power off the system',
  },
  {
    pattern: /^reboot/i,
    category: 'system_modification',
    riskLevel: 'dangerous',
    reason: 'System reboot command',
    suggestion: 'Use with caution - will restart the system',
  },
  {
    pattern: /^init\s+[06]/i,
    category: 'system_modification',
    riskLevel: 'dangerous',
    reason: 'System state change to shutdown/reboot',
    suggestion: 'Use standard shutdown/reboot commands instead',
  },
  {
    pattern: /^systemctl\s+(stop|disable|mask)\s+/i,
    category: 'system_modification',
    riskLevel: 'warning',
    reason: 'System service modification',
    suggestion: 'Verify the service being modified',
  },

  // Privilege escalation
  {
    pattern: /^sudo\s+/i,
    category: 'privilege_escalation',
    riskLevel: 'warning',
    reason: 'Command executed with elevated privileges',
    suggestion: 'Review the command carefully before executing with sudo',
  },
  {
    pattern: /^su\s+/i,
    category: 'privilege_escalation',
    riskLevel: 'warning',
    reason: 'User switch with elevated privileges',
    suggestion: 'Consider using sudo for specific commands instead',
  },
  {
    pattern: /^chmod\s+[0-7]*7[0-7][0-7]\s+/i,
    category: 'privilege_escalation',
    riskLevel: 'warning',
    reason: 'Setting world-writable permissions',
    suggestion: 'Avoid setting world-writable permissions',
  },
  {
    pattern: /^chown\s+.*:.*\s+/i,
    category: 'privilege_escalation',
    riskLevel: 'warning',
    reason: 'Changing file ownership',
    suggestion: 'Verify the ownership change is intended',
  },

  // Process control
  {
    pattern: /^kill\s+-9\s+/i,
    category: 'process_control',
    riskLevel: 'warning',
    reason: 'Force kill process signal',
    suggestion: 'Try SIGTERM before SIGKILL',
  },
  {
    pattern: /^killall\s+/i,
    category: 'process_control',
    riskLevel: 'warning',
    reason: 'Kill all processes by name',
    suggestion: 'Verify the process name before killing',
  },
  {
    pattern: /^pkill\s+/i,
    category: 'process_control',
    riskLevel: 'warning',
    reason: 'Kill processes by pattern',
    suggestion: 'Review the pattern carefully',
  },

  // Network operations
  {
    pattern: /^iptables\s+/i,
    category: 'network_operation',
    riskLevel: 'dangerous',
    reason: 'Firewall rule modification',
    suggestion: 'Verify firewall rules before applying',
  },
  {
    pattern: /^ip\s+(route|addr|link)\s+/i,
    category: 'network_operation',
    riskLevel: 'warning',
    reason: 'Network configuration change',
    suggestion: 'Verify the network configuration',
  },
  {
    pattern: /^ifconfig\s+\w+\s+/i,
    category: 'network_operation',
    riskLevel: 'warning',
    reason: 'Network interface configuration',
    suggestion: 'Verify the interface configuration',
  },
  {
    pattern: /^curl\s+.*\|\s*(ba)?sh/i,
    category: 'network_operation',
    riskLevel: 'dangerous',
    reason: 'Download and execute script from network',
    suggestion: 'Download and review the script before executing',
  },
  {
    pattern: /^wget\s+.*\|\s*(ba)?sh/i,
    category: 'network_operation',
    riskLevel: 'dangerous',
    reason: 'Download and execute script from network',
    suggestion: 'Download and review the script before executing',
  },

  // Configuration changes
  {
    pattern: /^crontab\s+/i,
    category: 'configuration_change',
    riskLevel: 'warning',
    reason: 'Cron job modification',
    suggestion: 'Review the cron job before adding',
  },
  {
    pattern: /^sysctl\s+-\w\s+/i,
    category: 'configuration_change',
    riskLevel: 'warning',
    reason: 'Kernel parameter modification',
    suggestion: 'Verify the kernel parameter change',
  },

  // Kernel operations
  {
    pattern: /^rmmod\s+/i,
    category: 'system_modification',
    riskLevel: 'dangerous',
    reason: 'Kernel module removal',
    suggestion: 'Verify the module being removed',
  },
  {
    pattern: /^modprobe\s+-r\s+/i,
    category: 'system_modification',
    riskLevel: 'dangerous',
    reason: 'Kernel module removal',
    suggestion: 'Verify the module being removed',
  },

  // Fork bomb - multiple variations
  {
    pattern: /^:\(\)\s*\{.*:\|:&.*}\s*;:\s*$/,
    category: 'data_destruction',
    riskLevel: 'dangerous',
    reason: 'Fork bomb detected',
    suggestion: 'This will crash your system',
  },
  {
    pattern: /:\(\)\s*\{.*:\|:&.*}/,
    category: 'data_destruction',
    riskLevel: 'dangerous',
    reason: 'Fork bomb pattern detected',
    suggestion: 'This will crash your system',
  },

  // Data destruction
  {
    pattern: /^>\s*\//i,
    category: 'data_destruction',
    riskLevel: 'dangerous',
    reason: 'Overwriting file with empty content',
    suggestion: 'Verify the file path before overwriting',
  },
  {
    pattern: /\/dev\/null\s*>\s*\//i,
    category: 'data_destruction',
    riskLevel: 'dangerous',
    reason: 'Overwriting file with null',
    suggestion: 'Verify the file path before overwriting',
  },
]

/**
 * Injection patterns for detecting command injection attempts
 */
const INJECTION_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\$\(/, reason: 'Command substitution detected' },
  { pattern: /\${/, reason: 'Variable expansion detected' },
  { pattern: /`[^`]*`/, reason: 'Backtick command substitution detected' },
  {
    pattern: /;\s*(rm|dd|mkfs|shutdown|reboot|poweroff)/i,
    reason: 'Command chaining with dangerous command',
  },
  { pattern: /\|\s*(rm|dd|mkfs|shutdown|reboot|poweroff)/i, reason: 'Pipe to dangerous command' },
  {
    pattern: /&&\s*(rm|dd|mkfs|shutdown|reboot|poweroff)/i,
    reason: 'Conditional execution with dangerous command',
  },
]

/**
 * Safe commands that don't require validation
 */
const SAFE_COMMAND_PREFIXES = [
  'ls',
  'cat',
  'echo',
  'pwd',
  'whoami',
  'date',
  'uname',
  'hostname',
  'df',
  'du',
  'free',
  'top',
  'htop',
  'ps',
  'uptime',
  'w',
  'grep',
  'find',
  'which',
  'whereis',
  'type',
  'head',
  'tail',
  'less',
  'more',
  'wc',
  'sort',
  'uniq',
  'git status',
  'git log',
  'git diff',
  'git branch',
  'git remote',
  'npm list',
  'npm outdated',
  'yarn list',
  'pnpm list',
  'node --version',
  'npm --version',
  'python --version',
  'history',
  'alias',
  'env',
  'printenv',
]

/**
 * Validates a command and returns detailed risk assessment
 * @param command - The command string to validate
 * @returns ValidationResult with risk level, categories, and suggestions
 */
export function validateCommand(command: string): ValidationResult {
  const trimmedCommand = command.trim()
  const categories: Set<RiskCategory> = new Set()
  const patterns: string[] = []
  const suggestions: string[] = []
  let highestRisk: RiskLevel = 'safe'
  let blocked = false
  let primaryReason = 'Command appears safe'

  // Check for empty command
  if (!trimmedCommand) {
    return {
      riskLevel: 'safe',
      categories: [],
      reason: 'Empty command',
      patterns: [],
      suggestions: [],
      blocked: true,
      sandboxRecommended: false,
    }
  }

  // Check for injection patterns FIRST (before safe command check)
  for (const { pattern, reason } of INJECTION_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      categories.add('configuration_change')
      patterns.push(reason)
      suggestions.push('Remove shell injection patterns')
      // Only update to warning if not already dangerous
      if (highestRisk === 'safe') {
        highestRisk = 'warning'
      }
      primaryReason = reason
    }
  }

  // Check for sudo commands specially - extract the inner command
  const isSudo = /^sudo\s+/i.test(trimmedCommand)
  const commandToCheck = isSudo ? trimmedCommand.substring(5).trim() : trimmedCommand

  if (isSudo) {
    categories.add('privilege_escalation')
    patterns.push('sudo')
    suggestions.push('Review the command carefully before executing with elevated privileges')
    if (highestRisk === 'safe') {
      highestRisk = 'warning'
      primaryReason = 'Command executed with elevated privileges'
    }
  }

  // Check against command patterns for dangerous commands
  for (const { pattern, category, riskLevel, reason, suggestion } of COMMAND_PATTERNS) {
    // Skip the sudo pattern since we handle it specially above
    if (pattern.source === /^sudo\s+/i.source) continue

    if (pattern.test(commandToCheck)) {
      categories.add(category)
      patterns.push(pattern.source)

      if (suggestion) {
        suggestions.push(suggestion)
      }

      // Update highest risk level
      // If this is a sudo command, elevate warning to dangerous
      const actualRiskLevel = isSudo && riskLevel === 'warning' ? 'dangerous' : riskLevel

      if (actualRiskLevel === 'dangerous') {
        highestRisk = 'dangerous'
        primaryReason = isSudo ? `Sudo command with elevated risk: ${reason}` : reason
        blocked = true
      } else if (actualRiskLevel === 'warning' && highestRisk !== 'dangerous') {
        highestRisk = 'warning'
        primaryReason = isSudo ? `Sudo command with elevated risk: ${reason}` : reason
      }
    }
  }

  // If issues were found, return early (before safe command check)
  if (highestRisk !== 'safe') {
    // Determine if sandbox is recommended
    const sandboxRecommended =
      highestRisk === 'warning' ||
      highestRisk === 'dangerous' ||
      categories.has('file_deletion') ||
      categories.has('system_modification') ||
      categories.has('disk_operation')

    // Default suggestion if none provided
    if (suggestions.length === 0) {
      suggestions.push('Review the command before executing')
    }

    return {
      riskLevel: highestRisk,
      categories: Array.from(categories),
      reason: primaryReason,
      patterns,
      suggestions,
      blocked,
      sandboxRecommended,
    }
  }

  // Check for safe command prefixes (only if no issues found above)
  const isSafeCommand = SAFE_COMMAND_PREFIXES.some(prefix => trimmedCommand.startsWith(prefix))

  if (isSafeCommand && !trimmedCommand.includes('|') && !trimmedCommand.includes(';')) {
    return {
      riskLevel: 'safe',
      categories: ['unknown'],
      reason: 'Safe read-only command',
      patterns: [],
      suggestions: [],
      blocked: false,
      sandboxRecommended: false,
    }
  }

  // Default case for unrecognized commands
  return {
    riskLevel: highestRisk,
    categories: Array.from(categories),
    reason: primaryReason,
    patterns,
    suggestions,
    blocked,
    sandboxRecommended: false,
  }
}

/**
 * Gets a user-friendly description of the risk level
 * @param riskLevel - The risk level
 * @returns Human-readable description
 */
export function getRiskLevelDescription(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return 'This command is safe to execute'
    case 'warning':
      return 'This command requires attention before execution'
    case 'dangerous':
      return 'This command is potentially dangerous and requires confirmation'
    default:
      return 'Unknown risk level'
  }
}

/**
 * Gets the icon for a risk level
 * @param riskLevel - The risk level
 * @returns Icon string for display
 */
export function getRiskLevelIcon(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'dangerous':
      return '🚫'
    default:
      return '❓'
  }
}

/**
 * Gets the color for a risk level
 * @param riskLevel - The risk level
 * @returns CSS color string
 */
export function getRiskLevelColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return '#22c55e' // green
    case 'warning':
      return '#f59e0b' // amber
    case 'dangerous':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

/**
 * Command validation service object
 */
export const commandValidationService = {
  validateCommand,
  getRiskLevelDescription,
  getRiskLevelIcon,
  getRiskLevelColor,
}
