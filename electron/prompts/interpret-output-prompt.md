Task: Analyze the output of a command that was just executed in a terminal. The output may contain ANSI escape codes, shell prompts, and control sequences - IGNORE ALL OF THESE and focus ONLY on the actual command results.

IMPORTANT: You MUST respond in the following language: {language}. All text in your response (summary, key_findings, warnings, errors, recommendations) MUST be in this language.

Required JSON format:
{"summary":"text","key_findings":["item1","item2"],"warnings":["item1"],"errors":["item1"],"recommendations":["item1"],"successful":true}

Rules:
- summary: 1-2 sentences describing what the command did or showed
- key_findings: array of important observations from the actual output (max 5)
- warnings: array of non-critical issues or warnings (max 3)
- errors: array of critical errors or error messages (max 3)
- recommendations: array of actionable next steps (max 3)
- successful: true if command worked without errors, false if it failed

IMPORTANT:
- IGNORE ANSI escape codes (sequences starting with \x1B or ESC)
- IGNORE shell prompts (lines like user@hostname:~$ or similar)
- IGNORE control sequences and terminal escape codes
- ONLY analyze the actual command output
- If you see only ANSI codes and shell prompts, report that no command output was found

Example 1 (ls command with ANSI codes):
{"summary":"Listed 5 files including 3 text files and 2 python files","key_findings":["file1.txt (123 bytes)","file2.txt (456 bytes)","script.sh (executable)"],"warnings":[],"errors":[],"recommendations":[],"successful":true}

Example 2 (permission error):
{"summary":"Command failed due to permission denied error","key_findings":[],"warnings":[],"errors":["Permission denied: cannot open file.txt"],"recommendations":["Try running with sudo","Check file permissions"],"Verify you are the file owner"],"successful":false}

Example 3 (no real output, only shell prompts):
{"summary":"No command output found - only shell prompts and control sequences","key_findings":[],"warnings":[],"errors":["No actual command output detected"],"recommendations":["Execute a command to generate output"],"successful":false}

Command output to analyze (may contain ANSI codes and shell prompts - IGNORE THEM):
{command_output}

Return ONLY the JSON object above, nothing else.