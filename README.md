# QA Automation Engineer Challenge

Welcome to the QA Automation Engineer Challenge! This repository contains a simple Inventory Management System that you'll use to demonstrate your test automation skills using Playwright and TypeScript.

## 🎯 Challenge Overview

Your task is to create a comprehensive end-to-end test automation suite for this Inventory Management System. The application includes authentication, product management, and inventory tracking features.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Basic knowledge of TypeScript and Playwright

## 🚀 Getting Started

1. **Fork this repository** to your GitHub account

2. **Clone your forked repository**:
```bash
git clone https://github.com/YOUR_USERNAME/qa-automation-challenge.git
cd qa-automation-challenge
```

3. **Install dependencies**:
```bash
npm install
```

4. **Install Playwright browsers**:
```bash
npx playwright install
```

5. **Start the application**:
```bash
npm run dev
```

6. **Run the example test**:
```bash
npm test
```

## 🏗️ Application Features

### Authentication
- Login page with email/password validation
- Session management
- Protected routes
- Test accounts provided (see below)

### Product Management
- View all products
- Add new products
- Edit existing products
- Delete products
- Search and filter products
- Sort by name, price, or stock

### Inventory Management
- View current stock levels
- Adjust stock quantities (increase/decrease)
- Low stock alerts
- Stock status indicators

### Test Accounts
- Admin User: `admin@test.com` / `Admin123!`
- Regular User: `user@test.com` / `User123!`

## 📝 Challenge Tasks

### Level 1: Basic (Required)

1. **Complete the LoginPage Page Object Model**
   - Implement the missing methods in `pages/login.page.ts`
   - Add proper waits and error handling

2. **Create authentication tests**
   - Valid login scenarios
   - Invalid login scenarios (wrong email, wrong password, empty fields)
   - Password visibility toggle
   - Logout functionality

3. **Create product management tests**
   - Add a new product with valid data
   - Validate form field requirements
   - Test validation errors (negative price, empty required fields)
   - Search for products
   - Delete a product with confirmation

### Level 2: Intermediate (Recommended)

4. **Implement additional Page Object Models**
   - Create `ProductsPage` class
   - Create `InventoryPage` class
   - Create `DashboardPage` class

5. **Create inventory tests**
   - Adjust stock levels (increase/decrease)
   - Validate stock cannot go below zero
   - Verify low stock alerts appear correctly
   - Test bulk operations

6. **Implement data-driven testing**
   - Use the test data from `data/test-products.json`
   - Create parameterized tests for multiple scenarios
   - Implement test data factories

7. **Add custom fixtures**
   - Create authentication fixture for logged-in state
   - Create product setup/teardown fixtures

### Level 3: Advanced (Bonus)

8. **Create end-to-end user journeys**
   - Complete product lifecycle (create → edit → adjust stock → delete)
   - Multi-user scenarios
   - Complex filtering and sorting combinations

9. **Implement advanced testing patterns**
   - API integration for test data setup
   - Custom test reporters
   - Visual regression testing
   - Performance metrics collection

10. **CI/CD Integration**
    - Create GitHub Actions workflow
    - Implement parallel test execution
    - Add test reporting artifacts

## 📁 Project Structure

```
qa-automation-challenge/
├── app/                   # Next.js application
│   ├── login/            # Login page
│   ├── dashboard/        # Dashboard page
│   ├── products/         # Product management
│   ├── inventory/        # Inventory management
│   └── lib/             # Utility functions
├── pages/               # Page Object Models
│   └── login.page.ts    # Partially implemented - complete this
├── tests/               # Test specifications
│   ├── example.spec.ts  # Example test (working)
│   └── challenges/      # Your tests go here
├── fixtures/            # Test fixtures (create your own)
├── data/               # Test data
│   └── test-products.json
└── playwright.config.ts # Playwright configuration
```

## ✅ Evaluation Criteria

Your submission will be evaluated based on:

### Code Quality (30%)
- Clean, readable code
- Proper TypeScript usage
- Following naming conventions
- DRY principles

### Test Coverage (25%)
- Comprehensive test scenarios
- Edge cases and negative testing
- Appropriate assertions

### Framework Design (25%)
- Well-structured Page Object Models
- Reusable components and helpers
- Proper use of fixtures
- Efficient selectors

### Best Practices (20%)
- Proper waits and synchronization
- Error handling
- Test independence
- Documentation and comments

### Bonus Points
- Innovation and creativity
- Performance optimizations
- Additional testing types (visual, performance, accessibility)
- CI/CD implementation

## 📤 Submission Guidelines

1. Complete the challenge tasks in your forked repository
2. Create a new branch called `solution`
3. Commit your changes with clear, descriptive messages
4. Push your solution branch to GitHub
5. Create a Pull Request from `solution` to `main` in your fork
6. Add a `SOLUTION.md` file describing:
   - Your approach and decisions
   - Any assumptions made
   - Instructions to run your tests
   - Challenges faced and how you solved them
   - Ideas for improvements

## 🔍 Tips for Success

1. Start with the example test to understand the application
2. Focus on code quality over quantity
3. Write clear test descriptions
4. Handle both happy path and error scenarios
5. Make tests independent and repeatable
6. Use data-testid attributes provided in the application
7. Comment complex logic
8. Consider test execution time

## 🤔 Common Pitfalls to Avoid

- Hardcoding values instead of using test data
- Not handling loading states
- Ignoring test flakiness
- Overly complex selectors
- Missing error scenarios
- Tests that depend on other tests

## 📚 Useful Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

## ❓ Questions?

If you have any questions about the challenge or encounter technical issues with the application, please create an issue in the original repository.

Good luck! We're excited to see your solution! 🚀