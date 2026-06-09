# Contributing

This repo is a Codex skill, not a scraper library.

The best contributions improve the skill's judgment: better workflows, clearer output contracts, sharper examples, and real case studies.

## Good Contributions

- Add a case study with endpoint templates, probe results, limits, and feasibility scoring.
- Improve `references/endpoint-discovery.md` with a repeatable public endpoint discovery tactic.
- Improve `references/probing.md` with safer, smaller probes.
- Improve `references/feasibility-scoring.md` with clearer scoring rules.
- Add copy-paste prompts to `PROMPTS.md`.
- Clarify compliance boundaries.

## Avoid

- Adding live scrapers for specific sites.
- Adding credentialed workflows.
- Adding CAPTCHA, fingerprint, auth bypass, paywall bypass, or rate-limit bypass instructions.
- Committing harvested datasets.
- Adding bulky generated outputs.

## Case Study Format

Use this structure:

```markdown
# Case Study: {Target}

## User Ask
...

## Discovery Path
...

## Public Sources
...

## EndpointPlan
...

## HeaderProfile
...

## Probe Notes
...

## Feasibility
...

## Why This Matters
...
```

## Review Bar

A good change should make a future Codex run more useful, more accurate, or safer with less context.

Keep `SKILL.md` short. Put details in `references/`.

