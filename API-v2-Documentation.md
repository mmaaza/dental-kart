# Dental Kart Nepal - API v2 Documentation

> **Version**: 2.0  
> **Last Updated**: December 2024  
> **Base URL**: `http://localhost:5000/api` (Development)  
> **Production URL**: `https://your-domain.com/api`

## 🚀 Quick Start

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

#### How to Get the Bearer Token

1. **Register/Login First**: You must authenticate to get a token
2. **Token Response**: After successful login, you'll receive a JWT token
3. **Include in Headers**: Add the token to all subsequent requests

#### Token Flow Example

**Step 1: Login to get token**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Step 2: Use token in subsequent requests**
```http
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Different Ways to Provide Bearer Token

**1. HTTP Headers (Recommended)**
```http
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**2. cURL Example**
```bash
curl -X GET "http://localhost:5000/api/products" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**3. JavaScript/Fetch Example**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

fetch('http://localhost:5000/api/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

**4. Axios Example**
```javascript
import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

axios.get('http://localhost:5000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => console.log(response.data));
```

**5. React Native Example**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

fetch('http://localhost:5000/api/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

**6. Postman/API Testing Tools**
- Add header: `Authorization: Bearer <your_token>`
- Or use the "Authorization" tab and select "Bearer Token" type

#### Token Management Best Practices

**1. Store Token Securely**
```javascript
// Web Browser - Store in localStorage or sessionStorage
localStorage.setItem('authToken', token);

// React Native - Use secure storage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('authToken', token);

// iOS - Use Keychain
// Android - Use Keystore
```

**2. Create Reusable API Client**
```javascript
class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      // Token expired or invalid
      this.logout();
      throw new Error('Authentication required');
    }
    
    return response.json();
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

// Usage
const api = new ApiClient();
const products = await api.request('/products');
```

**3. Handle Token Expiration**
```javascript
// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Auto-refresh token if needed
if (isTokenExpired(token)) {
  // Redirect to login or refresh token
  window.location.href = '/login';
}
```

**4. Interceptor Pattern (Axios)**
```javascript
import axios from 'axios';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Response Format
All API responses follow a consistent format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Handling
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## 🔐 Authentication APIs

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### Verify Email (OTP)
```http
POST /auth/verify-email
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Get Current User
```http
GET /auth/me
```
*Requires authentication*

### Forgot Password
```http
POST /auth/forgot-password
```

### Reset Password
```http
PUT /auth/reset-password/:token
```

---

## 🛍️ Product APIs

### Get Products (Public)
```http
GET /products
```

**Query Parameters:**
- `category` - Category ID
- `brand` - Brand ID  
- `search` - Search term
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sortBy` - Sort field
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 10,
      "limit": 10
    }
  }
}
```

### Get Product by Slug
```http
GET /products/slug/:slug
```

### Get Product by ID
```http
GET /products/:id
```

### Create Product
```http
POST /products
```
*Requires admin/vendor authentication*

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "regularPrice": 1000,
  "specialOfferPrice": 800,
  "categories": ["category_id"],
  "brand": "brand_id",
  "stock": 50,
  "images": ["image_url1", "image_url2"],
  "status": "active",
  "isDraft": false,
  "attributes": [
    {
      "parentAttribute": {
        "name": "Size",
        "values": ["S", "M", "L"]
      },
      "childAttributes": [
        {
          "name": "Color",
          "values": ["Red", "Blue"],
          "parentValueIndex": 0
        }
      ]
    }
  ]
}
```

### Update Product
```http
PUT /products/:id
```

### Delete Product
```http
DELETE /products/:id
```

### Toggle Product Status
```http
PATCH /products/:id/toggle-status
```

### Approve Product (Admin Only)
```http
PATCH /products/:id/approve
```

### Draft Management
```http
GET /products/drafts/list
PATCH /products/:id/publish
```

---

## 🛒 Cart APIs

### Get User Cart
```http
GET /cart
```
*Requires authentication*

### Add to Cart
```http
POST /cart
```

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "attributes": {
    "size": "M",
    "color": "Red"
  }
}
```

### Update Cart Item
```http
PUT /cart/:itemId
```

### Remove Cart Item
```http
DELETE /cart/:itemId
```

### Clear Cart
```http
DELETE /cart
```

### Cart Cleanup
```http
PUT /cart/cleanup
```

---

## 📦 Order APIs

### Create Order
```http
POST /orders
```
*Requires authentication*

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "attributes": {
        "size": "M",
        "color": "Red"
      }
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44600",
    "country": "Nepal"
  },
  "paymentMethod": "cod",
  "paymentScreenshot": "file_upload"
}
```

### Get User Orders
```http
GET /orders
```

### Get Order by ID
```http
GET /orders/:id
```

### Cancel Order
```http
PATCH /orders/:id/cancel
```

### Update Order Status
```http
PATCH /orders/:id/status
```

**Request Body:**
```json
{
  "status": "processing",
  "trackingNumber": "TRK123456",
  "estimatedDeliveryDate": "2024-12-25"
}
```

---

## 🏪 Vendor APIs

### Vendor Login
```http
POST /vendors/login
```

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "password123"
}
```

### Get Vendor Profile
```http
GET /vendors/profile
```
*Requires vendor authentication*

### Update Vendor Profile
```http
PUT /vendors/profile
```

### Change Vendor Password
```http
PUT /vendors/change-password
```

### Admin Login as Vendor
```http
POST /vendors/admin-login
```
*Requires admin authentication*

---

## 🔍 Search APIs

### Global Search
```http
GET /search
```

**Query Parameters:**
- `q` - Search query
- `type` - Search type (products, brands, categories, all)
- `limit` - Results limit

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "brands": [...],
    "categories": [...]
  }
}
```

---

## 💬 Chat APIs

### Get User Chat
```http
GET /chat
```
*Requires authentication*

### Send Message
```http
POST /chat/message
```

**Request Body:**
```json
{
  "message": "Hello, I need help with my order",
  "type": "text"
}
```

### Mark as Read
```http
PUT /chat/:chatId/read
```

### Get Unread Count
```http
GET /chat/unread
```

---

## 🔔 Notification APIs

### Get Notifications
```http
GET /notifications
```
*Requires authentication*

### Mark as Read
```http
PUT /notifications/:notificationId/read
```

### Mark All as Read
```http
PUT /notifications/mark-all-read
```

### Delete Notification
```http
DELETE /notifications/:notificationId
```

---

## ⚙️ Settings APIs

### Get Homepage Settings (Public)
```http
GET /settings/homepage
```

### Get Homepage Settings (Admin)
```http
GET /admin/settings/homepage
```
*Requires admin authentication*

### Update Homepage Settings
```http
POST /admin/settings/homepage
```

### Get SEO Settings
```http
GET /admin/settings/seo
```

### Update SEO Settings
```http
POST /admin/settings/seo
```

---

## 🏷️ Category & Brand APIs

### Categories
```http
GET /categories
POST /categories
GET /categories/:id
PUT /categories/:id
DELETE /categories/:id
```

### Brands
```http
GET /brands
POST /brands
GET /brands/:id
PUT /brands/:id
DELETE /brands/:id
PATCH /brands/:id/toggle-featured
PATCH /brands/:id/toggle-status
```

---

## 📁 Media APIs

### Upload Media
```http
POST /media/upload
```
*Requires authentication*

**Form Data:**
- `files` - File(s) to upload
- `resize` - Resize option (original, product, thumbnail)

### Get Media
```http
GET /media
```

### Delete Media
```http
DELETE /media/:id
```

---

## 👥 User Management APIs

### Get All Users (Admin)
```http
GET /users
```

### Update User Status
```http
PUT /users/:id/status
```

---

## 🔐 Authentication & Authorization

### User Roles
- `user` - Regular customer
- `vendor` - Product vendor
- `admin` - System administrator

### Protected Routes
- **User Routes**: Require valid JWT token
- **Vendor Routes**: Require vendor authentication
- **Admin Routes**: Require admin role

### Token Expiration
- JWT tokens expire after 24 hours
- Refresh tokens available for extended sessions

---

## 📊 Data Models

### Product Structure
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "regularPrice": "number",
  "specialOfferPrice": "number",
  "categories": ["category_id"],
  "brand": "brand_id",
  "vendor": "vendor_id",
  "stock": "number",
  "images": ["string"],
  "status": "active|inactive|draft",
  "isDraft": "boolean",
  "approvalStatus": "pending|approved|rejected",
  "attributes": [...],
  "variants": [...],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Order Structure
```json
{
  "id": "string",
  "orderNumber": "string",
  "user": "user_id",
  "items": [...],
  "subOrders": [...],
  "total": "number",
  "status": "pending|processing|shipped|delivered|cancelled",
  "paymentStatus": "pending|paid|failed",
  "shippingAddress": {...},
  "createdAt": "date"
}
```

---

## 🚨 Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Validation Error | Data validation failed |
| 500 | Server Error | Internal server error |

---

## 📱 Mobile App Integration

### Best Practices
1. **Token Storage**: Store JWT securely (Keychain/Keystore)
2. **Error Handling**: Implement comprehensive error handling
3. **Offline Support**: Cache critical data for offline use
4. **Push Notifications**: Use notification APIs for real-time updates
5. **Image Optimization**: Implement lazy loading for product images

### Rate Limiting
- **Public APIs**: 100 requests per minute
- **Authenticated APIs**: 1000 requests per minute
- **Admin APIs**: 5000 requests per minute

---

## 🔧 Development Tools

### Testing Endpoints
```http
GET /test/health
POST /test/seed-data
DELETE /test/cleanup
```

### Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mbnepal
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=brevo
BREVO_API_KEY=your_brevo_key
CLIENT_URL=http://localhost:3000
```
