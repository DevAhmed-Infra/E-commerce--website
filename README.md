# E-Commerce Backend API

## 1. Project Overview
This project is a Node.js and Express backend for an e-commerce platform. It exposes a REST API for authentication, user management, product catalog management, category and brand organization, reviews, wishlist management, address book management, shopping cart workflows, coupon handling, cash-on-delivery orders, and Stripe-powered card checkout.

Core capabilities:
- Cookie-based JWT authentication with role-based authorization
- Catalog management for categories, subcategories, brands, and products
- Product reviews with one-review-per-user-per-product enforcement
- User wishlist and address book management
- Shopping cart, coupon application, and order placement
- Stripe Checkout session creation and webhook-driven card order creation
- Image upload and resizing for users, categories, brands, and products

## 2. Tech Stack
| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Web framework | Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JWT (`jsonwebtoken`) + `httpOnly` cookies |
| Validation | `express-validator` |
| File upload | `multer` |
| Image processing | `sharp` |
| Payments | Stripe |
| Email | Nodemailer (SMTP) |
| Security | `hpp`, custom XSS and Mongo operator sanitization, cookie parsing, rate limiting |
| Observability | Morgan (development), custom JSON logger |
| Utilities | `slugify`, `uuid`, `bcryptjs`, `compression`, `cors` |

## 3. Architecture
The codebase uses a modular layered backend architecture with clear separation between transport, business logic, and persistence.

Primary flow:
1. Client sends an HTTP request to `/api/v1/...`
2. Global middleware runs in `server.js`:
   `cors` -> `compression` -> JSON parsing -> static serving -> `hpp` -> `cookie-parser` -> rate limiter -> sanitize middleware
3. Feature router resolves the endpoint
4. Route-specific middleware runs:
   auth verification, role restriction, validators, image upload, image resize, nested-resource helpers
5. Service layer executes business logic
6. Mongoose models read or write MongoDB
7. Response is serialized as JSON
8. Errors bubble into the centralized error handler

Architectural style:
- Modular monolith
- Layered request pipeline
- Route -> middleware -> service -> model flow
- Reusable generic CRUD service factory for common operations

## 4. Folder Structure
```text
.
├── config
│   ├── db.js
│   ├── emailConfig.js
│   └── security.js
├── middlewares
│   ├── createFilterObj.js
│   ├── globalErrorHandler.js
│   ├── notFoundHandler.js
│   ├── restrictedTo.js
│   ├── sanitizeMiddlerware.js
│   ├── setIdToBody.js
│   ├── stripeWebhookBody.js
│   ├── uploadImage.js
│   ├── validation.js
│   └── verifyToken.js
├── models
│   ├── brand.model.js
│   ├── cart.model.js
│   ├── category.model.js
│   ├── coupon.model.js
│   ├── order.model.js
│   ├── product.model.js
│   ├── review.model.js
│   ├── subcategory.model.js
│   └── user.model.js
├── routes
│   ├── address.router.js
│   ├── auth.router.js
│   ├── brand.router.js
│   ├── cart.router.js
│   ├── category.router.js
│   ├── coupon.router.js
│   ├── index.Router.js
│   ├── order.router.js
│   ├── product.router.js
│   ├── review.router.js
│   ├── subcategory.router.js
│   ├── user.router.js
│   └── wishlist.router.js
├── services
│   ├── address.services.js
│   ├── auth.services.js
│   ├── brand.services.js
│   ├── cart.services.js
│   ├── category.services.js
│   ├── coupon.services.js
│   ├── factory.js
│   ├── order.services.js
│   ├── product.services.js
│   ├── review.services.js
│   ├── subcategory.services.js
│   ├── user.services.js
│   └── wishlist.services.js
├── uploads
│   ├── brands
│   ├── categories
│   ├── products
│   └── users
├── utils
│   ├── apiFeatures.js
│   ├── appError.js
│   ├── calculateCartTotal.js
│   ├── cookieAuth.js
│   ├── generateToken.js
│   ├── httpStatus.js
│   ├── logger.js
│   ├── sendEmail.js
│   ├── slugHelper.js
│   └── validators
├── package.json
└── server.js
```

## 5. Features
### Authentication
- User sign-up and login
- JWT issuance with `httpOnly` cookie storage
- Logout by clearing auth cookie
- Forgot password flow with email-delivered reset code
- Reset-code verification and password reset token exchange
- Password reset completion with new JWT issuance

### User management
- Admin and manager user listing and creation
- Admin and manager fetch/update arbitrary users
- Admin-only user deletion
- Authenticated self-service profile retrieval and update
- Authenticated self-service password change
- Soft deactivation via `deleteMe`

### Catalog
- Categories
- Subcategories with nested routing under categories
- Brands
- Products with category, subcategory, brand, color, pricing, rating, and image support

### Engagement
- Reviews with ownership checks
- Wishlist per user
- Address book per user

### Commerce
- One-cart-per-user cart management
- Add, update, remove, and clear cart items
- Coupon application with discounted total calculation
- Cash order creation
- Stripe Checkout session creation
- Stripe webhook-based card order creation

### File and media handling
- Multipart uploads for user, category, brand, and product images
- In-memory upload processing with Sharp-based resizing and JPEG output

### Query capabilities
List endpoints support:
- Pagination: `page`, `limit`
- Sorting: `sort`
- Sparse field selection: `fields`
- Keyword search: `keyword`
- Filter operators: `gte`, `gt`, `lte`, `lt`

## 6. API Documentation (COMPLETE)
Base URL:

```text
http://localhost:8000/api/v1
```

Auth conventions:
- Cookie auth: `token` cookie set after login/sign-up
- Alternative auth: `Authorization: Bearer <jwt>`
- Role restrictions:
  `user`, `manager`, `admin`

Response conventions:
- Success responses generally use `{ "status": "success", "data": ... }`
- Validation failures return `{ "errors": [...] }`
- Operational errors return `{ "status": "fail" | "error", "message": "..." }`
- In development, error responses also include `error` and `stack`

### Auth Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/auth/signup` | No | Register a new user and set auth cookie | None | `{ "name": "Ahmed", "email": "ahmed@example.com", "password": "secret12", "passwordConfirm": "secret12", "phone": "+201012345678" }` | `201 { status, data }` | `400` validation errors, duplicate email |
| POST | `/auth/login` | No | Authenticate user and set auth cookie | None | `{ "email": "ahmed@example.com", "password": "secret12" }` | `200 { status, data }` | `400` missing fields, `401` invalid credentials |
| POST | `/auth/logout` | Yes | Clear auth cookie | None | None | `200 { status, message }` | `401` unauthorized |
| POST | `/auth/forgotPassword` | No | Send password reset code by email | None | `{ "email": "ahmed@example.com" }` | `200 { status, message }` | `400` validation, `404` user not found, `500` email failure |
| POST | `/auth/verifyResetCode` | No | Validate reset code and issue temporary reset token | None | `{ "resetCode": "123456" }` | `200 { status, resetToken }` | `400` invalid or expired code |
| POST | `/auth/resetPassword` | No | Reset password using temporary reset token | None | `{ "resetToken": "<token>", "newPassword": "newsecret12", "passwordConfirm": "newsecret12" }` | `200 { status }` | `400` invalid token, mismatch, unverified reset |

### User Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/users` | Admin, Manager | List users | Query: `page,limit,sort,fields,keyword` | None | `200 { status, paginationResult, data }` | `401`, `403` |
| POST | `/users` | Admin, Manager | Create a user | Multipart supported (`profileImg`) | `{ "name": "Manager 1", "email": "manager@example.com", "password": "secret12", "passwordConfirm": "secret12", "role": "manager" }` | `201 { status, data }` | `400` validation, duplicate email |
| GET | `/users/getMe` | Any authenticated user | Get own profile | None | None | `200 { status, data }` | `401`, `404` |
| PATCH | `/users/updateMe` | Any authenticated user | Update own profile | None | `{ "name": "Ahmed Updated", "email": "new@example.com", "phone": "+201055555555" }` | `200 { status, data }` | `400` validation, duplicate email |
| PATCH | `/users/deleteMe` | Any authenticated user | Soft deactivate own account | None | None | `204 No Content` | `401` |
| PATCH | `/users/changeMyPassword` | Any authenticated user | Change own password and issue fresh token | None | `{ "password": "newsecret12", "passwordConfirm": "newsecret12" }` | `200 { status, data }` | `400` validation, `401` unauthorized |
| PATCH | `/users/changePassword/:id` | Admin, Manager | Change another user’s password | Path: `id` | `{ "password": "newsecret12", "passwordConfirm": "newsecret12" }` | `200 { status, data }` | `400` validation, `403`, `404` |
| GET | `/users/:id` | Admin, Manager | Get a user by ID | Path: `id` | None | `200 { status, data }` | `400` invalid id, `403`, `404` |
| PATCH | `/users/:id` | Admin, Manager | Update a user | Path: `id`, multipart supported (`profileImg`) | `{ "name": "Updated User", "email": "updated@example.com", "role": "manager" }` | `200 { status, data }` | `400`, `403`, `404` |
| DELETE | `/users/:id` | Admin | Delete a user | Path: `id` | None | `204 No Content` | `400`, `403`, `404` |

### Category Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/categories` | No | List categories | Query: `page,limit,sort,fields,keyword` | None | `200 { status, paginationResult, data }` | `500` unexpected server error |
| POST | `/categories` | Admin, Manager | Create category | Multipart supported (`image`) | `{ "name": "Electronics" }` | `201 { status, data }` | `400` validation, duplicate name |
| GET | `/categories/:id` | No | Get category by ID | Path: `id` | None | `200 { status, data }` | `400` invalid id, `404` |
| PATCH | `/categories/:id` | Admin, Manager | Update category | Path: `id`, multipart supported (`image`) | `{ "name": "Mobile Devices" }` | `200 { status, data }` | `400`, `403`, `404` |
| DELETE | `/categories/:id` | Admin | Delete category | Path: `id` | None | `204 No Content` | `400`, `403`, `404` |

### Subcategory Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/subcategories` | No | List all subcategories | Query: `page,limit,sort,fields,keyword` | None | `200 { status, paginationResult, data }` | `500` unexpected server error |
| POST | `/subcategories` | Admin, Manager | Create subcategory | None | `{ "name": "Laptops", "categoryId": "<categoryId>" }` | `201 { status, data }` | `400` validation |
| GET | `/subcategories/:id` | No | Get subcategory by ID | Path: `id` | None | `200 { status, data }` | `400`, `404` |
| PATCH | `/subcategories/:id` | Admin, Manager | Update subcategory | Path: `id` | `{ "name": "Gaming Laptops", "category": "<categoryId>" }` or `{ "name": "Gaming Laptops", "categoryId": "<categoryId>" }` | `200 { status, data }` | `400`, `403`, `404` |
| DELETE | `/subcategories/:id` | Admin | Delete subcategory | Path: `id` | None | `204 No Content` | `400`, `403`, `404` |
| GET | `/categories/:categoryId/subcategories` | No | List subcategories for a category | Path: `categoryId`, Query: `page,limit,sort,fields,keyword` | None | `200 { status, paginationResult, data }` | `500` unexpected server error |
| POST | `/categories/:categoryId/subcategories` | Admin, Manager | Create subcategory under a category | Path: `categoryId` | `{ "name": "Accessories", "categoryId": "<categoryId>" }` | `201 { status, data }` | `400`, `403` |

### Brand Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/brands` | No | List brands | Query: `page,limit,sort,fields,keyword` | None | `200 { status, paginationResult, data }` | `500` unexpected server error |
| POST | `/brands` | Admin, Manager | Create brand | Multipart supported (`image`) | `{ "name": "Apple" }` | `201 { status, data }` | `400`, duplicate name |
| GET | `/brands/:id` | No | Get brand by ID | Path: `id` | None | `200 { status, data }` | `400`, `404` |
| PATCH | `/brands/:id` | Admin, Manager | Update brand | Path: `id`, multipart supported (`image`) | `{ "name": "Apple Inc." }` | `200 { status, data }` | `400`, `403`, `404` |
| DELETE | `/brands/:id` | Admin | Delete brand | Path: `id` | None | `204 No Content` | `400`, `403`, `404` |

### Product Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/products` | No | List products with optional search and filtering | Query: `page,limit,sort,fields,keyword,price[gte],price[lte],category,...` | None | `200 { status, paginationResult, data }` | `500` unexpected server error |
| POST | `/products` | Admin, Manager | Create product | Multipart supported (`imageCover`, `images`) | `{ "title": "iPhone 15", "description": "Flagship smartphone with advanced camera system.", "price": 1200, "quantity": 10, "categoryId": "<categoryId>", "subcategoryId": ["<subcategoryId>"], "brand": "<brandId>", "color": ["black", "blue"] }` | `201 { status, data }` | `400` validation, missing references |
| GET | `/products/:id` | No | Get product by ID with populated relations and reviews | Path: `id` | None | `200 { status, data }` | `400`, `404` |
| PATCH | `/products/:id` | Admin, Manager | Update product | Path: `id` | `{ "title": "iPhone 15 Pro", "price": 1300, "priceAfterDiscount": 1199 }` | `200 { status, data }` | `400`, `403`, `404` |
| DELETE | `/products/:id` | Admin | Delete product | Path: `id` | None | `204 No Content` | `400`, `403`, `404` |

### Review Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/reviews` | Yes | List reviews | Query: `page,limit,sort,fields` | None | `200 { status, paginationResult, data }` | `401` |
| POST | `/reviews` | User | Create review by passing `product` in body | None | `{ "product": "<productId>", "rating": 5, "title": "Excellent" }` | `201 { status, data }` | `400` validation, duplicate review |
| GET | `/reviews/:id` | Yes | Get review by ID | Path: `id` | None | `200 { status, data }` | `400`, `401`, `404` |
| PATCH | `/reviews/:id` | User | Update own review | Path: `id` | `{ "title": "Updated review", "rating": 4 }` | `200 { status, data }` | `400`, `401`, `403`, `404` |
| DELETE | `/reviews/:id` | User, Manager, Admin | Delete review | Path: `id` | None | `204 No Content` | `400`, `401`, `403`, `404` |
| GET | `/products/:productId/reviews` | Yes | List reviews for product | Path: `productId`, Query: `page,limit,sort,fields` | None | `200 { status, paginationResult, data }` | `401` |
| POST | `/products/:productId/reviews` | User | Create review for nested product route | Path: `productId` | `{ "rating": 5, "title": "Great value" }` | `201 { status, data }` | `400`, `401`, duplicate review |

### Wishlist Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/wishlists` | User | Get own wishlist | None | None | `200 { status, data }` | `401`, `403` |
| POST | `/wishlists` | User | Add product to wishlist | None | `{ "product": "<productId>" }` | `200 { status, data }` | `401`, `403`, `404` missing product field |
| DELETE | `/wishlists/:product` | User | Remove product from wishlist | Path: `product` | None | `200 { status, data }` | `401`, `403`, `400` |

### Address Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/addresses` | User | Get own addresses | None | None | `200 { status, data }` | `401`, `403` |
| POST | `/addresses` | User | Add address | None | `{ "details": "123 Street", "phone": "+201012345678", "alias": "home", "postalCode": "12345", "city": "Cairo" }` | `200 { status, data }` | `400` missing required fields, `401`, `403` |
| DELETE | `/addresses/:address` | User | Remove address | Path: `address` | None | `200 { status, data }` | `400`, `401`, `403` |

### Coupon Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/coupons` | Admin, Manager | List coupons | Query: `page,limit,sort,fields,keyword` | None | `200 { status, paginationResult, data }` | `401`, `403` |
| POST | `/coupons` | Admin, Manager | Create coupon | None | `{ "name": "SUMMER10", "expire": "2026-12-31T23:59:59.000Z", "discount": 10 }` | `201 { status, data }` | `400`, duplicate name |
| GET | `/coupons/:id` | Admin, Manager | Get coupon by ID | Path: `id` | None | `200 { status, data }` | `401`, `403`, `404` |
| PATCH | `/coupons/:id` | Admin, Manager | Update coupon | Path: `id` | `{ "discount": 15 }` | `200 { status, data }` | `401`, `403`, `404` |
| DELETE | `/coupons/:id` | Admin, Manager | Delete coupon | Path: `id` | None | `204 No Content` | `401`, `403`, `404` |

### Cart Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/carts` | User | Get current user cart | None | None | `200 { status, numOfCartItems, data }` | `401`, `403`, `404` no cart |
| POST | `/carts` | User | Add product to cart | None | `{ "productId": "<productId>", "quantity": 2, "color": "black" }` | `200 { status, data }` | `400` validation, stock issues, invalid color, `401`, `403` |
| DELETE | `/carts` | User | Clear cart | None | None | `204 No Content` | `401`, `403` |
| DELETE | `/carts/:id` | User | Remove cart item | Path: `id` | None | `200 { status, length, data }` | `400`, `401`, `403`, `404` |
| PATCH | `/carts/item/:itemId` | User | Update item quantity | Path: `itemId` | `{ "quantity": 3 }` | `200 { status, data }` | `400`, `401`, `403`, `404` |
| POST | `/carts/coupon` | User | Apply coupon | None | `{ "coupon": "SUMMER10" }` | `200 { status, numOfCartItems, data }` | `400`, `401`, `403`, `404` coupon/cart not found |

### Order Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/orders` | User, Manager, Admin | List orders; users see only their own orders | Query: `page,limit,sort,fields` | None | `200 { status, paginationResult, data }` | `401`, `403` |
| POST | `/orders` | User | Create cash order from current cart | None | `{ "shippingAddress": { "details": "123 Street", "phone": "+201012345678", "city": "Cairo", "postalCode": "12345" }, "shippingPrice": 50 }` | `201 { status, data }` | `400` invalid shipping, stock issues, `404` cart not found |
| GET | `/orders/:id` | User, Manager, Admin | Get order by ID | Path: `id` | None | `200 { status, data }` | `400`, `401`, `403`, `404` |
| PATCH | `/orders/:id/pay` | User, Manager, Admin | Mark order as paid | Path: `id` | None | `200 { status, data }` | `400`, `401`, `403`, `404` |

### Payment Routes
| Method | URL | Auth | Description | Params / Query | Request Body Example | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/orders/checkout-session/:cartId` | User | Create Stripe Checkout session for current cart | Path: `cartId` | `{ "shippingAddress": { "details": "123 Street", "phone": "+201012345678", "city": "Cairo", "postalCode": "12345" } }` | `200 { status, data }` where `data` is a Stripe Checkout session | `400` invalid cart id, stock issue, `404` cart not found |
| POST | `/orders/webhook-checkout` | No | Stripe webhook endpoint for completed checkout sessions | Header: `stripe-signature` | Raw Stripe event payload | `200 { "received": true }` | `400 Webhook Error: ...` |

## 7. Security & Middleware
Implemented middleware and protections:

| Control | Purpose | Notes |
| --- | --- | --- |
| `cors()` | Cross-origin access | Currently open configuration; suitable for development, should be restricted in production |
| `compression()` | Response compression | Reduces bandwidth for JSON and static payloads |
| `express.json({ limit: "10kb" })` | JSON parsing with payload cap | Helps reduce abuse from oversized request bodies |
| `cookie-parser` | Cookie parsing | Required for JWT cookie authentication |
| `express-rate-limit` | API throttling | 100 requests per IP per 15 minutes on `/api` |
| `hpp()` | HTTP parameter pollution protection | Reduces duplicate query key abuse |
| `sanitizeMiddleware` | XSS and Mongo operator sanitization | Sanitizes `body`, `params`, and `query` |
| `express-validator` | Input validation | Applied at route level |
| `verifyToken` | JWT validation | Supports cookie or bearer token |
| `restrictedTo` | RBAC enforcement | Restricts access by role |
| `stripeWebhookBody` | Preserves raw request body | Required for Stripe signature verification |
| `multer` + MIME filtering | Upload filtering | Accepts image MIME types only |

Security observations:
- JWTs are stored in `httpOnly` cookies with `sameSite: "strict"`
- Passwords are hashed with `bcryptjs`
- Query search terms are regex-escaped to reduce ReDoS risk
- There is no active CSRF middleware registered in `server.js`
- CORS is permissive by default and should be locked down for production

## 8. Performance Analysis (JMeter-style simulation)
The following analysis is code-informed and intended as a pre-production engineering estimate, not a substitute for a real benchmark run. Estimates assume:
- Single Node.js instance
- MongoDB Atlas deployment
- SMTP and Stripe external dependencies over the public internet
- Moderate document sizes
- Default list page size near 50 items

Load bands used here:
- Low load: 1-20 concurrent users
- Medium load: 20-100 concurrent users
- High load: 100-500 concurrent users

### Major Endpoint Performance Profile
| Endpoint | Expected Response Time (Low / Medium / High) | Throughput Estimate | CPU Impact | DB Pressure | Bottlenecks | Middleware Overhead | External Latency |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /auth/signup` | 120-300ms / 250-700ms / 700ms-2s | 15-40 req/s | Medium | Medium | bcrypt hashing, unique email lookup, Mongo write | Validation + cookie set are light | None |
| `POST /auth/login` | 100-250ms / 220-600ms / 600ms-1.5s | 20-50 req/s | Medium | Medium | bcrypt compare, user lookup | Validation + auth cookie set are light | None |
| `POST /auth/forgotPassword` | 500ms-2.5s / 1.5s-4s / 4s-8s | 2-8 req/s | Low | Low | SMTP round-trip dominates | Validation is negligible | High due to email provider |
| `GET /products` | 80-220ms / 180-600ms / 600ms-2s | 30-80 req/s | Low-Medium | High | `countDocuments`, populate, regex search, sorting | Sanitization + parsing are light | None |
| `GET /products/:id` | 60-180ms / 120-400ms / 400ms-1.2s | 40-90 req/s | Low | Medium | multiple populates including reviews | Minimal | None |
| `POST /products` | 250-700ms / 600ms-1.8s / 1.8s-5s | 5-15 req/s | High | Medium | multipart parsing, Sharp resizing, category/subcategory validation, Mongo write | Auth + validation add moderate cost | None |
| `PATCH /products/:id` | 120-350ms / 250-900ms / 900ms-2.5s | 10-25 req/s | Medium | Medium | validation, possible large multipart image processing | Auth + validation moderate | None |
| `GET /reviews` | 90-250ms / 180-650ms / 650ms-1.8s | 25-70 req/s | Low | Medium | populate user references, countDocuments | Auth check is cheap | None |
| `POST /reviews` | 140-350ms / 300-900ms / 900ms-2.2s | 10-25 req/s | Low-Medium | High | duplicate-review lookup, product lookup, review write, rating aggregation update | Auth + validation moderate | None |
| `POST /carts` | 140-400ms / 300-900ms / 900ms-2.5s | 10-30 req/s | Low-Medium | High | product lookup, existing cart lookup, cart write with populate | Auth + validation moderate | None |
| `PATCH /carts/item/:itemId` | 180-500ms / 350ms-1.1s / 1.1s-3s | 8-20 req/s | Low-Medium | High | cart lookup, product lookup, cart rewrite and save | Auth + validation moderate | None |
| `POST /carts/coupon` | 180-450ms / 350ms-1s / 1s-2.8s | 8-20 req/s | Low | Medium-High | coupon lookup + cart lookup + cart save | Auth + validation moderate | None |
| `POST /orders` | 250-700ms / 500ms-1.5s / 1.5s-4s | 5-15 req/s | Medium | Very High | per-item stock validation loop, bulk product update, order write, cart delete | Auth + validation moderate | None |
| `GET /orders` | 120-300ms / 250-800ms / 800ms-2.5s | 15-40 req/s | Low-Medium | High | order populate on user and products, countDocuments | Auth + role checks low | None |
| `POST /orders/checkout-session/:cartId` | 350ms-1.2s / 800ms-2.5s / 2.5s-6s | 3-10 req/s | Medium | High | cart lookup, per-item stock validation, Stripe session creation | Auth + validation moderate | High due to Stripe |
| `POST /orders/webhook-checkout` | 80-250ms / 180-700ms / 700ms-2s | 10-30 req/s | Low-Medium | High | signature verification, order creation, bulk stock update | Very low | Medium due to Stripe webhook arrival patterns |
| `POST /users` | 250-700ms / 600ms-1.8s / 1.8s-5s | 5-15 req/s | High | Medium | image resizing, bcrypt hashing, uniqueness checks | Auth + RBAC + validation moderate | None |

### System-wide analysis
#### Overall scalability
- The architecture is suitable for small to medium traffic as a modular monolith.
- Stateless JWT auth helps horizontal scaling.
- The biggest scaling pressure comes from MongoDB query count, file/image processing, and external integrations.

#### Database bottlenecks
- List endpoints call `countDocuments()` and then run the actual query, which doubles DB work per paginated request.
- Product, order, and review endpoints use `populate`, which increases query fan-out and payload size.
- Cart and order flows perform several dependent queries per request.
- Review creation triggers aggregation-based rating recalculation on every write.

#### API performance risks
- Sharp image resizing is CPU-heavy and runs inline in the request lifecycle.
- SMTP-based forgot-password flow is synchronous from the request’s perspective and can block response time.
- Stripe checkout creation depends on external network latency.
- Search uses regex queries, which will slow down as data volume grows unless backed by search indexing strategy.

#### Potential memory or latency concerns
- Multipart uploads are kept in memory before Sharp writes to disk, so large or concurrent uploads can spike memory usage.
- Large populated responses can increase heap pressure and response serialization time.
- MongoDB `autoIndex: true` in runtime startup is convenient for development but not ideal for large production datasets.

#### Rate limiting effectiveness
- The current rate limiter is a useful first-line defense for bursty clients.
- It is per-process and memory-based, so in multi-instance production it should be replaced with a shared store.
- 100 requests per 15 minutes is conservative for public APIs and may need route-specific tuning.

#### Real-world production behavior under traffic spikes
- Read-heavy endpoints such as catalog listing should remain stable longer than write-heavy flows.
- Authentication and order placement will degrade faster because of bcrypt, stock validation, and multiple DB writes.
- Password reset and payment flows are most vulnerable to third-party latency spikes.
- Upload-heavy admin workloads can starve CPU on smaller instances.

### Recommended performance improvements
- Move image processing to background jobs or dedicated media services
- Replace synchronous email sending with queue-based delivery
- Add indexes for high-cardinality filters and search-heavy fields
- Reduce populate depth where possible and introduce projection defaults
- Consider caching public catalog reads
- Replace `countDocuments()` on every list request with optimized pagination strategies when data volume grows
- Use shared rate-limit storage in production
- Replace deprecated Mongoose `new: true` update options with `returnDocument: "after"`

## 9. Why Performance Analysis is Important
Backend performance directly affects checkout completion, search responsiveness, user retention, and infrastructure cost.

Why it matters:
- Slow login or cart endpoints increase abandonment
- Slow catalog pages reduce conversion
- Payment or order latency damages trust at the most revenue-sensitive step
- Timeouts under load cause retries, duplicate operations, and cascading failures

What happens under high traffic:
- DB queues grow
- CPU-bound tasks like bcrypt and Sharp create request backlogs
- External API latency amplifies overall response time
- Node.js event loop responsiveness drops as expensive synchronous work accumulates

Why companies use JMeter and load testing tools:
- To validate expected throughput before production traffic arrives
- To identify bottlenecks in DB access, middleware, file processing, and third-party calls
- To size infrastructure and autoscaling policies realistically
- To detect failure modes such as rate-limit contention, memory spikes, and long-tail latency

Business impact of bottlenecks:
- Higher bounce and cart abandonment rates
- Lower conversion and revenue
- Poor mobile experience on slow networks
- Increased support cost due to inconsistent behavior
- Lower operational confidence during launches, promotions, and seasonal peaks

This analysis is critical before production because correctness alone is not enough. A backend that works functionally but slows down under load can still fail customers and the business.

## 10. Setup Instructions
### Prerequisites
- Node.js 18+ recommended
- MongoDB database
- SMTP credentials for email sending
- Stripe account and API keys for card payments

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file with the following keys:

```env
PORT=8000
NODE_ENV=development
MONGO_URL=<mongodb-connection-string>
BASE_URL=http://localhost:8000
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=10m
SMTP_HOST=<smtp-host>
SMTP_PORT=465
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>
FROM_EMAIL=<sender-email>
FROM_NAME=E-Commerce App
COOKIE_SECRET=<strong-cookie-secret>
STRIPE_SECRET=<stripe-secret-key>
WEBHOOK_SECRET=<stripe-webhook-secret>
```

Notes:
- `WEBHOOK_SECRET` is used by the Stripe webhook verification flow.
- `BASE_URL` is also used when building uploaded image URLs.
- Do not commit real secrets to version control.

### Run the Server
Development:

```bash
npm start
```

Production-style:

```bash
npm run start:prod
```

### Lint
```bash
npm run lint
```

### Tests
The current `npm test` script is a placeholder and does not run automated tests.

```bash
npm test
```

### Recommended next steps before production
- Add automated unit and integration tests
- Add environment-specific CORS configuration
- Add shared-store rate limiting
- Add CSRF protection if browser cookie auth is exposed cross-site
- Move email and media processing to async jobs
- Add real load tests with JMeter, k6, or Artillery
