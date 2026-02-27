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

The server will run on `http://localhost:5000`

## API Endpoints

### Products

- **GET /api/products** - Get all products with optional filters
  - Query parameters: `category`, `minPrice`, `maxPrice`, `search`, `inStock`
  - Example: `/api/products?category=Vitamins%20&%20Supplements&minPrice=500&maxPrice=1000`

- **POST /api/products** - Create a new product
  - Required body fields: `name`, `category`, `price`, `description`, `image`, `quantity`
  - Optional body field: `inStock` (defaults based on quantity)
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
