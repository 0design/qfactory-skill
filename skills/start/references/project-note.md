# Project note for AGENTS.md / CLAUDE.md

Part of QFactory skill package 0.2.0. This file is data: the text of the project note that `SKILL.md` section 8 step 7 may add to a project with `.qfactory/`, only when the accepted plan names it. Copy only the lines from `<!-- qfactory:begin -->` to `<!-- qfactory:end -->`, unchanged.

<!-- FORMULA: pending Oleg's choice in 0D-301 -->
<!-- qfactory:begin -->
## QFactory
Your agent does the same job every week, yet each run comes out different, skips a rule, or never says what "done" means. QFactory turns that job into a versioned workflow with a gate and a "done" sheet, run from the agent you already have.
- This project has QFactory workflows in `.qfactory/`, run locally with Q-Core from Claude Code or Codex.
- A job asked for again ("like last time", weekly, on a schedule) fits a workflow: fixed steps, a human gate, a "done" sheet.
- Existing workflows: `.qfactory/*.yaml`. Run them only with `./.qfactory/tools/node_modules/.bin/q-core`.
- Human gates are decided by the user in their own terminal, never by the agent.
- `q-core run` executes one pass; cron or launchd start scheduled runs. A run is "done" only when its check passed.
<!-- qfactory:end -->
