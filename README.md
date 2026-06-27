# 🎭 Playwright 🔷 TypeScript ⚡ E2E Automation 🏥 OpenMRS

# 🎭 From Cypress to Playwright: A Real-World Automation Story 🎭 
Our original Cypress suite executed tests within a sandboxed <iframe>, where it ran into a hard security blocker on the OpenMRS platform.

While the login page loads securely over HTTPS, the legacy HTML <form> action targets an unencrypted HTTP URL, triggering a browser-enforced Mixed Content Block.

To bypass this in Cypress, we were forced to artificially lower browser security flags (--allow-running-insecure-content), masking a critical flaw that leaves the site completely broken for real-world users.

Migrating to Playwright eliminated the restrictive iframe sandbox entirely, allowing us to control the browser engines externally via native, low-level debugging protocols.

Playwright’s out-of-process architecture hooks directly into the frame lifecycle, safely executing the authentication matrix and validating genuine user behavior without compromising testing security.

## OpenMRS Playwright E2E Automation Framework

A production-ready, highly modularized end-to-end testing framework built with Playwright and TypeScript for the OpenMRS Medical Record System. Eliminates flaky workflows through synchronous, state-driven conditions, decoupled configuration, and an isolated multi-layered execution matrix.

---

## 🏗️ Architecture & Design

The project enforces a strict separation of concerns via Playwright's Page Object Model. Test scripts remain purely declarative — focusing only on business behaviors — while structural locators, state flows, and data variants are entirely abstracted into separate layers.

```
├── playwright.config.ts         # Central orchestration engine & browser matrix
└── playwright/
    ├── .auth/                     # Git-ignored session JSON state cache
    ├── fixtures/
    │   └── testData.ts            # Credentials, URLs & patient payloads
    ├── pages/                     # Page Object Model layer
    │   ├── LoginPage.ts           # Selectors & auth workflows
    │   └── PatientPage.ts         # Registration & search workflows
    └── tests/
        ├── auth.setup.ts          # Global pre-session authentication
        ├── auth/
        │   └── login.spec.ts      # Unauthenticated boundary checks
        └── patient/
            ├── register.spec.ts   # Patient registration flows
            └── search.spec.ts     # Search mechanisms & dashboard linking
```

---

## 🔑 Design Pillars

| Pillar | Description |
|---|---|
| 📐 Page Object Model | Element selectors live in Page classes only. Test files contain user steps, never DOM queries. One-file changes when the UI shifts. |
| 🗄️ Decoupled fixtures | Centralized `testData.ts` replaces fragile hardcoded inputs. Multi-environment configs scale without touching test logic. |
| 🍪 Session caching | Auth runs once, stores cookies and local storage state. Downstream suites inject the state directly — zero login overhead. |
| ⚙️ Parallel execution | Workers auto-scale to CPU cores locally; dials back to 1 in CI to prevent context-switching timeouts. |

---

## 🔐 Automated Session Storage

Standard suites log in via the UI before every test — introducing overhead, database load, and network fragility. This framework separates auth into an isolated pre-execution phase that runs once and caches the browser state.

- `auth.setup.ts` runs
- → Login UI executed once
- → Cookies + localStorage saved to `.auth/user.json`
- → All patient tests inject state directly

```ts
// playwright.config.ts — orchestration via storage state injection
projects: [
  {
    name: 'setup',
    testMatch: 'playwright/tests/auth.setup.ts',
  },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json', // injects authenticated state
    },
    testMatch: 'playwright/tests/!(auth)/**/*.spec.ts',
    dependencies: ['setup'], // guarantees setup runs first
  }
]
```

> **Note:** Tests in `tests/auth/login.spec.ts` intentionally omit the storage state, ensuring the login interface is tested thoroughly under clean-slate conditions.

---

## 🛡️ Flake Prevention

### Semantic Locators

Brittle CSS/XPath absolute strings are avoided entirely. Locators use user-accessible attributes via Playwright's semantic engine — they survive visual revisions without requiring updates.

```ts
// playwright/pages/LoginPage.ts
constructor(page: Page) {
  this.page = page;
  this.usernameInput = page.getByLabel('Username');  // accessible text association
  this.passwordInput = page.getByLabel('Password');
  this.loginButton   = page.getByRole('button', { name: 'Log In' });
}
```

### Event-Driven Synchronization

Hardcoded `waitForTimeout` calls are strictly banned. The framework uses intelligent condition synchronization instead.

### 🔗 URL Match Tracking

`waitForURL(/home/)` blocks until the server completes its redirection loop — no guessing on timing.

### ⌨️ Human-Like Input

`pressSequentially(name, { delay: 50 })` mimics real keystrokes, forcing JS event handlers to process reliably.

---

## 🚀 Execution Playbook

### Setup

```bash
# Install framework dependencies
npm install
```

```bash
# Provision Playwright headless browser engines
npx playwright install --with-deps
```

### Runtime Commands

| Command | Context |
|---|---|
| `npx playwright test` | Runs the complete test matrix across all browser projects |
| `npx playwright test --project=chromium` | Targets only the Chrome/Chromium environment |
| `npx playwright test playwright/tests/patient/search.spec.ts` | Isolates verification to a single suite file |
| `npx playwright test --ui` | Launches the interactive visual debugging panel |

### Failure Artifacts

#### 📸 Screenshots
Captured instantly on evaluation crash (`only-on-failure`)

#### 📊 Trace Timelines
Full zip execution traces generated on retry (`on-first-retry`)

```bash
# Open the interactive execution report
npx playwright show-report
```

---

*OpenMRS Playwright E2E Automation Framework · Built with Playwright & TypeScript*
