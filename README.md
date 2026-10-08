# QFactory plugin 0.2.0

The plugin adds the skill `start` and connects the read-only QFactory catalog MCP at `https://qfactory.io/api/mcp/plugin`.

- The skill (`skills/start/SKILL.md` with `skills/start/references/create.md`) holds every behaviour rule. It is versioned with the plugin; nothing is downloaded to change it.
- The MCP server returns data only through five tools: `catalog`, `search`, `get`, `schema`, `validate`. It runs nothing, installs nothing and accepts no secrets.
- Workflows run only on the user's machine with Q-Core, after the user accepts a stated plan. Human approval gates are decided by the user in their own terminal.

## Invocation

Claude Code exposes the skill as `/qfactory:start`. Codex displays the plugin as QFactory; the exact mention spelling requires client verification, so do not advertise other aliases as working.

## MCP connection

Add the server for the current project by default (the client's project or local scope); use a global or user scope only when the user asks. The server needs no key, so no credential is part of the setup. If the MCP endpoint is unavailable, the skill reads the public Registry (`https://registry.qfactory.io/current.json` and the pinned release catalog) as data and checks its SHA-256.

## Data

| Recipient | What it receives | When |
|--|--|--|
| QFactory MCP (`qfactory.io`) | tool arguments: search text in general terms, catalog ids and versions, YAML passed to `validate` (not written to analytics) | each tool call |
| QFactory usage analytics | at connect: MCP client name and version; on every MCP event: protocol version and endpoint profile; per tool call: tool, success, result code, timing, for `get` the item type, id and version returned, Registry release, whether a pin was sent, for `search` the first 100 characters of the search text, the length of that fragment and the match count, for `catalog` the number of workflows and components, for the retired legacy tool its `mode` and `agent`; on every event: product, surface, host, country code, coarse client type, internal-traffic flag, time and a daily-rotating pseudonymous id (keyed hash of IP address and User-Agent; the IP itself is not sent). No other arguments, no YAML, no answers. Exact field lists: `skills/start/SKILL.md` section 15 | each MCP request |
| QFactory usage analytics (Registry) | one `registry_download` event: file type, path of a recognised Registry file, release, the Q-Core version of an archive, item type and id of a workflow, component or demo file, HTTP status, with the same base fields and pseudonymous id | each Registry download |
| QFactory Registry (`registry.qfactory.io`) | ordinary HTTPS downloads of the catalog, workflow files and the Q-Core archive | fallback reads and installation after the user's ok |
| OpenRouter | the content passed to each model step | only on the OpenRouter route, named in the plan before the ok |
| Destinations the user configures (`*_URL` values, bot tokens) | the workflow's output | only as named in the accepted plan |

The skill never sends conversation history, memory or secrets to QFactory. Of the project's files, it sends nothing except a workflow YAML the agent passes to `validate`; that YAML reaches the MCP but is not written to analytics. Files uploaded into the chat are not read into a workspace unless the user names them. Provider keys stay in the user's local keychain or shell.

## Install (Claude Code)

```
/plugin marketplace add 0design/qfactory-skill
/plugin install qfactory@qfactory
```

Then run `/qfactory:start` and describe your task. The plugin needs no account and no key.

To remove it: `/plugin uninstall qfactory@qfactory`, then `/plugin marketplace remove qfactory`.

## License

Code is MIT (`LICENSE`); the skill texts are CC BY 4.0, attribution "QFactory" (`LICENSE-CONTENT`).
