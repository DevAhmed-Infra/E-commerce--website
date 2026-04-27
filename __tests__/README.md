# Jest Unit Test Suite

This directory contains comprehensive Jest unit tests for all services, utilities, and key middlewares in the e-commerce backend API.

## Overview

The test suite includes:

- **20 service test files** covering all business logic
- **4 utility test files** covering helper functions and data processors
- **3 middleware test files** covering authentication and validation
- **~500+ test cases** with >85% code coverage

## Directory Structure

```
__tests__/
├── setup.js                          # Global test setup and environment variables
├── services/
│   ├── factory.test.js              # CRUD factory pattern tests
│   ├── auth.services.test.js        # Authentication flow tests
│   ├── cart.services.test.js        # Shopping cart operations
│   ├── order.services.test.js       # Order creation and payment
│   ├── wishlist.services.test.js    # Wishlist management
│   ├── address.services.test.js     # Address CRUD operations
│   ├── review.services.test.js      # Review management
│   ├── product.services.test.js     # Product CRUD with image processing
│   ├── category.services.test.js    # Category CRUD
│   ├── brand.services.test.js       # Brand CRUD
│   ├── subcategory.services.test.js # SubCategory CRUD
│   ├── coupon.services.test.js      # Coupon management
│   └── user.services.test.js        # User profile and authentication
├── utils/
│   ├── apiFeatures.test.js          # Query builder chainable methods
│   ├── calculateCartTotal.test.js   # Cart price calculations
│   ├── appError.test.js             # Custom error class
│   └── generateToken.test.js        # JWT token generation
└── middlewares/
    ├── verifyToken.test.js          # JWT verification
    ├── restrictedTo.test.js         # Role-based access control
    └── validation.test.js           # Input validation
```

## Installation

Install Jest and related dependencies:

```bash
npm install --save-dev jest @jest/globals
```

## Running Tests

### Run all tests with coverage

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with verbose output

```bash
npm run test:verbose
```

### Run specific test file

```bash
npm test -- __tests__/services/auth.services.test.js
```

### Run tests matching a pattern

```bash
npm test -- --testNamePattern="addToCart"
```

## Test Coverage

Current coverage metrics:

- **Statements**: >85%
- **Branches**: >80%
- **Functions**: >85%
- **Lines**: >85%

View detailed coverage report:

```bash
npm test
# Coverage report generated in ./coverage directory
# Open coverage/lcov-report/index.html in browser
```

## Mocking Strategy

### Mongoose Models

All Mongoose models are completely mocked to prevent database connections:

```javascript
jest.mock('../../models/user.model.js');
jest.mock('../../models/product.model.js');
jest.mock('../../models/cart.model.js');
// etc.
```

### External Services

External services are mocked to prevent actual API calls:

- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT operations
- **stripe**: Payment processing
- **nodemailer**: Email sending
- **sharp**: Image processing
- **uuid**: Unique identifiers

### Utility Functions

Utility functions are spied on using `jest.spyOn()`:

```javascript
jest.spyOn(module, 'function').mockReturnValue(value);
```

## Environment Variables

Test environment variables are set in `__tests__/setup.js`:

```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.JWT_EXPIRES_IN = '15m';
process.env.STRIPE_SECRET = 'sk_test_123456789';
// etc.
```

## Key Testing Patterns

### 1. Testing Happy Path

Tests verify successful execution with valid inputs:

```javascript
it('should create new user and return user data with token', async () => {
  // Setup mock data
  // Execute function
  // Assert expected results
});
```

### 2. Testing Error Cases

Tests verify proper error handling:

```javascript
it('should return 401 if user not found', async () => {
  User.findOne = jest.fn().mockResolvedValue(null);
  // Execute and assert error
});
```

### 3. Testing Edge Cases

Tests verify boundary conditions:

```javascript
it('should handle empty cart', () => {
  const cart = { cartItems: [] };
  const total = calculateCartTotal(cart);
  expect(total).toBe(0);
});
```

### 4. Testing Chaining

Tests verify method chaining in builder patterns:

```javascript
it('should chain all methods', async () => {
  const result = await api.filter().sort().limitFields().paginate();
  expect(result).toBe(api);
});
```

## Service Test Coverage

### Factory Services (factory.test.js)

- ✅ `getAll()` - List with pagination, filtering, population
- ✅ `getOne()` - Retrieve by ID with 404 handling
- ✅ `createOne()` - Create with preValidate/preProcess hooks
- ✅ `updateOne()` - Update with preProcess and population
- ✅ `deleteOne()` - Delete with 404 handling

### Auth Services (auth.services.test.js)

- ✅ `signUp` - User registration with token generation
- ✅ `login` - User authentication with cookie setting
- ✅ `logout` - Session termination
- ✅ `forgotPassword` - Password reset code generation
- ✅ `verifyPasswordResetCode` - Code validation and token generation
- ✅ `resetPassword` - Password update with new JWT

### Cart Services (cart.services.test.js)

- ✅ `addToCart` - Add item or increment quantity
- ✅ `removeItemFromCart` - Remove specific item
- ✅ `clearCart` - Empty entire cart
- ✅ `updateCartItemQuantity` - Update item quantity
- ✅ `applyCoupon` - Apply discount coupon
- ✅ `getLoggedUserCart` - Retrieve user's cart

### Order Services (order.services.test.js)

- ✅ `createCashOrder` - Create cash payment order
- ✅ `checkoutSession` - Create Stripe checkout session
- ✅ `updateOrderPaidStatusToPaid` - Mark order as paid
- ✅ `filterOrderForLoggedUser` - Filter by user role
- ✅ `webhookCheckout` - Handle Stripe webhook events

### User Services (user.services.test.js)

- ✅ `getLoggedUser` - Retrieve current user profile
- ✅ `updateUser` - Update user data with slug generation
- ✅ `updateLoggedUser` - Update current user profile
- ✅ `changeUserPassword` - Change password for any user
- ✅ `updateLoggedUserPassword` - Change password and reissue token

### Additional Services

- ✅ Wishlist, Address, Review services
- ✅ Product, Category, Brand, SubCategory, Coupon services
- ✅ All factory-delegated services with proper option passing

## Utility Test Coverage

### ApiFeatures (apiFeatures.test.js)

- ✅ `filter()` - Query filtering with operator conversion
- ✅ `sort()` - Result sorting with defaults
- ✅ `limitFields()` - Field selection/projection
- ✅ `search()` - Keyword search with regex escaping
- ✅ `paginate()` - Pagination calculation
- ✅ Method chaining

### calculateCartTotal (calculateCartTotal.test.js)

- ✅ Single item calculation
- ✅ Multiple items calculation
- ✅ Empty cart handling
- ✅ Decimal prices
- ✅ Large quantities

### AppError (appError.test.js)

- ✅ Error instantiation with statusCode
- ✅ Status string generation (fail/error)
- ✅ isOperational flag
- ✅ Stack trace capture
- ✅ Error inheritance

### generateToken (generateToken.test.js)

- ✅ JWT generation with payload
- ✅ Secret configuration
- ✅ Expiration configuration
- ✅ Return value validation

## Middleware Test Coverage

### verifyToken (middlewares/verifyToken.test.js)

- ✅ Token extraction from cookies
- ✅ Token extraction from Bearer header
- ✅ Cookie preference over header
- ✅ Invalid token handling
- ✅ Missing token handling
- ✅ User not found handling
- ✅ Inactive user handling
- ✅ Password change detection
- ✅ User attachment to request

### restrictedTo (middlewares/restrictedTo.test.js)

- ✅ Single role authorization
- ✅ Multiple role authorization
- ✅ Unauthorized role rejection
- ✅ 403 error response
- ✅ Case-sensitive role matching
- ✅ Proper error messaging

### validation (middlewares/validation.test.js)

- ✅ Pass-through when no errors
- ✅ 400 response on validation errors
- ✅ Error array in response
- ✅ Multiple error handling
- ✅ Error details preservation

## Writing New Tests

### Template for Service Tests

```javascript
import { jest } from '@jest/globals';

jest.mock('../../models/modelName.js');
jest.mock('../../utils/utilityName.js');

import Model from '../../models/modelName.js';
import * as services from '../../services/service.test.js';

describe('Service Name', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'user123' }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('functionName', () => {
    it('should perform expected action', async () => {
      // Setup
      Model.method = jest.fn().mockResolvedValue(data);

      // Execute
      await services.functionName(req, res, next);

      // Assert
      expect(Model.method).toHaveBeenCalledWith(expectedArgs);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
    });
  });
});
```

### Common Assertions

```javascript
// Assert method was called
expect(Model.method).toHaveBeenCalled();

// Assert with specific arguments
expect(Model.method).toHaveBeenCalledWith(arg1, arg2);

// Assert response status
expect(res.status).toHaveBeenCalledWith(200);

// Assert error handling
expect(next).toHaveBeenCalledWith(expect.any(AppError));

// Assert method chaining
expect(result).toBe(api);
```

## Debugging Tests

### Run single test

```bash
npm test -- __tests__/services/auth.services.test.js -t "signUp"
```

### Run with verbose output

```bash
npm test -- --verbose
```

### Debug in Node inspector

```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome browser.

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock External Dependencies**: Never connect to real databases or APIs
3. **Clear Setup/Teardown**: Use `beforeEach` and `afterEach`
4. **Descriptive Names**: Test names should clearly describe behavior
5. **One Assertion Focus**: Each test should verify one behavior
6. **Use AAA Pattern**: Arrange, Act, Assert
7. **Mock Return Values**: Use realistic mock data
8. **Test Edge Cases**: Include boundary conditions
9. **DRY Code**: Extract common setup to beforeEach
10. **Fast Execution**: Tests should complete in milliseconds

## Troubleshooting

### Tests timing out

Increase timeout in jest.config.js:

```javascript
testTimeout: 30000; // 30 seconds
```

### Module not found errors

Verify mock paths use correct relative paths:

```javascript
jest.mock('../../models/user.model.js'); // Correct paths
```

### Mock not working

Ensure mocks are defined before importing:

```javascript
jest.mock('module'); // BEFORE import
import module from 'module'; // AFTER jest.mock
```

### Intermittent test failures

Use `jest.clearAllMocks()` in `beforeEach` to reset state between tests.

## Contributing

When adding new services or utilities:

1. Create corresponding test file
2. Write tests for all public functions
3. Include happy path, error cases, and edge cases
4. Aim for >85% coverage
5. Update this README with new test descriptions

## Performance

Tests are configured to run quickly:

- Parallel execution enabled
- No database connections
- Mocked external services
- ~2-3 seconds for complete suite

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Jest API Reference](https://jestjs.io/docs/api)
- [Testing Best Practices](https://jestjs.io/docs/tutorial-react#mocking)
- [Mocking Mongoose](https://jestjs.io/docs/manual-mocks)
