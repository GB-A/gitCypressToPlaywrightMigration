🎭 OpenMRS Playwright E2E Automation FrameworkA production-ready, highly modularized End-to-End (E2E) testing framework built with Playwright and TypeScript for the OpenMRS (Medical Record System) platform.This repository demonstrates modern QA engineering paradigms: it completely eliminates flaky workflows through synchronous, state-driven conditions, decouples test configuration from execution logic, and implements an isolated, multi-layered execution matrix.🏗️ Framework Architecture & DesignThe project enforces a strict Separation of Concerns (SoC) by utilizing Playwright's Page Object Model (POM) pattern. Test scripts remain purely declarative—focusing only on business behaviors and user actions—while structural element locators, state flows, and data variants are entirely abstracted into separate layout and data layers.  ├── playwright.config.ts           # Central orchestration engine, browser matrix & pipeline controls
└── playwright                     # Automation root directory
    ├── .auth/                     # Git-ignored localized directory storing session JSON states
    ├── fixtures/
    │   └── testData.ts            # Centralized dictionary for credentials, absolute URLs & patient payloads
    ├── pages/                     # Page Object Model Layer (Encapsulated DOM interactions)
    │   ├── LoginPage.ts           # Selectors and business workflows for authentication
    │   └── PatientPage.ts         # Selectors and business workflows for registration & search
    └── tests/                     # Executable Test Suite Layer
        ├── auth.setup.ts          # Global setup project executing pre-session authentication
        ├── auth/
        │   └── login.spec.ts      # Unauthenticated boundary checks for the login portal
        └── patient/
            ├── register.spec.ts   # Core functional checks for patient registration flows
            └── search.spec.ts     # Real-time search mechanisms and dashboard deep-linking
Key Design PillarsPage Object Model (POM): Prevents element selector duplication. Test files contain only user steps, while all page element locators and action methods are isolated inside their respective Page classes. If an application element changes, adjustments are restricted to a single file.  Decoupled Test Fixtures: Replaces fragile hardcoded inputs with centralized models within testData.ts, allowing multi-environment configurations to scale seamlessly. 
 🔑 Automated Session Storage (Global Authentication)Standard automated test suites log in via the UI before every single test case. In an enterprise application, this introduces massive execution overhead, creates unnecessary database load, and increases test fragility due to repetitive network requests.To solve this, this framework implements Playwright's native Storage State caching mechanism. Authentication is separated into an isolated pre-execution phase (auth.setup.ts), which logs in once, captures the browser's cookies and local storage states, and writes them to a temporary file (playwright/.auth/user.json).  Downstream functional test suites bypass the login UI entirely by injecting this state directly into their browser context initialization.  TypeScript// Core orchestration via playwright.config.ts
projects: [
  {
    name: 'setup',
    testMatch: 'playwright/tests/auth.setup.ts', // Executes the login sequence once
  },
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json', // Injects the authenticated state immediately
    },
    testMatch: 'playwright/tests/!(auth)/**/*.spec.ts',
    dependencies: ['setup'], // Guarantees that the setup project executes first
  }
]
How the Boundaries are Maintained:Authenticated Tests: Tests inside tests/patient/ inherit the pre-built user.json cache, allowing them to instantly access internal pages like registerPatient.page without hitting the login screen.  Unauthenticated Tests: Boundary checks inside tests/auth/login.spec.ts (e.g., wrong password, blank username) intentionally do not load the storage state. This ensures that the actual login interface can be thoroughly tested under clean-slate conditions.  ⚡ Parallelization & Execution MechanicsTo meet modern CI/CD pipeline requirements, the execution engine maximizes system throughput while preventing race conditions.fullyParallel: true: Configured at the global level. Playwright orchestrates execution by running test files—and individual test cases within those files—in completely isolated worker processes.  Worker Optimization: By defaulting workers to process.env.CI ? 1 : undefined, the framework scales dynamically based on hardware limits. Locally, it utilizes all available CPU cores to execute threads concurrently. In constrained CI pipelines, it dials workers back to a single worker to prevent CPU choking and context-switching timeouts.  Isolating State Overlaps: Because our test patient payload (testPatient) uses a static name entry (Playwright TestUser), multiple concurrent registration runs could normally create name collusions in a shared database. The suite handles this through smart sequencing or environment boundaries, ensuring that search evaluation metrics (expectedEntries) remain deterministic.  📐 Robust Automation Strategies (Flake Prevention)The framework relies heavily on an abstraction barrier between the underlying DOM structure and the test validation assertions.  Modern Locator StrategyWe avoid brittle CSS/XPath absolute strings (e.g., /html/body/div[2]/form/input) that shatter upon minor visual revisions. Instead, our locators utilize user-accessible attributes via Playwright's semantic engine:TypeScript// Extracted from playwright/pages/LoginPage.ts
constructor(page: Page) {
  this.page = page;
  this.usernameInput = page.getByLabel('Username'); // Matches accessible text associations
  this.passwordInput = page.getByLabel('Password');
  this.loginButton    = page.getByRole('button', { name: 'Log In' });
}
Eliminating Brittle WaitsHardcoded timeouts such as await page.waitForTimeout(5000) are strictly banned in this codebase. Instead, the Page Object Model utilizes intelligent, event-driven condition synchronization:  URL Match Tracking: await this.page.waitForURL(/home/) blocks subsequent actions until the server completes its redirection loop.  Dynamic Content Re-evaluation: Elements like search boxes listen to complex application keyboard event-handlers (like keyup or keydown). The framework uses pressSequentially(name, { delay: 50 }) to closely mimic real human data entry, forcing the application's underlying JavaScript engine to process layout filtration rules reliably.  🚀 Execution & Operational Playbook1. Framework DeploymentEnsure Node.js (v18+) is present on your execution node, then run:Bash# Install framework dependencies
npm install

# Provision specialized Playwright headless browser engines
npx playwright install --with-deps
2. Runtime Execution CommandsTarget CommandPractical Contextnpx playwright testExecutes the complete test matrix across all browser projects sequentially.npx playwright test --project=chromiumRuns only the Chrome/Chromium environment.npx playwright test playwright/tests/patient/search.spec.tsIsolates verification to a single test suite file.npx playwright test --uiLaunches the interactive, visual debugging panel for deep-dive tracking.3. Reviewing Automated ArtifactsIf an action fails during a run, Playwright records a detailed context evaluation capture based on our tracking configurations:  Screenshots: Captured instantly upon an evaluation crash (only-on-failure).  Trace Timelines: Generates full zip execution traces on retry attempts (on-first-retry).  To display the built-in interactive execution dashboard, use:Bashnpx playwright show-report