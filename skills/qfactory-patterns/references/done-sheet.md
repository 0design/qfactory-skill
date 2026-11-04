# Writing a "done" sheet

Part of the `qfactory-patterns` skill. Reference knowledge on criteria that a check can answer with pass or fail.

## What makes a criterion checkable

- It names something observable in the output: a file, a field, a count, a format, a link.
- A script or a person can answer it with yes or no without asking the author what was meant.
- It is written before the run, so the run cannot shape its own test.
- It does not depend on the model's judgement of its own output.

## Examples

| Not checkable | Checkable |
|--|--|
| The digest is good | The digest has between 5 and 15 items |
| Covers the important news | Every item links to a source published in the last 7 days |
| Nicely formatted | Each item is a Markdown heading, one paragraph and one link |
| No duplicates, hopefully | No two items share the same source URL |
| Follows our rules | Every rule from `rules.md` is listed with pass or fail |
| Ready to send | A human approved this exact text at the gate before it was sent |

## Shape

A short list, one criterion per line, each with the way it is checked:

```
- 5 to 15 items                         -> count headings
- each item has one source link         -> parse links per item
- every source is from the last 7 days  -> compare dates with the run date
- no repeated source URL                -> compare URLs
- approved at the gate before sending   -> run status shows the approval
```

In a QFactory workflow these criteria become the verifier: a check that accepts or rejects the result of each run.

## Common gaps

- A criterion that only restates the task ("write the weekly report").
- No criterion for what must not happen (a send without approval, a file outside the allowed list).
- A check the run itself writes during the run.
- A pass on a run that is still waiting at a gate.
