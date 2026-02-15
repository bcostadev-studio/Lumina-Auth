# Lumina API - Authentication System

A production-ready, secure authentication system built with Node.js, Express, and TypeScript. Implements JWT-based authentication with bcrypt password hashing, comprehensive input validation, rate limiting, and full test coverage.

## 🚀 Features

- **Secure Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Access and refresh token system
- **Input Validation**: Strict schema validation with Joi
- **Rate Limiting**: Prevent brute force and DoS attacks
- **TypeScript**: Full type safety across the codebase
- **Error Handling**: Secure, informative error responses
- **Comprehensive Tests**: Unit and integration tests with Jest
- **Production Ready**: Security best practices implemented

## 📋 Requirements

- Node.js 16+ (tested with Node.js 20.x)
- npm 8+

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Important environment variables:**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=10

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lumina
```

For production, generate a strong JWT_SECRET:
```bash
openssl rand -base64 32
```

### 3. Setup PostgreSQL Database

#### Option A: Using Docker Compose (Recommended)
```bash
docker-compose up -d postgres
```

This will start PostgreSQL on port 5432 with the configured credentials.

#### Option B: Local PostgreSQL Installation
Ensure PostgreSQL is installed and running:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
```

Create the database:
```sql
CREATE USER lumina_user WITH PASSWORD 'lumina_password';
CREATE DATABASE lumina OWNER lumina_user;
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

The database tables will be automatically created (TypeORM synchronize enabled for development).

**Docker Compose Setup (All Services):**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- pgAdmin (port 5050) - Database management UI
- Node.js API (port 3000)

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "username": "username"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "username": "username",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        "accessToken": "eyJhbGc...",
        "refreshToken": "eyJhbGc..."
    }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
    "refreshToken": "eyJhbGc..."
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <accessToken>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

## 🔐 Password Requirements

Passwords must contain:
- ✅ Minimum 8 characters
- ✅ At least one lowercase letter (a-z)
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one digit (0-9)
- ✅ At least one special character (!@#$%^&*...)

**Example:** `MyPassword123!` ✓

## 📁 Project Structure

```
src/
├── app.ts                      # Express app configuration
├── server.ts                   # Server entry point
├── config/
│   └── config.ts              # Environment configuration
├── controllers/
│   ├── AuthController.ts      # Authentication request handlers
│   └── ItemController.ts      # Item resource handlers
├── middlewares/
│   ├── AuthMiddleware.ts      # JWT verification
│   ├── ErrorHandler.ts        # Global error handling
│   └── RateLimiter.ts         # Rate limiting configuration
├── models/
│   ├── User.ts                # User model and storage
│   └── Item.ts                # Item model
├── routes/
│   ├── AuthRoutes.ts          # Authentication endpoints
│   └── ItemRoutes.ts          # Item endpoints
├── services/
│   └── AuthService.ts         # Authentication business logic
├── types/
│   └── auth.ts                # TypeScript interfaces
└── utils/
    ├── tokenUtils.ts          # JWT operations
    └── validation.ts          # Input validation
tests/
├── AuthService.test.ts        # Service unit tests
└── AuthRoutes.test.ts         # Integration tests
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npm test AuthService.test.ts
```

### Test Coverage
```bash
npm test -- --coverage
```

## 📦 Building for Production

### 1. Build TypeScript
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Using Docker
```bash
docker build -t lumina-api .
docker run -e JWT_SECRET=your-secret -p 3000:3000 lumina-api
```

## 🔒 Security Features

### Password Security
- Bcrypt hashing with 10 salt rounds
- Each password uniquely salted
- Never stored or returned in plain text

### Token Security
- JWT signed with HMAC SHA-256
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry
- Token signature validation on every request

### Input Validation
- Email validation (RFC 5322)
- Password strength requirements
- Username alphanumeric only
- All inputs sanitized

### Attack Prevention
- **SQL Injection**: Input validation and no dynamic SQL
- **XSS**: JSON API responses, input sanitization
- **CSRF**: JWT in Authorization header
- **Brute Force**: Rate limiting (5 requests/15 min for auth endpoints)
- **Token Hijacking**: Short-lived access tokens
- **User Enumeration**: Generic error messages

## 📖 Full Documentation

See [AUTHENTICATION.md](./AUTHENTICATION.md) for comprehensive documentation including:
- Detailed security architecture
- Authentication flows
- Security measures and attack prevention
- Deployment configuration
- Complete API reference
- Troubleshooting guide
- Production checklist

## 🚀 Quick Start Examples

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "username": "username"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Get Profile (with token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Refresh Token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Using Postman

1. **Import Collection**: Use the API endpoints listed above
2. **Set Variables**: 
   - `base_url`: http://localhost:3000
   - `accessToken`: Retrieved from login response
   - `refreshToken`: Retrieved from login response
3. **Test Workflows**: Register → Login → Get Profile → Refresh → Logout

## 🔧 Configuration Options

### JWT Configuration
```env
JWT_SECRET=your-secret-key              # Signing secret
JWT_ACCESS_EXPIRY=15m                   # Access token lifetime
JWT_REFRESH_EXPIRY=7d                   # Refresh token lifetime
```

### Bcrypt Configuration
```env
BCRYPT_SALT_ROUNDS=10                   # Higher = slower (more secure but slower)
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000             # Time window in milliseconds
RATE_LIMIT_MAX_REQUESTS=100             # Max requests in window
```

## 📝 TypeScript Interfaces

Key types for integration:

```typescript
// User data (without password)
interface User {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}

// JWT payload
interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Registration request
interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
}

// Login request
interface LoginRequest {
    email: string;
    password: string;
}
```

## 🔄 Token Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /register or /login
       ├─────────────────────────────────┐
       │                                  │
       ▼                                  ▼
   ┌─────────────────────────────────────────────┐
   │  AuthController                             │
   │  - Validate input                           │
   │  - Hash password (bcrypt)                   │
   │  - Generate tokens (JWT)                    │
   └────────────┬────────────────────────────────┘
                │
                │ 2. Returns accessToken + refreshToken
                ▼
           ┌─────────────┐
           │   Client    │
           │  Stores     │
           │  Tokens     │
           └────┬────────┘
                │
                │ 3. GET /protected (with accessToken)
                │    Authorization: Bearer {accessToken}
                ▼
        ┌──────────────────────────┐
        │  AuthMiddleware          │
        │  - Verify signature      │
        │  - Check expiration      │
        │  - Attach user to req    │
        └────┬─────────────────────┘
             │
             │ 4. Request allowed
             ▼
        ┌──────────────────┐
        │ Protected Route  │
        │ Process request  │
        └──────────────────┘
                │
        Access token expires? No ──→ Send response
                │ Yes
                ▼
        ┌──────────────────────────┐
        │  Client notified to      │
        │  refresh token           │
        └────┬─────────────────────┘
             │
             │ 5. POST /refresh (with refreshToken)
             ▼
        ┌──────────────────────────┐
        │  AuthService.refresh     │
        │  - Verify refreshToken   │
        │  - Generate new tokens   │
        └────┬─────────────────────┘
             │
             │ 6. Return new accessToken + refreshToken
             ▼
        ┌──────────────────┐
        │   Client         │
        │   Updates tokens │
        └──────────────────┘
```

## 📊 Performance Considerations

### Bcrypt Salt Rounds
- **Default**: 10 (recommended)
- **Tradeoff**: Higher = more secure but slower
- **Typical hash time**: ~100ms per 10 rounds

### Rate Limiting Impact
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP
- **Minimal overhead**: ~1ms per request for checks

### Token Size
- **Access Token**: ~200-300 bytes
- **Refresh Token**: ~200-300 bytes
- **Storage**: ~1KB per user including metadata

## 🐛 Debugging

### Enable Debug Logging
```typescript
// In any file
console.log('Debug message:', { userId, timestamp });
```

### Check Token Expiration
```bash
# Decode JWT (without verification)
# Use jwt.io website or:
node -e "console.log(require('jsonwebtoken').decode('YOUR_TOKEN'))"
```

### Test Rate Limiting
```bash
# Send 6 rapid requests
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"pass"}'
  echo "\nRequest $i"
done
# 6th request should return 429
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support & Troubleshooting

### Common Issues

**Q: "Invalid or expired token" error**
A: Access tokens expire after 15 minutes. Use the refresh token to get a new one.

**Q: Password validation fails**
A: Password must be 8+ characters with uppercase, lowercase, digit, and special character.

**Q: Rate limiting blocks requests**
A: Auth endpoints limit to 5 requests per 15 minutes per IP. Wait or adjust settings.

For more troubleshooting, see [AUTHENTICATION.md](./AUTHENTICATION.md#troubleshooting)

## 📞 Contact & Feedback

For issues or questions:
1. Check [AUTHENTICATION.md](./AUTHENTICATION.md)
2. Review test files for usage examples
3. Open an issue with details

---

**Built with security in mind** 🔒
