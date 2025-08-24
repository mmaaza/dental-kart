# Meta Pixel Integration Guide

This project includes comprehensive Meta Pixel (Facebook Pixel) integration for tracking user interactions and optimizing your Facebook and Instagram advertising campaigns.

## 🚀 Quick Setup

### 1. Replace Pixel ID
The Pixel ID is already configured in `src/config/metaPixel.js`:
```javascript
PIXEL_ID: '774780844933696'
```

If you need to change it:
1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Navigate to Events Manager
3. Select your Pixel
4. Copy the Pixel ID and update the config file

### 2. Environment Configuration
By default, tracking is:
- **Disabled** in development
- **Enabled** in production

To enable tracking in development, update `src/config/metaPixel.js`:
```javascript
ENABLED: {
  development: true, // Change to true
  production: true,
}
```

## 📊 Tracked Events

### Standard Events (Automatically Tracked)

| Event | When Triggered | Data Tracked |
|-------|----------------|--------------|
| `PageView` | Page navigation | URL, referrer |
| `ViewContent` | Product page load | Product ID, name, category, price |
| `AddToCart` | Add product to cart | Product details, quantity, value |
| `InitiateCheckout` | Start checkout process | Cart contents, total value |
| `Purchase` | Order completion | Order details, total value |
| `Search` | Product search | Search query, result count |

### Custom Events (Available)

| Event | Function | Purpose |
|-------|----------|---------|
| `AddToWishlist` | `trackAddToWishlist()` | Product wishlisted |
| `Lead` | `trackLead()` | Contact form submissions |
| `CompleteRegistration` | `trackCompleteRegistration()` | User registration |

## 🔧 Implementation Details

### 1. Base Setup
Meta Pixel is initialized in `index.html` and page tracking is handled automatically by the `useMetaPixelPageTracking` hook in `App.jsx`.

### 2. Cart Tracking
- **Add to Cart**: Tracked in `CartContext.jsx` when items are added
- **Initiate Checkout**: Tracked when user proceeds from cart to shipping details
- **Purchase**: Tracked when order is successfully completed

### 3. Product Tracking
- **View Content**: Tracked in `ProductDetailPage.jsx` when product loads

### 4. Search Tracking
- **Search**: Tracked in `SearchContext.jsx` when users perform searches

## 🛠️ Custom Implementation

### Track Custom Events
```javascript
import { trackCustomEvent } from '../utils/metaPixel';

// Example: Newsletter signup
trackCustomEvent('Newsletter_Signup', {
  content_name: 'Footer Newsletter',
  value: 0,
  currency: 'NPR'
});
```

### Track Additional Product Events
```javascript
import { trackViewContent, formatProductData } from '../utils/metaPixel';

const product = { id: '123', name: 'Product Name', price: 1500 };
const productData = formatProductData(product);
trackViewContent(productData);
```

### Track Cart Events
```javascript
import { trackAddToCart, formatCartData } from '../utils/metaPixel';

const cartItems = [
  { id: '123', price: 1500, quantity: 1 },
  { id: '124', price: 2000, quantity: 2 }
];
const cartData = formatCartData(cartItems);
trackAddToCart(cartData);
```

## 📈 Verification

### 1. Browser Console
Check for Meta Pixel events in browser console:
```javascript
// View recent events
window.fbq.getEventHistory()

// Check if pixel is loaded
window.fbq.loaded // should return true
```

### 2. Facebook Events Manager
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Click on "Test Events" to see live events
4. Navigate through your site to verify events are firing

### 3. Facebook Pixel Helper (Browser Extension)
Install the [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension to debug pixel events in real-time.

## 🔍 Troubleshooting

### Events Not Firing
1. Check console for JavaScript errors
2. Verify `isPixelEnabled()` returns `true` in `src/config/metaPixel.js`
3. Ensure Pixel ID is correct
4. Check network tab for `fbevents.js` load

### Testing in Development
```javascript
// Temporarily enable development tracking
const META_PIXEL_CONFIG = {
  ENABLED: {
    development: true, // Set to true for testing
    production: true,
  }
};
```

### Common Issues
- **AdBlockers**: May block pixel from loading
- **GDPR/Privacy**: Consider implementing consent management
- **iOS 14.5+**: Limited tracking due to App Tracking Transparency

## 📝 Event Parameters

### Standard Parameters
- `content_ids`: Array of product/content IDs
- `content_name`: Product or content name
- `content_category`: Product category
- `value`: Monetary value
- `currency`: Currency code (default: 'NPR')
- `num_items`: Number of items

### Custom Parameters
You can add custom parameters to any event:
```javascript
trackPurchase({
  value: 5000,
  currency: 'NPR',
  content_ids: ['123', '124'],
  custom_parameter: 'custom_value'
});
```

## 🎯 Optimization Tips

### 1. Audience Building
Events help build custom audiences for:
- Website visitors
- Product viewers
- Cart abandoners
- Purchasers

### 2. Campaign Optimization
Use events to optimize for:
- `Purchase` for conversion campaigns
- `AddToCart` for cart conversion campaigns
- `ViewContent` for awareness campaigns

### 3. Attribution
Events improve attribution accuracy across:
- Facebook and Instagram ads
- Cross-device tracking
- Conversion reporting

## 🔐 Privacy Considerations

### Data Minimization
Only essential data is tracked. Sensitive information like:
- Personal details
- Payment information
- Passwords
are never sent to Meta.

### Consent Management
Consider implementing consent management for GDPR compliance:
```javascript
// Example consent check
if (userConsented) {
  trackPurchase(purchaseData);
}
```

## 📚 Resources

- [Meta Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Standard Events Reference](https://developers.facebook.com/docs/facebook-pixel/reference)
- [Facebook Events Manager](https://business.facebook.com/events_manager)
- [Pixel Helper Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

## 🎉 Next Steps

1. **Test Events**: Navigate through your site and verify events in Events Manager
2. **Create Audiences**: Use tracked events to build custom audiences
3. **Set Up Campaigns**: Use events for campaign optimization
4. **Monitor Performance**: Track conversion rates and campaign performance

Your Meta Pixel integration is now complete and ready for production! 🚀
