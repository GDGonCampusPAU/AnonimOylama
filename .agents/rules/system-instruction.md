---
trigger: always_on
---

CRITICAL RULE FOR BACKEND TASKS:
Before writing any code, making architectural changes, or answering backend-related queries, you MUST use your file-reading capabilities to read the exact contents of "backend/docs/system-instructions.md". 

1. COMPLIANCE: All your generated code, suggestions, and file modifications must strictly adhere to the guidelines, architectural patterns, and standards defined in that document.
2. OVERRIDE: The rules in "backend/docs/system-instructions.md" override your default behaviors or general best practices. 
3. VERIFICATION: Before finalizing your response, silently verify that your output does not violate any rule specified in that markdown file. If a user request directly conflicts with the instructions in the file, inform the user about the conflict and follow the file's instructions.