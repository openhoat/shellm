Task: Analyze the output of a command that was just executed in a terminal. The output may contain ANSI escape codes, shell prompts, and control sequences - IGNORE ALL OF THESE and focus ONLY on the actual command results.

IMPORTANT: You MUST respond in the following language: {{language}}. All text in your response (summary, key_findings, warnings, errors, recommendations) MUST be in this language.

Required JSON format:
{{"summary":"text","key_findings":["item1","item2"],"warnings":["item1"],"errors":["item1"],"recommendations":["item1"],"successful":true}}

Rules:
- summary: 1-2 sentences describing what the command did or showed, with specific numerical values when applicable
- key_findings: array of important observations with actual numbers/values extracted from output (max 5)
- warnings: array of non-critical issues or warnings (max 3)
- errors: array of critical errors or error messages (max 3)
- recommendations: array of actionable next steps (max 3)
- successful: true if command worked without errors, false if it failed
- EXTRACT and INCLUDE actual numerical data, percentages, file sizes, counts, etc. from the output
- Be specific and informative - don't just say "output received"

IMPORTANT:
- IGNORE ANSI escape codes (sequences starting with \x1B or ESC)
- IGNORE shell prompts (lines like user@hostname:~$ or similar)
- IGNORE control sequences and terminal escape codes
- ONLY analyze the actual command output
- EXTRACT meaningful data from the output (numbers, sizes, counts, percentages)
- If you see only ANSI codes and shell prompts, report that no command output was found

Example 1 (free -h command):
{{"summary":"Memory usage shows 8GB total RAM with 3.2GB used (40%) and 4.8GB available","key_findings":["Total memory: 8.0GB","Used: 3.2GB (40%)","Available: 4.8GB (60%)","Swap: 2.0GB total, 0GB used"],"Buffers/Cache: 1.5GB"],"warnings":[],"errors":[],"recommendations":["Memory usage is healthy - plenty available"],"successful":true}}

Example 2 (ls -lh command):
{{"summary":"Listed 5 items totaling 1.2MB in directory","key_findings":["3 files (1.0MB total)","2 directories","script.sh: 75KB (executable)"],"readme.txt: 128KB"],"data.csv: 800KB"],"warnings":[],"errors":[],"recommendations":["Large file data.csv (800KB) could be compressed"],"successful":true}}

Example 3 (permission error):
{{"summary":"Command failed due to permission denied error","key_findings":[],"warnings":[],"errors":["Permission denied: cannot open file.txt"],"recommendations":["Try running with sudo","Check file permissions","Verify you are the file owner"],"successful":false}}

Example 4 (no real output, only shell prompts):
{{"summary":"No command output found - only shell prompts and control sequences","key_findings":[],"warnings":[],"errors":["No actual command output detected"],"recommendations":["Execute a command to generate output"],"successful":false}}

Example 5 (silent command - mkdir, touch, cp, mv, etc. - successful with no output):
{{"summary":"Command executed successfully with no output - typical for mkdir, touch, cp, mv, and similar commands","key_findings":["No error messages detected","Command appears to have completed"],"warnings":[],"errors":[],"recommendations":["Verify the result if needed (e.g., ls to list files)"],"successful":true}}

Example 6 (silent command - chmod, chown, etc. - successful):
{{"summary":"Permission operation completed successfully","key_findings":["No error output","Command executed without errors"],"warnings":[],"errors":[],"recommendations":[],"successful":true}}

Command output to analyze (may contain ANSI codes and shell prompts - IGNORE THEM):
{{command_output}}

Return ONLY the JSON object above, nothing else.
