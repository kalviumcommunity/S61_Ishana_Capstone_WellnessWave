# WellnessWave Backend API

Backend API server for the WellnessWave online medical & wellness store.

## Setup Instructions

### Installation

```bash
cd backend
npm install
```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5001`

## API Endpoints

### Products

- **GET /api/products** - Get all products with optional filters
  - Query parameters: `category`, `minPrice`, `maxPrice`, `search`, `inStock`
  - Example: `/api/products?category=Vitamins%20&%20Supplements&minPrice=500&maxPrice=1000`

- **POST /api/products** - Create a new product (Protected)
  - Required body fields: `name`, `category`, `price`, `description`, `image`, `quantity`
  - Optional body field: `inStock` (defaults based on quantity)
  - Requires header: `Authorization: Bearer <token>`
  - Example body:
    ```json
    {
      "name": "Zinc Tablets 50mg",
      "category": "Vitamins & Supplements",
      "price": 399,
      "description": "Daily zinc supplement for immune support",
      "image": "zinc-tablets.jpg",
      "quantity": 35,
      "inStock": true
    }
    ```

- **PUT /api/products/:id** - Update an existing product by ID (Protected)
  - Body fields are optional and can include: `name`, `category`, `price`, `description`, `image`, `quantity`, `inStock`
  - Requires header: `Authorization: Bearer <token>`
  - Example: `/api/products/3`

- **DELETE /api/products/:id** - Delete an existing product by ID (Protected)
  - Requires header: `Authorization: Bearer <token>`
  - Example: `/api/products/3`

- **POST /api/products/upload-image** - Upload product image (Protected)
  - Requires header: `Authorization: Bearer <token>`

- **GET /api/products/:id** - Get a specific product by ID
  - Example: `/api/products/1`

- **GET /api/products/category/:category** - Get all products in a specific category
  - Example: `/api/products/category/Pain%20Relief`

- **GET /api/products/paginated** - Get products with pagination
  - Query parameters: `page`, `limit`
  - Example: `/api/products/paginated?page=1&limit=5`

### Categories

- **GET /api/categories** - Get all unique product categories

- **GET /api/categories/details** - Get all categories with product count

### Authentication

- **POST /api/auth/register** - Register a new user
  - Required fields: `username`, `password`

- **POST /api/auth/login** - Login with username/password
  - Required fields: `username`, `password`
  - Returns JWT token

- **POST /api/auth/google** - Login/Register with Google ID token
  - Required field: `idToken`
  - Verifies token using Google and returns JWT token

- **GET /api/auth/me** - Get current logged-in user (Protected)
  - Requires header: `Authorization: Bearer <token>`

- **GET /api/auth/verify** - Verify JWT token and return token claims (Protected)
  - Requires header: `Authorization: Bearer <token>`

### Environment Variables

- `MONGO_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret key used to sign JWT tokens (recommended)
- `GOOGLE_CLIENT_ID` - Google OAuth Web Client ID used for token verification (required for Google auth)

### Health Check

- **GET /health** - Server health check endpoint

### Welcome

- **GET /** - API welcome message with available endpoints

## Sample Data

Sample product data is stored in `src/data/products.json`. Includes various healthcare products in categories like:
- Vitamins & Supplements
- Pain Relief
- Cold & Cough
- Digestive Health
- First Aid
- Hygiene
- Medical Devices
