# Dental Kart Nepal - API Documentation

This documentation provides details about the REST APIs available for the Dental Kart Nepal platform. These APIs can be used to build mobile applications or any other client applications.

Base URL: `http://localhost:5000/api` (Development)

## Authentication APIs

All authenticated routes require a Bearer token to be included in the Authorization header:
```
Authorization: Bearer <your_token>
```

### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent to your email"
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Email already registered"
  }
  ```

### Verify Email (OTP)
- **URL**: `/auth/verify-email`
- **Method**: `POST`
- **Description**: Verify user's email using OTP
- **Request Body**:
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "isEmailVerified": true
    }
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Invalid verification code. Please try again."
  }
  ```

### Resend Verification OTP
- **URL**: `/auth/resend-verification`
- **Method**: `POST`
- **Description**: Resend email verification OTP
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "New OTP sent to your email"
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Email already verified"
  }
  ```

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user and get token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "isEmailVerified": boolean
    }
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Invalid credentials"
  }
  ```

### Get Current User
- **URL**: `/auth/me`
- **Method**: `GET`
- **Description**: Get currently logged in user's details
- **Authentication**: Required
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "isEmailVerified": boolean
    }
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Not authorized to access this route"
  }
  ```

### Forgot Password
- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Description**: Request password reset email
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "User not found"
  }
  ```

### Reset Password
- **URL**: `/auth/reset-password/:token`
- **Method**: `PUT`
- **Description**: Reset password using reset token
- **Parameters**:
  - `token`: Reset password token received in email
- **Request Body**:
  ```json
  {
    "password": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successful"
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Invalid or expired reset token"
  }
  ```

### Logout
- **URL**: `/auth/logout`
- **Method**: `GET`
- **Description**: Logout user (clears token on client side)
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

## Product APIs

### Create Product
- **URL**: `/api/products`
- **Method**: `POST`
- **Description**: Create a new product
- **Authentication**: Required (Admin or Vendor)
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "price": "number",
    "specialOfferPrice": "number",
    "category": "category_id",
    "brand": "brand_id",
    "vendor": "vendor_id",
    "stock": "number",
    "images": ["string"],
    "status": "active|inactive|draft",
    "isDraft": "boolean",
    "tags": ["string"],
    "attributes": [{"name": "string", "value": "string"}],
    "variants": [{"attribute": "string", "values": ["string"]}]
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "description": "string",
      // Rest of product data
    },
    "message": "Product created successfully"
  }
  ```

### Get Products
- **URL**: `/api/products`
- **Method**: `GET`
- **Description**: Get all products with filters
- **Query Parameters**:
  - `status`: Filter by status (active|inactive)
  - `category`: Filter by category ID
  - `brand`: Filter by brand ID
  - `vendor`: Filter by vendor ID
  - `search`: Search term
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `sortBy`: Field to sort by
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `showDrafts`: Show draft products (admin/vendor only)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "id": "string",
          "name": "string",
          "price": "number",
          // Rest of product data
        }
      ],
      "pagination": {
        "total": "number",
        "page": "number",
        "pages": "number",
        "limit": "number"
      }
    }
  }
  ```

### Get Product
- **URL**: `/api/products/:id`
- **Method**: `GET`
- **Description**: Get product by ID
- **Parameters**:
  - `id`: Product ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      // Rest of product data
    },
    "message": "Product retrieved successfully"
  }
  ```

### Get Product by Slug
- **URL**: `/api/products/slug/:slug`
- **Method**: `GET`
- **Description**: Get product by slug
- **Parameters**:
  - `slug`: Product slug
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "slug": "string",
      // Rest of product data
    },
    "message": "Product retrieved successfully"
  }
  ```

### Update Product
- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **Description**: Update a product
- **Authentication**: Required (Admin or Vendor)
- **Parameters**:
  - `id`: Product ID
- **Request Body**: Same as Create Product
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      // Rest of product data
    },
    "message": "Product updated successfully"
  }
  ```

### Delete Product
- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **Description**: Delete a product
- **Authentication**: Required (Admin or Vendor)
- **Parameters**:
  - `id`: Product ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Product deleted successfully"
  }
  ```

### Toggle Product Status
- **URL**: `/api/products/:id/toggle-status`
- **Method**: `PATCH`
- **Description**: Toggle product status between active and inactive
- **Authentication**: Required (Admin or Vendor)
- **Parameters**:
  - `id`: Product ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "status": "string",
    },
    "message": "Product status updated successfully"
  }
  ```

### Get Related Products
- **URL**: `/api/products/:id/related`
- **Method**: `GET`
- **Description**: Get products related to the specified product
- **Parameters**:
  - `id`: Product ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        // Brief product data
      }
    ]
  }
  ```

### Publish Draft Product
- **URL**: `/api/products/:id/publish`
- **Method**: `PATCH`
- **Description**: Change a draft product to active status
- **Authentication**: Required (Admin or Vendor)
- **Parameters**:
  - `id`: Product ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "status": "active",
      "isDraft": false,
    },
    "message": "Product published successfully"
  }
  ```

## Category APIs

### Create Category
- **URL**: `/api/categories`
- **Method**: `POST`
- **Description**: Create a new category
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "image": "string",
    "parentId": "category_id",
    "status": "active|inactive",
    "featured": "boolean"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "slug": "string",
      // Rest of category data
    },
    "message": "Category created successfully"
  }
  ```

### Get All Categories
- **URL**: `/api/categories`
- **Method**: `GET`
- **Description**: Get all categories (with tree structure)
- **Query Parameters**:
  - `status`: Filter by status (active|inactive)
  - `featured`: Filter by featured flag (true|false)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        "children": [
          {
            "id": "string",
            "name": "string",
            "slug": "string",
            // More nested children
          }
        ]
      }
    ],
    "message": "Categories retrieved successfully"
  }
  ```

### Get Category by ID
- **URL**: `/api/categories/:id`
- **Method**: `GET`
- **Description**: Get a specific category by ID
- **Parameters**:
  - `id`: Category ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "slug": "string",
      "children": [
        // Children categories
      ]
    },
    "message": "Category retrieved successfully"
  }
  ```

### Update Category
- **URL**: `/api/categories/:id`
- **Method**: `PUT`
- **Description**: Update a category
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Category ID
- **Request Body**: Same as Create Category
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      // Rest of category data
    },
    "message": "Category updated successfully"
  }
  ```

### Delete Category
- **URL**: `/api/categories/:id`
- **Method**: `DELETE`
- **Description**: Delete a category and its subcategories
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Category ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Category and all subcategories deleted successfully"
  }
  ```

## Brand APIs

### Create Brand
- **URL**: `/api/brands`
- **Method**: `POST`
- **Description**: Create a new brand
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "picture": "string",
    "tags": ["string"],
    "metaTitle": "string",
    "metaDescription": "string",
    "keywords": "string",
    "featured": "boolean",
    "status": "active|inactive"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "slug": "string",
      // Rest of brand data
    },
    "message": "Brand created successfully"
  }
  ```

### Get All Brands
- **URL**: `/api/brands`
- **Method**: `GET`
- **Description**: Get all brands
- **Query Parameters**:
  - `status`: Filter by status (active|inactive)
  - `featured`: Filter by featured flag (true|false)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        // Rest of brand data
      }
    ],
    "message": "Brands retrieved successfully"
  }
  ```

### Get Brand by ID
- **URL**: `/api/brands/:id`
- **Method**: `GET`
- **Description**: Get a specific brand by ID
- **Parameters**:
  - `id`: Brand ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "slug": "string",
      // Rest of brand data
    },
    "message": "Brand retrieved successfully"
  }
  ```

### Get Brand by Slug
- **URL**: `/api/brands/slug/:slug`
- **Method**: `GET`
- **Description**: Get a specific brand by slug
- **Parameters**:
  - `slug`: Brand slug
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "slug": "string",
      // Rest of brand data
    },
    "message": "Brand retrieved successfully"
  }
  ```

### Update Brand
- **URL**: `/api/brands/:id`
- **Method**: `PUT`
- **Description**: Update a brand
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Brand ID
- **Request Body**: Same as Create Brand
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      // Rest of brand data
    },
    "message": "Brand updated successfully"
  }
  ```

### Delete Brand
- **URL**: `/api/brands/:id`
- **Method**: `DELETE`
- **Description**: Delete a brand
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Brand ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Brand deleted successfully"
  }
  ```

### Toggle Brand Featured Status
- **URL**: `/api/brands/:id/toggle-featured`
- **Method**: `PATCH`
- **Description**: Toggle brand featured status
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Brand ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "featured": "boolean",
    },
    "message": "Brand featured status updated successfully"
  }
  ```

### Toggle Brand Status
- **URL**: `/api/brands/:id/toggle-status`
- **Method**: `PATCH`
- **Description**: Toggle brand status (active/inactive)
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Brand ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "status": "string",
    },
    "message": "Brand status updated successfully"
  }
  ```

## Media APIs

### Upload Media
- **URL**: `/api/media/upload`
- **Method**: `POST`
- **Description**: Upload one or more media files
- **Authentication**: Required
- **Request Body**:
  - Form data with field 'files' containing the file(s)
  - Optional field 'resize' with value 'original', 'product', or 'thumbnail'
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "url": "string",
        "size": "number",
        "resizeOption": "string",
        "createdAt": "string"
      }
    ]
  }
  ```

### Get All Media
- **URL**: `/api/media`
- **Method**: `GET`
- **Description**: Get all media items
- **Authentication**: Required
- **Success Response**:
  ```json
  {
    "success": true,
    "media": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "url": "string",
        "size": "number",
        "resizeOption": "string",
        "createdAt": "string",
        "createdBy": "string"
      }
    ]
  }
  ```

### Delete Media
- **URL**: `/api/media/:id`
- **Method**: `DELETE`
- **Description**: Delete a media item
- **Authentication**: Required
- **Parameters**:
  - `id`: Media ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

## Vendor APIs

### Create Vendor
- **URL**: `/api/vendors`
- **Method**: `POST`
- **Description**: Create a new vendor account (admin only)
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "primaryPhone": "string",
    "secondaryPhone": "string",
    "city": "string",
    "companyRegistrationCertificate": "string",
    "vatNumber": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      // Rest of vendor data
    }
  }
  ```

### Vendor Login
- **URL**: `/api/vendors/login`
- **Method**: `POST`
- **Description**: Authenticate a vendor
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      "primaryPhone": "string",
      "status": "string",
      "isLoginAllowed": "boolean"
    }
  }
  ```

### Admin Login as Vendor
- **URL**: `/api/vendors/admin-login`
- **Method**: `POST`
- **Description**: Allow admin to login as a vendor
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      "primaryPhone": "string",
      "status": "string",
      "isLoginAllowed": "boolean",
      "adminAccess": true
    }
  }
  ```

### Get All Vendors
- **URL**: `/api/vendors`
- **Method**: `GET`
- **Description**: Get all vendors (admin only)
- **Authentication**: Required (Admin)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        // Rest of vendor data
      }
    ]
  }
  ```

### Get Vendor by ID
- **URL**: `/api/vendors/:id`
- **Method**: `GET`
- **Description**: Get a specific vendor by ID (admin only)
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Vendor ID
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      // Rest of vendor data
    }
  }
  ```

### Update Vendor by ID
- **URL**: `/api/vendors/:id`
- **Method**: `PUT`
- **Description**: Update a vendor (admin only)
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: Vendor ID
- **Request Body**: Same as Create Vendor, with additional fields:
  ```json
  {
    "status": "active|pending|inactive",
    "isLoginAllowed": "boolean"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      // Rest of vendor data
    }
  }
  ```

### Get Vendor Profile
- **URL**: `/api/vendors/profile`
- **Method**: `GET`
- **Description**: Get the current vendor's profile
- **Authentication**: Required (Vendor)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      // Rest of vendor data
    }
  }
  ```

### Update Vendor Profile
- **URL**: `/api/vendors/profile`
- **Method**: `PUT`
- **Description**: Update the current vendor's profile
- **Authentication**: Required (Vendor)
- **Request Body**: Vendor profile data
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      // Rest of vendor data
    }
  }
  ```

### Change Vendor Password
- **URL**: `/api/vendors/change-password`
- **Method**: `PUT`
- **Description**: Change the current vendor's password
- **Authentication**: Required (Vendor)
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

## Settings APIs

### Get Public Homepage Settings
- **URL**: `/api/settings/homepage`
- **Method**: `GET`
- **Description**: Get public homepage settings
- **Success Response**:
  ```json
  {
    "success": true,
    "settings": {
      "featuredProductsTitle": "string",
      "featuredProductsSubtitle": "string",
      "newArrivalsTitle": "string",
      "newArrivalsSubtitle": "string",
      "showNewsletter": "boolean",
      "showTestimonials": "boolean",
      "showBrands": "boolean",
      "newsletterTitle": "string",
      "newsletterSubtitle": "string"
    },
    "heroSlides": [
      {
        "image": "string",
        "link": "string",
        "order": "number"
      }
    ],
    "featuredCategories": [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        "image": "string"
      }
    ]
  }
  ```

### Get Homepage Settings (Admin)
- **URL**: `/api/admin/settings/homepage`
- **Method**: `GET`
- **Description**: Get homepage settings (admin only)
- **Authentication**: Required (Admin)
- **Success Response**: Same as Get Public Homepage Settings

### Update Homepage Settings
- **URL**: `/api/admin/settings/homepage`
- **Method**: `POST`
- **Description**: Update homepage settings
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "settings": {
      "featuredProductsTitle": "string",
      "featuredProductsSubtitle": "string",
      "newArrivalsTitle": "string",
      "newArrivalsSubtitle": "string",
      "showNewsletter": "boolean",
      "showTestimonials": "boolean",
      "showBrands": "boolean",
      "newsletterTitle": "string",
      "newsletterSubtitle": "string"
    },
    "heroSlides": [
      {
        "image": "string",
        "link": "string",
        "order": "number"
      }
    ],
    "featuredCategoryIds": ["string"]
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "settings": {
      // Updated settings data
    },
    "heroSlides": [
      // Updated hero slides
    ],
    "featuredCategories": [
      // Updated featured categories
    ]
  }
  ```

## User Management APIs

### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Description**: Get all users (admin only)
- **Authentication**: Required (Admin)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "isEmailVerified": "boolean",
        "createdAt": "string"
      }
    ]
  }
  ```

### Update User Status
- **URL**: `/api/users/:id/status`
- **Method**: `PUT`
- **Description**: Update user status (admin only)
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: User ID
- **Request Body**:
  ```json
  {
    "status": "active|inactive"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "status": "string"
    }
  }
  ```

## Error Handling

All API endpoints return error responses in the following format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## Notes for Mobile App Developers

1. Store the JWT token securely after login/registration.
2. Include the token in all authenticated requests using the Authorization header.
3. Implement proper error handling for all API responses.
4. The OTP verification system has a 10-minute expiration time.
5. Password reset tokens expire after 10 minutes.
6. All authenticated routes require email verification.

For additional assistance or to report issues, please contact the backend team.