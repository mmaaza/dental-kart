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
          50: '#f8fbfd',
          100: '#e8f4f8',
          200: '#d1e9f1',
          300: '#a3d2e7',
          400: '#6bb5d8',
          500: '#033f63', // Deep Ocean
          600: '#2a5a7d',
          700: '#1e4861',
          800: '#123650',
          900: '#0a2742',
          950: '#051a33',
        },
        secondary: {
          50: '#f6f9f9',
          100: '#e8f1f1',
          200: '#d1e3e3',
          300: '#9fc7c8',
          400: '#5a9fa5',
          500: '#28666e', // Teal Harbor
          600: '#3d7d85',
          700: '#356b73',
          800: '#2d5960',
          900: '#24484e',
          950: '#1b373c',
        },
        accent: {
          50: '#f8faf8',
          100: '#f0f4f1',
          200: '#e1e8e2',
          300: '#c3d1c5',
          400: '#9eb5a5',
          500: '#7c9885', // Sage Green
          600: '#8aaa93',
          700: '#6d8a76',
          800: '#5c7663',
          900: '#4b6151',
          950: '#3a4d40',
        },
        // New admin color scheme
        admin: {
          prussian: {
            DEFAULT: '#b5b682',
            100: '#fafaf5',
            200: '#f4f4ea',
            300: '#eeeedd',
            400: '#d6d3a8',
            500: '#b5b682', // Desert Sand
            600: '#c2c090',
            700: '#a8a574',
            800: '#8e8b61',
            900: '#74714e',
            950: '#5a573b'
          },
          indigo: {
            DEFAULT: '#fedc97',
            100: '#fffcf7',
            200: '#fef8ed',
            300: '#fef0d2',
            400: '#fee4b0',
            500: '#fedc97', // Warm Cream
            600: '#fed07d',
            700: '#fcc254',
            800: '#e5a83c',
            900: '#cc9132',
            950: '#b37a28'
          },
          ucla: {
            DEFAULT: '#033f63',
            100: '#f7fafe',
            200: '#e6f2fc',
            300: '#cce5f8',
            400: '#99ccf0',
            500: '#033f63', // Deep Ocean
            600: '#1a5a84',
            700: '#0f4670',
            800: '#06355c',
            900: '#032a4a',
            950: '#011f38'
          },
          cerulean: {
            DEFAULT: '#28666e',
            100: '#f5f9f9',
            200: '#e6f1f2',
            300: '#cce3e5',
            400: '#99c7ca',
            500: '#28666e', // Teal Harbor
            600: '#4a8189',
            700: '#3a6d74',
            800: '#2e5960',
            900: '#22454b',
            950: '#163237'
          },
          sky: {
            DEFAULT: '#7c9885',
            100: '#f9fbf9',
            200: '#f1f6f2',
            300: '#e3ede5',
            400: '#c7daca',
            500: '#7c9885', // Sage Green
            600: '#95b39e',
            700: '#6b8974',
            800: '#5a7462',
            900: '#495f50',
            950: '#384a3e'
          },
          light: {
            DEFAULT: '#fedc97',
            100: '#fffdf9',
            200: '#fffaf0',
            300: '#fef4dc',
            400: '#feecbb',
            500: '#fedc97', // Warm Cream
            600: '#fed685',
            700: '#fdc960',
            800: '#f5b742',
            900: '#e6a332',
            950: '#d18f22'
          },
          slate: {
            DEFAULT: '#475569',
            50: '#f8f9fa',
            100: '#f1f3f4',
            200: '#e3e6e8',
            300: '#ced4d8',
            400: '#9ca8b2',
            500: '#6a7a8a',
            600: '#475569',
            700: '#3d4a58',
            800: '#2e3a47',
            900: '#1f2a36',
            950: '#141d26'
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
