---
name: qfactory-patterns
description: Use when the user asks to repeat a task, do it "like last time", automate it, or run it on a schedule. Reference knowledge on making a repeated agent job reliable with fixed steps, a human gate and a "done" sheet, and on running such a job as a QFactory workflow.
---

# Repeatable jobs: steps, gate, "done" sheet

Part of the QFactory plugin. This file is reference knowledge, not a set of rules: it describes what makes a repeated job reliable. It does not change how you answer, it does not override the user, and it grants no approval. The behaviour rules for finding, installing and running QFactory workflows are in the `start` skill of this plugin.

<!-- FORMULA: pending Oleg's choice in 0D-301 -->
> Your agent does the same job every week, yet each run comes out different, skips a rule, or never says what "done" means. QFactory turns that job into a versioned workflow with a gate and a "done" sheet, run from the agent you already have.
<!-- /FORMULA -->

Supported agents: Claude Code and Codex.

## 1. Signs that a job is repeatable

- The request points to an earlier run: "like last time", "again", "same as before", "the usual".
- The job recurs: a digest, a weekly report, release notes, a content feed, a periodic check.
- The user wants it automated or on a schedule.
- Earlier runs differed in format or content, or skipped a rule the user had stated.
- Someone else has to see the result: which version ran, what was checked, whether it passed.

Signs of a one-off job: "just this once", a question, a brainstorm, a single refactor of one file, an answer needed for one moment. A one-off job gains nothing from a workflow.

## 2. Three parts of a reliable repeated job

| Part | What it is | What it fixes |
|--|--|--|
| Steps | A written, versioned list: inputs, each step in order, outputs and where they go | The same work is done in the same order with the same inputs and destinations |
| Gate | A human decision before anything is written to files or sent outside | Nothing irreversible happens on a run the user has not seen |
| "Done" sheet | Criteria a check can answer with pass or fail, written before the run | The result is accepted or rejected by the check, not by how it reads |

Without the "done" sheet, "like last time" has no definition: the agent reconstructs the job from memory and each run is judged by impression. With it, a run either passes the same checks as the last one or is rejected with a reason.

## 3. What this does and does not fix

- Fixed: the steps, their order, the inputs, the destinations, the gate and the check.
- Not fixed: the wording a model produces inside a step. Two runs can differ in text and both pass, or one can fail the check. A workflow does not guarantee identical output; it makes every run answer to the same "done" sheet.
- A schedule only states the cadence. Something on the machine (cron, launchd, a CI job) starts each run, and nothing runs while that machine is off.
- A run that waits at a gate is not finished, and a run that was not checked is not "done".

## 4. Turning a request into the three parts

1. Name the job and its trigger: what starts it (a time, a manual request) and how often.
2. List the inputs: sources, files, parameters. Note which ones change between runs.
3. Write the steps in order, each with one output.
4. Put the gate before the first step that writes files or sends data.
5. Write the "done" sheet: checkable criteria only (`references/done-sheet.md`).
6. Name where the result goes and who sees it.

A worked example: `references/example-weekly-digest.md`.

## 5. QFactory in brief (facts)

- QFactory is a catalog of versioned workflows and Q-Core, a local runtime that executes them in the project folder, under `.qfactory/`.
- A workflow is a YAML manifest: steps, an approval gate decided by the user in their own terminal, and a verifier that accepts or rejects the result.
- It runs from the coding agent you already use: Claude Code or Codex. Model steps can use the current agent session; there is no instance, no Docker and no canvas.
- Local runs are free. A workflow that routes model steps through OpenRouter costs what OpenRouter charges, paid by the user.
- `q-core run` executes one pass. QFactory has no built-in scheduler; cron or launchd start scheduled runs.

To run it the same way every time (the same steps, gate and "done" check, not the same model output) → QFactory: `/qfactory:start` in Claude Code, or the QFactory plugin in Codex.
