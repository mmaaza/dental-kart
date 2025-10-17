/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    // Establishing mobile-first breakpoints
    screens: {
      'xs': '380px',    // Extra small devices
      'sm': '640px',    // Small devices
      'md': '768px',    // Medium devices
      'lg': '1024px',   // Large devices
      'xl': '1280px',   // Extra large devices
      '2xl': '1536px',  // 2X large devices
    },
    extend: {
      colors: {
        primary: {
          50: '#f7fef7',
          100: '#ecfced',
          200: '#d4f8d4',
          300: '#aaf0aa',
          400: '#7ae47a',
          500: '#5a7c2a', // Dark Chartreuse - excellent contrast
          600: '#4a6b20', // Dark Lime - excellent contrast
          700: '#3d5518', // Dark Olive - excellent contrast
          800: '#2f4012', // Dark Pickle - excellent contrast
          900: '#1f2a0c', // Dark Seaweed - excellent contrast
          950: '#0f1506',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1a6b4a', // Dark Seafoam - excellent contrast
          600: '#2a7c5a', // Dark Mint - excellent contrast
          700: '#1e5d2d', // Dark Parakeet - excellent contrast
          800: '#165020', // Dark Shamrock - excellent contrast
          900: '#0d3c18',
          950: '#062510',
        },
        accent: {
          50: '#f7fdf7',
          100: '#edfbed',
          200: '#d8f5d8',
          300: '#b8ebb8',
          400: '#90dc90',
          500: '#4a6b20', // Dark Pear - excellent contrast
          600: '#3d5518', // Dark Sage - excellent contrast
          700: '#006a2b', // Dark Emerald - excellent contrast
          800: '#2f4012', // Dark Pickle - excellent contrast
          900: '#1f2a0c', // Dark Seaweed - excellent contrast
          950: '#0f1506',
        },
        // New admin color scheme
        admin: {
          prussian: {
            DEFAULT: '#1f2937',
            100: '#f9fafb',
            200: '#f3f4f6',
            300: '#e5e7eb',
            400: '#9ca3af',
            500: '#6b7280', // Gray
            600: '#4b5563', // Dark Gray
            700: '#374151', // Darker Gray
            800: '#1f2937', // Very Dark Gray
            900: '#111827', // Almost Black
            950: '#030712' // Deep Black
          },
          indigo: {
            DEFAULT: '#374151',
            100: '#f9fafb',
            200: '#f3f4f6',
            300: '#e5e7eb',
            400: '#9ca3af',
            500: '#6b7280', // Gray
            600: '#4b5563', // Dark Gray
            700: '#374151', // Darker Gray
            800: '#1f2937', // Very Dark Gray
            900: '#111827', // Almost Black
            950: '#030712' // Deep Black
          },
          ucla: {
            DEFAULT: '#111827',
            100: '#f9fafb',
            200: '#f3f4f6',
            300: '#e5e7eb',
            400: '#9ca3af',
            500: '#6b7280', // Gray
            600: '#4b5563', // Dark Gray
            700: '#374151', // Darker Gray
            800: '#1f2937', // Very Dark Gray
            900: '#111827', // Almost Black
            950: '#030712' // Deep Black
          },
          cerulean: {
            DEFAULT: '#4b5563',
            100: '#f9fafb',
            200: '#f3f4f6',
            300: '#e5e7eb',
            400: '#9ca3af',
            500: '#6b7280', // Gray
            600: '#4b5563', // Dark Gray
            700: '#374151', // Darker Gray
            800: '#1f2937', // Very Dark Gray
            900: '#111827', // Almost Black
            950: '#030712' // Deep Black
          },
          sky: {
            DEFAULT: '#6b7280',
            100: '#f9fafb',
            200: '#f3f4f6',
            300: '#e5e7eb',
            400: '#9ca3af',
            500: '#6b7280', // Gray
            600: '#4b5563', // Dark Gray
            700: '#374151', // Darker Gray
            800: '#1f2937', // Very Dark Gray
            900: '#111827', // Almost Black
            950: '#030712' // Deep Black
          },
          light: {
            DEFAULT: '#f9fafb',
            100: '#f9fafb',
            200: '#f3f4f6',
            300: '#e5e7eb',
            400: '#d1d5db',
            500: '#9ca3af', // Light Gray
            600: '#6b7280', // Gray
            700: '#4b5563', // Dark Gray
            800: '#374151', // Darker Gray
            900: '#1f2937', // Very Dark Gray
            950: '#111827' // Almost Black
          },
          slate: {
            DEFAULT: '#475569',
            50: '#f8f9fa',
            100: '#f1f3f4',
            200: '#e3e6e8',
            300: '#ced4d8',
            400: '#9ca8b2',
            500: '#475569', // Slate Gray
            600: '#374151', // Dark Slate
            700: '#1f2937', // Very Dark Slate
            800: '#111827', // Almost Black Slate
            900: '#030712', // Deep Black
            950: '#000000' // Pure Black
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      // Enhanced typography scale for mobile-first design
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px for very small text
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1.16' }],          // 48px
        // Mobile-specific heading sizes
        'mobile-h1': ['2rem', { lineHeight: '1.2' }],     // 32px
        'mobile-h2': ['1.5rem', { lineHeight: '1.3' }],   // 24px
        'mobile-h3': ['1.25rem', { lineHeight: '1.4' }],  // 20px
        'mobile-h4': ['1.125rem', { lineHeight: '1.5' }], // 18px
        // Mobile-specific body sizes
        'mobile-body': ['1rem', { lineHeight: '1.5' }],   // 16px
        'mobile-small': ['0.875rem', { lineHeight: '1.4' }], // 14px
      },
      // Enhanced spacing system for mobile-first design
      spacing: {
        // Base spacing units
        '0': '0',
        'px': '1px',
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px - minimum touch target padding
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px - standard mobile inner spacing
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px - standard mobile container padding
        // Mobile-optimized larger spaces
        '18': '4.5rem',     // 72px
        '72': '18rem',      // 288px
        '84': '21rem',      // 336px
        '96': '24rem',      // 384px
        // Touch-friendly spacing
        'touch-min': '2.75rem',     // 44px - minimum touch target
        'touch-safe': '3rem',       // 48px - comfortable touch target
        'touch-large': '3.5rem',    // 56px - large touch target
      },
      // Mobile-optimized height units
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
        'screen-nav': 'calc(100vh - 4rem)', // Accounts for bottom navigation
        'header': '3.5rem',    // 56px - mobile header height
        'nav-item': '3rem',    // 48px - navigation item height
      },
      // Mobile-safe padding
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Enhanced border radius for mobile UI
      borderRadius: {
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'mobile': '0.5rem',    // Standard mobile corner radius
        'mobile-lg': '1rem',   // Large mobile corner radius
        'mobile-full': '9999px', // Full rounded for mobile buttons
      },
      // Mobile-optimized shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Mobile-specific shadows
        'mobile': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'mobile-lg': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'bottom-nav': '0 -2px 10px rgba(0, 0, 0, 0.1)',
      },
      // Container configurations for mobile
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',     // 16px padding by default
          'xs': '1rem',        // 16px for extra small
          'sm': '1.5rem',      // 24px for small
          'md': '2rem',        // 32px for medium
          'lg': '4rem',        // 64px for large
          'xl': '5rem',        // 80px for extra large
          '2xl': '6rem',       // 96px for 2xl
        },
      },
      // Z-index scale for mobile elements
      zIndex: {
        'behind': -1,
        'default': 1,
        'sticky': 100,
        'header': 1000,
        'modal': 1100,
        'overlay': 1200,
        'toast': 1300,
        'tooltip': 1400,
      },
    },
  },
  // Add default variants for mobile-first approach
  variants: {
    extend: {
      padding: ['responsive', 'hover', 'focus'],
      margin: ['responsive', 'first', 'last'],
      width: ['responsive', 'hover', 'focus'],
      height: ['responsive'],
      backgroundColor: ['responsive', 'hover', 'focus', 'active'],
      textColor: ['responsive', 'hover', 'focus', 'active'],
      scale: ['responsive', 'hover', 'focus', 'active'],
      opacity: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
      translate: ['responsive', 'hover', 'focus', 'active'],
    },
  },
  plugins: [
    function({ addUtilities }) {
      const scrollbarUtilities = {
        '.scrollbar-admin': {
          '&::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'var(--admin-prussian-200, #00111e)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--admin-ucla-500, #2a6f97)',
            borderRadius: '6px',
            border: '3px solid var(--admin-prussian-200, #00111e)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--admin-ucla-600, #3a93c7)',
          },
          scrollbarWidth: 'auto',
          scrollbarColor: 'var(--admin-ucla-500, #2a6f97) var(--admin-prussian-200, #00111e)',
        },
      };
      addUtilities(scrollbarUtilities, ['dark']);
    },
  ],
};
