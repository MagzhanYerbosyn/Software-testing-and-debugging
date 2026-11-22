## CI

[![Playwright Tests](https://github.com/MagzhanYerbosyn/Software-testing-and-debugging/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/MagzhanYerbosyn/Software-testing-and-debugging/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. It is built into GitHub, where the repository already lives, needs no server of its own, is free for public repositories and supports job matrices for sharding.

**Pipeline** (`.github/workflows/playwright.yml` in the repository root; the Playwright project lives in `sis2/`, so every step runs with `working-directory: sis2`):

- runs on every push and every pull request;
- `npm ci` with the npm cache (on `sis2/package-lock.json`), Chromium installed with system dependencies (`npx playwright install --with-deps chromium`);
- the full Playwright suite split into 4 shards (`--shard=i/4`) running in parallel;
- the `merge-reports` job merges the shards' blob reports into one HTML report and one JUnit file;
- artefacts: `playwright-report` (merged HTML), `test-results-1..4` (traces, screenshots, videos, JUnit per shard), `junit-report` (merged JUnit); kept for 14 days. Uploaded even when tests fail (`if: ${{ !cancelled() }}`).
- credentials come from repository secrets (`CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `CUSTOMER2_*`, `CUSTOMER3_*`), never from the code.

**CI settings** (`sis2/playwright.config.ts`, active when `CI=true`): `forbidOnly: true`, `retries: 2`, `workers: 2`, `fullyParallel: true`, reporters `list` + `blob` + `junit`, `trace: 'on-first-retry'`, screenshots and video on failure.

### Runtime

| Configuration      | Total run time | Run tests step (slowest shard) | Run                                                                                               |
| ------------------ | -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1 job, no sharding | 1m 5s          | 12s                            | [#9](https://github.com/MagzhanYerbosyn/Software-testing-and-debugging/actions/runs/45036400954)  |
| 4 shards + merge   | 1m 18s         | 8s                             | [#10](https://github.com/MagzhanYerbosyn/Software-testing-and-debugging/actions/runs/45036784963) |

Per-shard test step in run #10: 8s / 5s / 5s / 5s (7 tests split 2 / 2 / 2 / 1).

**Conclusion:** sharding cut the test step from 12s to 8s (about 33% faster), but the total run became 13s longer. The suite has only 7 tests (~11s), while every shard repeats about 25–40s of setup (checkout, `npm ci`, browser install alone is 18–28s) and the merge job adds another 12–22s. For a suite this small the fixed overhead dominates; sharding pays off once the tests themselves take several minutes.

### Known issue: Cloudflare bot protection

The tests target the public demo site practicesoftwaretesting.com, which is behind Cloudflare bot protection. GitHub-hosted runners use data-center IP addresses and were sometimes shown a "Performing security verification / Verify you are human" page instead of the site, so the login test timed out (diagnosed from the failure screenshot and trace in the `test-results` artefact). The login test was reloading the page with an extra `page.goto('/auth/login')`; removing that redundant full-page load fixed it. A complete solution would be running the application itself in CI (e.g. in Docker) instead of testing a third-party site.

### Running locally

```bash
cd sis2
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test
```

Credentials are read from `sis2/.env` (see `.env.example`).
