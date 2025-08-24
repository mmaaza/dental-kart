## Flutter Guide: Loading Images from Dental Kart Nepal `/uploads`

This document explains how Flutter apps should construct and load image URLs that are stored under the public `uploads/` directory on the production site.

### What you need to know
- **Public base URL**: `https://medicalbazzarnepal.com`
- **Static image root**: `/uploads`
- **Payment screenshots**: `/uploads/payments`
- **API returns relative paths** like `/uploads/<filename>`; the app must prepend the base URL to form a full URL.

### How the backend exposes image paths
The backend stores and returns image URLs as relative paths under `/uploads` (and `/uploads/payments` for payment screenshots). These are intended to be joined with the public base URL on the client side.

```120:123:backend/src/controllers/media.controller.js
// Store URL path relative to the frontend public directory
const url = `/uploads/${path.basename(processedPath)}`;
```

```152:155:backend/src/controllers/order.controller.js
// Create paymentScreenshot field if we have req.file (for pay-now method)
const paymentScreenshot = req.file ? `/uploads/payments/${path.basename(req.file.path)}` : undefined;
```

### Production URL pattern
- Example actual file on prod: `https://medicalbazzarnepal.com/uploads/<filename>`
- Payment example: `https://medicalbazzarnepal.com/uploads/payments/<filename>`

Reference example (live):
- [`https://medicalbazzarnepal.com/uploads/1753894494549-972326881-31qIc2xyrqL.jpg_BO30_255_255_255_UF900_850_SR1910_1000_0_C_QL100_.jpg`](https://medicalbazzarnepal.com/uploads/1753894494549-972326881-31qIc2xyrqL.jpg_BO30_255_255_255_UF900_850_SR1910_1000_0_C_QL100_.jpg)

## Flutter implementation

### 1) Environment config
Define the public base URL per environment. Keep this in a single place.

```dart
// lib/config/app_config.dart
class AppConfig {
  AppConfig._();

  // Prod
  static const String publicBaseUrl = 'https://medicalbazzarnepal.com';

  // If you ever run a staging site, switch here:
  // static const String publicBaseUrl = 'https://staging.medicalbazzarnepal.com';
}
```

### 2) URL resolver helper
Safely convert an API path (relative or absolute) into a full URL.

```dart
// lib/utils/url_utils.dart
import 'package:meta/meta.dart';
import '../config/app_config.dart';

@immutable
class UrlUtils {
  const UrlUtils._();

  static String resolveImageUrl(String? path) {
    if (path == null || path.trim().isEmpty) return '';
    final value = path.trim();
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    // Ensure no double slashes when joining
    final base = AppConfig.publicBaseUrl.endsWith('/')
        ? AppConfig.publicBaseUrl.substring(0, AppConfig.publicBaseUrl.length - 1)
        : AppConfig.publicBaseUrl;
    final rel = value.startsWith('/') ? value : '/$value';
    return '$base$rel';
  }
}
```

### 3) Basic usage

```dart
// From product.images[0] returned by API, e.g. "/uploads/abc.jpg"
final imageUrl = UrlUtils.resolveImageUrl(product.images.first);

// Core widget
Image.network(
  imageUrl,
  fit: BoxFit.cover,
);
```

### 4) Recommended: cached_network_image
Add to `pubspec.yaml`:

```yaml
dependencies:
  cached_network_image: ^3.3.1
```

Use it with placeholders and error widgets:

```dart
import 'package:cached_network_image/cached_network_image.dart';

CachedNetworkImage(
  imageUrl: UrlUtils.resolveImageUrl(product.images.first),
  fit: BoxFit.cover,
  placeholder: (context, url) => const SizedBox(
    height: 40,
    width: 40,
    child: CircularProgressIndicator(strokeWidth: 2),
  ),
  errorWidget: (context, url, error) => const Icon(Icons.broken_image),
);
```

### 5) Payment screenshot example

```dart
final screenshotUrl = UrlUtils.resolveImageUrl('/uploads/payments/$fileName');
Image.network(screenshotUrl);
```

## Handling edge cases
- **Already absolute URLs**: `UrlUtils.resolveImageUrl` returns the input unchanged if it starts with `http://` or `https://`.
- **Null or empty paths**: Return an empty string and render a fallback (e.g., placeholder icon).
- **Web builds (Flutter Web)**: Images are fetched cross-origin from `https://medicalbazzarnepal.com`. Standard `<img>` fetches are allowed without CORS headers; only canvas operations would require CORS.
- **Timeouts/retries**: Consider wrapping with your own retry logic if necessary.

Example with graceful fallback:

```dart
Widget productImageOrFallback(String? relativePath) {
  final url = UrlUtils.resolveImageUrl(relativePath);
  if (url.isEmpty) {
    return const Icon(Icons.image_not_supported);
  }
  return CachedNetworkImage(
    imageUrl: url,
    fit: BoxFit.cover,
    placeholder: (context, _) => const SizedBox(
      height: 40,
      width: 40,
      child: CircularProgressIndicator(strokeWidth: 2),
    ),
    errorWidget: (context, _, __) => const Icon(Icons.broken_image),
  );
}
```

## Performance and caching tips
- Prefer `CachedNetworkImage` for built-in disk/memory caching.
- Specify sizes (`width`/`height`) to reduce layout shifts.
- Use `fit: BoxFit.cover` or appropriate `fit` for grids and cards.
- If you later add thumbnail variants in the API, prefer those for lists and the full image on detail views.

## Dev and staging setups
- Keep `AppConfig.publicBaseUrl` environment-specific.
- If you run a local reverse proxy that serves `/uploads`, set the base URL to your local domain.
- For local Android emulator hitting a LAN server, ensure the device can reach the hostname (or use the machine IP).

## Quick checklist
- API returns `/uploads/...` → join with `https://medicalbazzarnepal.com`.
- Use `UrlUtils.resolveImageUrl` everywhere you need an image URL.
- Prefer `CachedNetworkImage` with placeholders and error widgets.

## References
- Live asset example: [`https://medicalbazzarnepal.com/uploads/1753894494549-972326881-31qIc2xyrqL.jpg_BO30_255_255_255_UF900_850_SR1910_1000_0_C_QL100_.jpg`](https://medicalbazzarnepal.com/uploads/1753894494549-972326881-31qIc2xyrqL.jpg_BO30_255_255_255_UF900_850_SR1910_1000_0_C_QL100_.jpg)


