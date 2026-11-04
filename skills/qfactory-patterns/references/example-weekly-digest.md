# Example: "make the digest like last time"

Part of the `qfactory-patterns` skill. A worked example of turning a repeated request into steps, a gate and a "done" sheet. The names and numbers are illustrative.

## The request

"Make the weekly digest like last time and send it to the team channel."

What is missing: which sources "last time" used, how many items, what format, who checks it before it goes out. Each run so far was rebuilt from memory, so the lists differed and one week went out with a duplicate.

## Steps

| # | Step | Input | Output |
|--|--|--|--|
| 1 | Fetch | the list of feeds in `sources.txt` | items from the last 7 days |
| 2 | Deduplicate | items | items with unique source URLs |
| 3 | Summarise | items | one paragraph and one link per item |
| 4 | Gate | the draft digest | a human decision: approve or reject |
| 5 | Send | the approved digest | a post in the team channel |
| 6 | Check | the sent digest and the run record | pass or fail per criterion |

Inputs that change between runs: the date range. Everything else stays the same unless the workflow gets a new version.

## Gate

Before step 5, because sending is the first effect outside the machine. The person who approves sees the exact text that will be sent.

## "Done" sheet

- 5 to 15 items
- each item has one source link from `sources.txt`
- every source is from the last 7 days
- no repeated source URL
- the sent text is the text approved at the gate

## What stays open

- The wording of each paragraph varies between weeks; the sheet does not test style.
- The weekly start comes from cron or launchd on the machine; the workflow itself runs one pass.
- A week with fewer than 5 new items fails the check. That is a real result to report, not a reason to pad the list.

## As a QFactory workflow

The same structure maps onto a QFactory manifest: fetch and summarise steps, an approval gate before the send step, and a verifier for the "done" sheet. The `start` skill finds a matching workflow in the catalog or creates one with the user.
