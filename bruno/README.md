# WellnessWave Bruno Collection

This folder contains a Bruno collection for the existing backend API only. It matches the routes currently wired in `backend/src/server.js` and does not add any new backend behavior.

## Use

1. Open the `bruno` folder in Bruno.
2. Select the `Local` environment.
3. Start the backend at `http://localhost:5001`.
4. Run `Register`, `Login`, or `Google Login` first if you need protected product routes.

## Environment Variables

- `baseUrl`: Backend server URL.
- `authToken`: JWT used by protected routes.
- `productId`: Product id placeholder for get/update/delete requests.
- `categoryName`: Category placeholder for category-filtered product requests.
- `googleIdToken`: Google ID token placeholder.
- `imagePath`: Local file path used by the image upload request.

## Scope

Included requests:

- Welcome and health endpoints
- Auth endpoints
- Category endpoints
- Product endpoints, including protected create, update, delete, and upload image routes