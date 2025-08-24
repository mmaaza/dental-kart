# Medical Bazaar API Documentation

## Overview

The Medical Bazaar API is a comprehensive e-commerce platform for medical supplies and equipment. It supports multiple user roles: customers, vendors, and administrators.

## Base URL
```
http://localhost:5000/api
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- `customer`: Regular users
- `vendor`: Product sellers
- `admin`: System administrators

## API Endpoints

### Authentication

#### Register User
**POST** `/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login User
**POST** `/auth/login`
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Verify Email
**POST** `/auth/verify-email`
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Get Current User
**GET** `/auth/me`
*Requires authentication*

#### Update Profile
**PUT** `/auth/profile`
*Requires authentication*
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001"
}
```

### Products

#### Get All Products (Public)
**GET** `/products`
**Query Parameters:**
- `category`: Category ID
- `brand`: Brand ID
- `search`: Search term
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sortBy`: `price-low`, `price-high`, `popular`, `name-asc`, `name-desc`
- `page`: Page number
- `limit`: Items per page

#### Get Product by ID (Public)
**GET** `/products/:id`

#### Get Product by Slug (Public)
**GET** `/products/slug/:slug`

#### Create Product (Admin/Vendor)
**POST** `/products`
*Requires admin/vendor authentication*
```json
{
  "name": "Digital Blood Pressure Monitor",
  "description": "Accurate digital blood pressure monitor",
  "regularPrice": 599,
  "specialOfferPrice": 499,
  "brand": "60d5ecb8b5c9c62b3c7c1b5f",
  "categories": ["60d5ecb8b5c9c62b3c7c1b60"],
  "stock": 25,
  "status": "active"
}
```

#### Update Product (Admin/Vendor)
**PUT** `/products/:id`
*Requires admin/vendor authentication*

#### Delete Product (Admin/Vendor)
**DELETE** `/products/:id`
*Requires admin/vendor authentication*

### Categories

#### Get All Categories (Public)
**GET** `/categories`
**Query Parameters:**
- `status`: Filter by status
- `format`: `tree` or `flat`

#### Get Category by ID (Public)
**GET** `/categories/:id`

#### Create Category (Admin Only)
**POST** `/categories`
*Requires admin authentication*
```json
{
  "name": "Blood Pressure Monitors",
  "description": "Various blood pressure monitoring devices",
  "parentId": "60d5ecb8b5c9c62b3c7c1b60",
  "featured": true
}
```

#### Update Category (Admin Only)
**PUT** `/categories/:id`
*Requires admin authentication*

#### Delete Category (Admin Only)
**DELETE** `/categories/:id`
*Requires admin authentication*

### Brands

#### Get All Brands (Public)
**GET** `/brands`
**Query Parameters:**
- `featured`: Filter featured brands
- `search`: Search brands

#### Get Brand by ID (Public)
**GET** `/brands/:id`

#### Create Brand (Admin Only)
**POST** `/brands`
*Requires admin authentication*
```json
{
  "name": "HealthTech Pro",
  "description": "Professional medical equipment",
  "featured": true,
  "status": "active"
}
```

### Cart

#### Get User Cart
**GET** `/cart`
*Requires authentication*

#### Add Item to Cart
**POST** `/cart`
*Requires authentication*
```json
{
  "productId": "60d5ecb8b5c9c62b3c7c1b5e",
  "quantity": 2,
  "attributes": {
    "color": "white",
    "size": "large"
  }
}
```

#### Update Cart Item
**PUT** `/cart/:itemId`
*Requires authentication*
```json
{
  "quantity": 3
}
```

#### Remove Cart Item
**DELETE** `/cart/:itemId`
*Requires authentication*

#### Clear Cart
**DELETE** `/cart`
*Requires authentication*

### Orders

#### Create Order
**POST** `/orders`
*Requires authentication*
```json
{
  "shippingDetails": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "province": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "pay-now"
}
```

#### Get User Orders
**GET** `/orders`
*Requires authentication*

#### Get Order by ID
**GET** `/orders/:id`
*Requires authentication*

#### Cancel Order
**PATCH** `/orders/:id/cancel`
*Requires authentication*
```json
{
  "cancelReason": "Changed my mind"
}
```

#### Update Order Status (Admin/Vendor)
**PATCH** `/orders/:id/status`
*Requires admin/vendor authentication*
```json
{
  "orderStatus": "shipped",
  "trackingNumber": "TRK123456789"
}
```

#### Get All Orders (Admin Only)
**GET** `/orders/admin/all`
*Requires admin authentication*

### Reviews

#### Get Product Reviews (Public)
**GET** `/products/:productId/reviews`
**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `sortBy`: `newest`, `oldest`, `rating-high`, `rating-low`

#### Create Review
**POST** `/products/:productId/reviews`
*Requires authentication*
```json
{
  "rating": 5,
  "title": "Great Product",
  "comment": "Very accurate and easy to use!"
}
```

#### Update Review
**PUT** `/reviews/:reviewId`
*Requires authentication*

#### Delete Review
**DELETE** `/reviews/:reviewId`
*Requires authentication*

### Vendors

#### Vendor Login
**POST** `/vendors/login`
```json
{
  "email": "vendor@example.com",
  "password": "vendorpassword123"
}
```

#### Create Vendor (Admin Only)
**POST** `/vendors`
*Requires admin authentication*
```json
{
  "name": "HealthTech Solutions",
  "email": "healthtech@example.com",
  "phone": "+1234567890",
  "address": "456 Business Ave",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001"
}
```

#### Get Vendor Profile (Vendor Only)
**GET** `/vendors/profile`
*Requires vendor authentication*

#### Update Vendor Profile (Vendor Only)
**PUT** `/vendors/profile`
*Requires vendor authentication*

### Media

#### Upload Media
**POST** `/media/upload`
*Requires authentication*
**FormData:**
- `files`: Array of files
- `resize`: `original`, `product`, `thumbnail`

#### Get All Media
**GET** `/media`
*Requires authentication*

#### Delete Media
**DELETE** `/media/:id`
*Requires authentication*

### Search

#### Search All
**GET** `/search`
**Query Parameters:**
- `q`: Search query
- `type`: `all`, `products`, `brands`, `categories`
- `page`: Page number
- `limit`: Items per page

### Wishlist

#### Get Wishlist
**GET** `/wishlist`
*Requires authentication*

#### Add to Wishlist
**POST** `/wishlist`
*Requires authentication*
```json
{
  "productId": "60d5ecb8b5c9c62b3c7c1b5e"
}
```

#### Remove from Wishlist
**DELETE** `/wishlist/:productId`
*Requires authentication*

#### Clear Wishlist
**DELETE** `/wishlist`
*Requires authentication*

### Settings

#### Get Public Homepage Settings
**GET** `/settings/homepage`

#### Get Homepage Settings (Admin Only)
**GET** `/admin/settings/homepage`
*Requires admin authentication*

#### Update Homepage Settings (Admin Only)
**POST** `/admin/settings/homepage`
*Requires admin authentication*

### Admin Attribute Settings

#### Get All Attributes (Admin Only)
**GET** `/admin/settings/attributes`
*Requires admin authentication*

#### Create Attribute (Admin Only)
**POST** `/admin/settings/attributes`
*Requires admin authentication*
```json
{
  "name": "Color",
  "values": ["Red", "Blue", "Green", "White"],
  "description": "Product color options"
}
```

#### Update Attribute (Admin Only)
**PUT** `/admin/settings/attributes/:id`
*Requires admin authentication*

#### Delete Attribute (Admin Only)
**DELETE** `/admin/settings/attributes/:id`
*Requires admin authentication*

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## File Upload Limits

- **Images**: Maximum 10MB per file
- **Documents**: Maximum 10MB per file
- **Payment screenshots**: Maximum 5MB per file
- **Supported formats**: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, XLS, XLSX

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute

## Example Usage

### JavaScript/Node.js
```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// Get products
const productsResponse = await fetch('http://localhost:5000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get products
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer your-jwt-token"
```

## Support

For API support:
- **Email**: support@medicalbazaar.com
- **Documentation**: https://docs.medicalbazaar.com

---

*Last updated: January 15, 2024* 