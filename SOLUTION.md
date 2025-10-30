# Solution Overview

## Folder structure (high-level)

```text
portrait-qa-automation-test/
├── fixtures/                           # Reusable setup helpers (auth, product seeding/teardown)
│   ├── auth.ts                         # Logs in before each test needing authentication
│   └── products.ts                     # Creates products per test and auto-deletes after
├── page-objects/                       # Encapsulated UI interactions/selectors (POM)
│   ├── dashboardPage.ts                # Dashboard page object
│   ├── helperBase.ts                   # Base utilities shared by page objects
│   ├── inventoryPage.ts                # Inventory page object
│   ├── loginPage.ts                    # Login page object
│   ├── navigationBar.ts                # Top navigation bar component object
│   ├── navigationPage.ts               # Simple navigation helpers (routes)
│   ├── pageManager.ts                  # Page Manager (returns POMs bound to the same page)
│   └── productsPage.ts                 # Products page object
├── tests/                              # Spec files organized by feature
│   ├── authentication.spec.ts          # Authentication scenarios
│   ├── inventory.spec.ts               # Inventory scenarios
│   └── product.spec.ts                 # Product scenarios
├── data/                               # Static test data inputs
│   └── test-products.json              # Sample product dataset
├── playwright.config.ts                # Playwright settings (projects, server, retries, traces)
├── .github/
│   └── workflows/
│       └── ci.yml                      # GitHub Actions pipeline to run tests and upload artifacts
├── README.md                           # Challenge brief and instructions
└── SOLUTION.md                         # This document: approach and how-to
```

## Testing approach and framework decisions

- Playwright + TypeScript
  - Page Object Model to encapsulate UI interactions and selectors, improving reusability and maintainability.
  - Custom fixtures to standardize environment setup:
    - fixtures/auth.ts: logs in before each test needing authentication.
    - fixtures/products.ts: creates products and auto-cleans them up after each test.
  - Tests organized by feature (Authentication, Products, Inventory) with clear `test.step` blocks for readability and diagnostics.
  - Assertions include messages to speed up failure triage.

- Deterministic setup/teardown
  - Every test seeds its own data (product creation via fixture) and does not depend on other tests.
  - The inventory tests reuse the product fixture for setup and avoid cross-file coupling.

- CI ready
  - GitHub Actions workflow installs browsers, runs tests, and uploads reports/artifacts.

## Assumptions about application behavior

- Auth
  - Admin credentials are valid via PW_ADMIN_EMAIL/PW_ADMIN_PASSWORD.
  - Authenticated state is required to access dashboard, products, and inventory.

- Products
  - SKU must be unique.
  - Required fields and validation messages are rendered in the product form.
  - Sorting by name moves lexicographically higher values accordingly.

- Inventory
  - Adjusting stock updates the stock value in list views.
  - Low-stock indicators appear when stock < threshold and disappear when above.

## How to run the test suite

- Local
  - npm install
  - npx playwright install
  - npm run dev (in a separate terminal)
  - npx playwright test

- With environment variables
  - PW_ADMIN_EMAIL=admin@test.com PW_ADMIN_PASSWORD=Admin123! npx playwright test

- HTML report
  - npx playwright show-report

## Coverage strategy and prioritization

- Authentication (happy + unhappy paths)
  - Valid login, session persistence, logout access control.
  - Invalid credentials and native form validations.

- Products
  - CRUD happy paths (create, delete) and validation (required, negative values).
  - Business rules: duplicate SKU prevention, search, and sorting.

- Inventory
  - Stock adjustment, low-stock indicators, and thresholds.

- Cross-cutting
  - Robust selectors via data-testid.
  - Explicit waits for URL/visibility to reduce flakiness.

## Challenges and solutions

- Merge conflicts in inventory specs
  - Resolved by unifying on `test.step` blocks and `fillProductForm` for clarity and DRYness.

- Session reuse vs. fixtures
  - Replaced storageState reuse with an authentication fixture to make tests portable and consistent across environments.

- Data coupling across tests
  - Introduced products fixture with auto-teardown so each test owns its data lifecycle.

- CI sharding and test dependencies
  - Discovered cross-shard dependencies; removed sharding in CI until all tests are fully independent.

## Suggestions for future test improvements

- Make all tests shard-safe
  - Audit remaining implicit dependencies; enforce seed/reset per test.

- Add API-layer data setup
  - Prefer direct API seeding for speed and reduced UI flakiness when available.

- Performance and reliability
  - Add budgets and lightweight perf checks (TTFB, action timings) with alerts in CI.
  - Introduce visual regression or component-level checks where helpful.

- Scalability
  - Re-enable sharding and CI matrix across OSes once independence is guaranteed.
  - Add parallel project-level runs selectively (e.g., Chromium only for smoke).

- Reporting
  - Publish Playwright HTML report via GitHub Pages job for easier sharing.
