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
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        secondary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Main red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Main yellow
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        // New admin color scheme
        admin: {
          prussian: {
            DEFAULT: '#012a4a',
            100: '#00090f',
            200: '#00111e',
            300: '#011a2d',
            400: '#01233c',
            500: '#012a4a',
            600: '#025ca1',
            700: '#048df6',
            800: '#54b4fc',
            900: '#aad9fe'
          },
          indigo: {
            DEFAULT: '#013a63',
            100: '#000c14',
            200: '#001828',
            300: '#01243d',
            400: '#012f51',
            500: '#013a63',
            600: '#026bb6',
            700: '#0d99fd',
            800: '#5dbbfd',
            900: '#aeddfe'
          },
          ucla: {
            DEFAULT: '#2a6f97',
            100: '#09161e',
            200: '#112d3c',
            300: '#1a435b',
            400: '#225979',
            500: '#2a6f97',
            600: '#3a93c7',
            700: '#6baed5',
            800: '#9cc9e3',
            900: '#cee4f1'
          },
          cerulean: {
            DEFAULT: '#2c7da0',
            100: '#091920',
            200: '#123240',
            300: '#1a4b60',
            400: '#236480',
            500: '#2c7da0',
            600: '#3fa1ca',
            700: '#6fb8d8',
            800: '#9fd0e5',
            900: '#cfe7f2'
          },
          sky: {
            DEFAULT: '#89c2d9',
            100: '#112b35',
            200: '#22566a',
            300: '#34819f',
            400: '#52a6c7',
            500: '#89c2d9',
            600: '#a0cee0',
            700: '#b7dae8',
            800: '#cfe6f0',
            900: '#e7f3f7'
          },
          light: {
            DEFAULT: '#a9d6e5',
            100: '#12333d',
            200: '#25657b',
            300: '#3798b8',
            400: '#6bb9d3',
            500: '#a9d6e5',
            600: '#badeea',
            700: '#cbe6f0',
            800: '#dceff5',
            900: '#eef7fa'
          },
          slate: {
            DEFAULT: '#475569',
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617'
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
