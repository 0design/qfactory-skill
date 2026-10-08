# Creating or adapting a workflow

Part of QFactory skill package 0.2.0. All rules of `SKILL.md` apply here; this file adds the create and adapt route and a static example. The example is a format reference; adjust ids, intent, paths and verifier to the approved plan.

## 1. Plan first

- Prepare a short proposed plan with the value-first contract: the result, trigger, inputs, output, criteria, destinations and external effects. Ask only for missing inputs that matter.
- One new user ok accepts that plan including setup. Do not install, write or run before it.
- Adapt: the plan names the exact existing Registry workflow and the requested changes. After the ok perform only that plan; never turn an adaptation into a wider redesign. Keep its origin, version, license and dependency pins in the local copy. An edited copy of a Registry workflow counts as a created workflow.
- If a run produces an SDD specification or reaches a human gate, show its exact scope and verifier and wait for the user's decision in their own terminal (`SKILL.md` section 12).

## 2. Reuse before creating

- Call `catalog` and `search` with general terms, then `get` the closest workflows and components at exact versions.
- Install and adapt an existing workflow when one fits (for example `sdd-pipeline` for an approved change to local files). Otherwise compose only supported kinds and exact component versions.
- Tell the user what you reuse and what is new.
- Read the SPEC with `schema` (SPEC-MANIFEST section 5 for core kinds, section 11 for Registry composition kinds: `workspace-read`, `specification`, `workspace-apply`, `verify-artifact`, `determined`, `parse-web`, `deduplicate`, `verify-sources`). Change only supported fields.

## 3. Required shape

- A workflow you create or adapt must include a human approval gate (`reviewer: human`, `bind: sha256`) before any step that writes files (`workspace-apply`) or sends data (any `api-request` except an exact `method: GET` to a literal http(s) URL). Q-Core 0.2.0-q-core.37 and later refuse it otherwise (`GATE_REQUIRED`) and refuse a `workspace-read` whose output nothing uses (`UNUSED_WORKSPACE_READ`).
- Do not design a workflow without a human gate to avoid the approval step. A scheduler may only invoke `q-core run`; each `workspace-apply` run still waits for a human decision.
- llm-call steps with `provider: cli` use the current agent session (caller route). Without `provider: cli` they go to OpenRouter (`SKILL.md` section 11).
- Caller route for a workflow that uses OpenRouter: adapt a copy. In every llm-call step replace `provider: openrouter`, `secretSource` and `keyRef` with `provider: cli` and an explicit `input` that passes only the step its instructions read (`input: "{{steps.<step id>.output}}"`), and set `settings.budgetUsd: null`. Prefer an existing `-cli` variant from the catalog when there is one.

## 4. Local files

`workspace-read` and `workspace-apply` need a local policy file `./.qfactory/policy.json`:

- `workspace`: absolute path of the project folder.
- `allowedPaths`: explicit visible files, at most 30, each at most 128000 bytes, all read files together under 60000 characters; no globs and no hidden folders such as `.qfactory`.
- `intent`: what the run must achieve.
- `verifier`: an absolute command plus at least one check file inside the workspace, in a visible folder, outside `allowedPaths`, written by you before the run exactly as approved; `timeoutMs` up to 300000.
- `maxRepairAttempts`: 0 to 5.

`workspace-apply` writes only after the human gate (`bind: sha256`) approved the specification step of that run.

## 5. Generate, validate, run

1. Write the manifest (`q-core.workflow/v1`, bounded steps, `settings.budgetUsd`) to `./.qfactory/<id>.yaml`, the policy to `./.qfactory/policy.json` and, for the caller route, `./.qfactory/provider.json`.
2. Check the format with the `validate` tool if you like, then always with the local Core: `./.qfactory/tools/node_modules/.bin/q-core validate ./.qfactory/<id>.yaml`. The hosted tool checks only the format; the local Core also applies the created-workflow policy.
3. Run one pass: `./.qfactory/tools/node_modules/.bin/q-core run ./.qfactory/<id>.yaml --caller-provider ./.qfactory/provider.json --workspace-policy ./.qfactory/policy.json --json`
4. Answer each pending inference job with `./.qfactory/tools/node_modules/.bin/q-core reply ./.qfactory/<id>.yaml <runId> ./.qfactory/reply.json --json`.
5. At the human gate follow `SKILL.md` section 12, end your turn, and after the user's decision check `q-core status`.
6. Report the verifier result, the output, remaining uncertainty and measured elapsed time. Show the diff and the evidence. Contributing the workflow back is optional and needs its own publication authorisation.

If a needed capability is missing (a step kind, unattended approval, an unsupported agent or scope), stop and tell the user exactly what is missing and what is possible now. Never produce the result with your own script or present a manifest that does not do the work.

## 6. Example (static)

A local-file workflow: read allowed files, write `summary.md`, check it with `checks/summary.check.mjs` written before the run.

`./.qfactory/policy.json`

```json
{
  "workspace": "/absolute/path/to/project",
  "allowedPaths": ["src/app.mjs", "summary.md"],
  "intent": "Write summary.md listing every TODO and FIXME in src/app.mjs as file:line.",
  "verifier": { "command": "/absolute/path/to/node", "args": ["checks/summary.check.mjs"], "timeoutMs": 30000 },
  "maxRepairAttempts": 1
}
```

`./.qfactory/provider.json` (`agent` is `claude` or `codex`)

```json
{ "kind": "caller", "agent": "claude", "model": "current-session", "payerScope": "local-cli" }
```

`./.qfactory/todo-summary.yaml`

```yaml
manifest: q-core.workflow/v1
id: todo-summary
version: 0.1.0
description: "Summarize TODO and FIXME comments into summary.md (origin: local, created in chat)"
triggers:
  - kind: schedule
    cron: "0 7 * * *"
settings:
  budgetUsd: null
steps:
  - id: workspace
    kind: workspace-read
  - id: brief
    kind: llm-call
    config: { provider: cli, format: json, input: "{{steps.workspace.output}}", instructions: "Return JSON {summary, criteria[], plan[]} for the intent." }
  - id: specification
    kind: specification
    config: { source: "{{steps.brief.output}}", workspace: "{{steps.workspace.output}}" }
  - id: approval
    kind: approval-gate
    config: { reviewer: human, bind: sha256, anchor: "Approve this specification" }
  - id: proposal
    kind: llm-call
    config: { provider: cli, format: json, input: "{{steps.specification.output}}", instructions: "Return JSON {files:[{path, content}]} for allowed paths only." }
  - id: apply
    kind: workspace-apply
    config: { source: "{{steps.proposal.output}}", approval: "{{steps.approval.output}}" }
  - id: verify
    kind: verify-artifact
    config: { source: "{{steps.apply.output}}" }
```

`./.qfactory/reply.json` for one pending job. `output.text` is the answer as a string; for `format: json` it is the JSON result serialised as a string. `jobId` and `hash` are copied from `pendingInference` after the checks in `SKILL.md` section 4.

```json
{ "jobId": "<pendingInference.jobId>", "hash": "<pendingInference.hash>", "output": { "text": "{\"files\":[{\"path\":\"summary.md\",\"content\":\"...\"}]}" } }
```

The run output of the waiting approval step carries `approvalHash`. This gate has `bind: sha256`, so the user's command includes ` --approval-hash <approvalHash>` (`SKILL.md` section 12).
