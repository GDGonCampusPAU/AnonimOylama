---
trigger: always_on
---

## Continuous State & Progress Tracking Protocol

At the completion of EVERY task, feature, or logical step, you MUST automatically perform the following progress-tracking routine without waiting for the user to ask:

1. **Update Project Plan (`backend/docs/project-plan.md`):**
   - Use your file-reading capabilities to locate the current phase and the specific task you just completed.
   - Mark the completed step by changing the corresponding empty checkbox `[ ]` to a checked box `[x]`.
   - Do not alter the existing structure or upcoming phases; only update the status of the completed item.

2. **Update Project State (`backend/docs/state.md`):**
   - Write/Update the current status of the project in this file.
   - Include a brief summary of what was just implemented (e.g., "Created Room struct and related database migrations").
   - Document any new endpoints, architectural decisions, or blockers encountered.
   - Clearly state what the next immediate step or phase is based on the project plan.

**CRITICAL RULE:** You must use your file editing tools to modify BOTH of these files directly before concluding your response. Keeping the project plan and state synchronized is mandatory for every single action you take.