# Dental Kart Nepal API v2 Documentation Website

A modern, responsive documentation website for the DK Nepal API v2, built with HTML, CSS, and JavaScript.

## 🚀 Features

- **Modern Design**: Clean, professional interface with gradient backgrounds and smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, smooth transitions, and interactive components
- **Search Functionality**: Built-in search across all documentation pages
- **Code Highlighting**: Syntax highlighting for code examples
- **Copy to Clipboard**: One-click code copying functionality
- **Dark Mode Support**: Automatic dark mode detection and toggle
- **Mobile Navigation**: Collapsible sidebar for mobile devices
- **Progress Bar**: Reading progress indicator
- **Table of Contents**: Automatic generation for long pages

## 📁 File Structure

```
docs/
├── index.html              # Main overview page
├── authentication.html     # Authentication documentation
├── products.html          # Products API documentation
├── css/
│   └── style.css         # Main stylesheet
├── js/
│   └── main.js           # Main JavaScript functionality
├── README.md              # This file
└── assets/                # Images and other assets (if any)
```

## 🎨 Design System

### Color Palette
- **Primary**: `#667eea` to `#764ba2` (Gradient)
- **Secondary**: `#ff6b6b` (Accent)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Red)
- **Text**: `#1a202c` (Dark), `#64748b` (Medium), `#a0aec0` (Light)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Line Height**: 1.6

### Components
- **Cards**: White background with subtle shadows and rounded corners
- **Buttons**: Gradient backgrounds with hover effects
- **Tables**: Clean, bordered tables with hover effects
- **Code Blocks**: Dark theme with syntax highlighting

## 🛠️ Customization

### Adding New Pages

1. **Create HTML file**: Copy the structure from an existing page
2. **Update navigation**: Add the new page to the sidebar in all HTML files
3. **Update active states**: Set the correct `active` class in the sidebar
4. **Add content**: Follow the existing content structure

Example page structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - DK Nepal API v2</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/prism.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <!-- Sidebar (copy from existing page) -->
        <nav class="sidebar">...</nav>
        
        <!-- Main Content -->
        <main class="main-content">
            <header class="content-header">
                <h1>Page Title</h1>
                <p class="subtitle">Page description</p>
            </header>
            
            <div class="content-body">
                <!-- Your content here -->
            </div>
        </main>
    </div>
    
    <script src="js/prism.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### Adding New API Endpoints

Use the endpoint card structure:
```html
<div class="endpoint-card">
    <div class="endpoint-header">
        <span class="method post">POST</span>
        <code>/api/endpoint</code>
        <span class="protected">Protected</span>
    </div>
    <p>Endpoint description</p>
    
    <h4>Request Body:</h4>
    <pre><code class="language-json">{
  "key": "value"
}</code></pre>
    
    <h4>Response:</h4>
    <pre><code class="language-json">{
  "success": true,
  "data": {}
}</code></pre>
</div>
```

### Method Badges
- `get` - Green (`#10b981`)
- `post` - Blue (`#3b82f6`)
- `put` - Orange (`#f59e0b`)
- `patch` - Purple (`#8b5cf6`)
- `delete` - Red (`#ef4444`)

### Protection Level Badges
- `public` - Green (No authentication required)
- `protected` - Orange (Authentication required)
- `admin` - Red (Admin only)

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px

## 🔧 JavaScript Features

### Automatic Features
- Mobile menu toggle
- Copy to clipboard buttons
- Syntax highlighting
- Search functionality
- Table of contents generation
- Progress bar
- Scroll to top button
- Dark mode toggle (if user prefers dark mode)

### Utility Functions
```javascript
// Format API endpoint
MBNepalAPI.formatEndpoint('GET', '/api/products');

// Generate sample data
MBNepalAPI.generateSampleData('product');

// Validate API response
MBNepalAPI.validateResponse(response);
```

## 🎯 Content Guidelines

### Writing Style
- Use clear, concise language
- Include practical examples
- Provide complete request/response examples
- Use consistent formatting

### Code Examples
- Include multiple programming languages
- Show both simple and complex use cases
- Provide cURL examples for testing
- Include error handling examples

### Structure
- Start with an overview
- Explain key concepts
- Provide detailed API documentation
- Include code examples
- Add next steps/related content

## 🚀 Deployment

### Local Development
1. Open any HTML file in a web browser
2. All features work without a server
3. Use Live Server extension in VS Code for auto-reload

### Production Deployment
1. Upload all files to your web server
2. Ensure all paths are relative
3. Test all functionality after deployment
4. Consider using a CDN for external resources

### GitHub Pages
1. Push to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main`)
4. Your docs will be available at `https://username.github.io/repository-name/`

## 🔍 Search Functionality

The documentation includes a search feature that:
- Searches across all navigation items
- Filters results in real-time
- Shows/hides sections based on matches
- Works with keyboard shortcuts (Ctrl/Cmd + K)

## 🎨 Customization Tips

### Changing Colors
Update the CSS custom properties in `style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #ff6b6b;
}
```

### Adding New Icons
The documentation uses Font Awesome 6.0.0. Add new icons by:
1. Finding the icon on [Font Awesome](https://fontawesome.com/)
2. Using the appropriate class name
3. Adding it to your HTML

### Modifying Layout
- **Sidebar width**: Change `.sidebar { width: 280px; }`
- **Content padding**: Modify `.content-body { padding: 3rem; }`
- **Card spacing**: Adjust margins and padding in component classes

## 📚 Dependencies

### External Libraries
- **Font Awesome**: Icons
- **Google Fonts**: Typography
- **Prism.js**: Code syntax highlighting

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 📄 License

This documentation website is part of the Dental Kart Nepal project.

## 🆘 Support

For questions or issues with the documentation website:
1. Check this README first
2. Review the existing code structure
3. Create an issue in the repository
4. Contact the development team

---

**Happy documenting! 🎉**
