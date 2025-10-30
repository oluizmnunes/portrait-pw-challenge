# Solution Overview

## Folder structure (high-level)

```text
portrait-qa-automation-test/
├── fixtures/                           
│   ├── auth.ts                         # Authentication fixture for logged-in state
│   └── products.ts                     # Creates products per test and auto-deletes
├── page-objects/                       # Encapsulated UI interactions/selectors (POM)
│   ├── dashboardPage.ts                # Dashboard
│   ├── helperBase.ts                   # Base utilities
│   ├── inventoryPage.ts                # Inventory
│   ├── loginPage.ts                    # Login
│   ├── navigationBar.ts                # Top navigation bar component object
│   ├── navigationPage.ts               # Simple navigation helpers (routes)
│   ├── pageManager.ts                  # Page Manager - instantiate all pages at once
│   └── productsPage.ts                 # Products 
├── tests/                              
│   ├── authentication.spec.ts          # Authentication scenarios
│   ├── inventory.spec.ts               # Inventory scenarios
│   └── product.spec.ts                 # Product scenarios
├── data/                               
│   └── test-products.json              # Sample product dataset
├── playwright.config.ts                # Playwright settings
├── .github/
│   └── workflows/
│       └── ci.yml                      # Pipeline to run tests
├── README.md                           # Challenge brief and instructions
└── SOLUTION.md                         # This document: approach and how-to
```

## Testing approach and framework decisions

- PageManager and Navigation pattern (with POM)
  - **Improved test readability**: Tests read like plain English with `pm.navigateTo().inventoryPage()` instead of raw `page.goto('/inventory')`. It's like code as documentation where test intent immediately clear.
  - **Centralized navigation logic**: All route management lives in `navigationPage.ts`. If URLs change, update one place instead of hunting through dozens of tests.
  - **Consistent page object access**: `pageManager.onProductsPage()` returns the same instance bound to the current `page`, preventing selector drift and ensuring tests always interact with the correct page context.
  - **Simplified Page Access**: No need to `new AnyPage(page)` everywhere.
  - **Better maintainability**: When page object constructors change (e.g., new dependencies), only the manager needs updates. Tests remain unchanged.
  - **Test isolation**: Each test gets a fresh manager instance, preventing shared state that could cause flaky tests.

- Custom fixtures to standardize environment setup:
    - fixtures/auth.ts: logs in before each test needing authentication.
    - fixtures/products.ts: creates products and auto-cleans them up after each test.
  - Tests organized by feature (Authentication, Products, Inventory) with clear `test.step` blocks for readability and diagnostics.
  - Assertions include messages to speed up failure triage.

- Deterministic setup/teardown (WIP)
  - Every test seeds its own data (product creation via fixture) and does not depend on other tests.
  - The inventory tests reuse the product fixture for setup and avoid cross-file coupling.

- CI ready
  - GitHub Actions workflow installs browsers, runs tests, and uploads reports/artifacts.

## Assumptions about application behavior

- Products
  - SKU must be unique.
  - Required fields and validation messages are rendered in the product form.
  - Sorting by name puts A before Z.

- Inventory
  - Adjusting stock updates the stock value in list views.
  - Low-stock indicators appear when stock < threshold and disappear when above.

## How to run the test suite

```
git clone https://github.com/oluizmnunes/portrait-pw-challenge.git
cd portrait-pw-challenge
npm install
npx playwright install
npm run dev (in a separate terminal)
npx playwright test (or npm test)
```

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

- Refine GitHub Actions flow.
- Make all tests shard-safe, check for remaining implicit dependencies.
- Implement product setup/teardown.
- API integration for test data setup.
- Performance and reliability
  - Implement performance checks within our CI pipeline. This involves setting budgets (maximum allowed limits) for key metrics.
  - Introduce visual regression or component-level checks where helpful.
- Scalability
  - Review current POM model. Eager initialization (create page objects when the manager is created) is usually better than lazy (current).
- Reporting
  - Create report artifacts.
