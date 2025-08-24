# Radix UI + Tailwind CSS Setup

## Overview
This project now includes Radix UI components styled with Tailwind CSS for building accessible and customizable user interfaces.

## Installed Packages

### Core Radix UI Components
- `@radix-ui/react-slot` - Composition utility
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-select` - Select components
- `@radix-ui/react-tooltip` - Tooltips
- `@radix-ui/react-popover` - Popovers
- `@radix-ui/react-tabs` - Tab components
- `@radix-ui/react-accordion` - Accordions
- `@radix-ui/react-alert-dialog` - Alert dialogs
- `@radix-ui/react-button` - Button primitives
- `@radix-ui/react-checkbox` - Checkboxes
- `@radix-ui/react-radio-group` - Radio groups
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-slider` - Range sliders
- `@radix-ui/react-progress` - Progress bars
- `@radix-ui/react-avatar` - Avatar components
- `@radix-ui/react-separator` - Separators
- `@radix-ui/react-label` - Labels
- `@radix-ui/react-toast` - Toast notifications
- `@radix-ui/react-navigation-menu` - Navigation menus
- `@radix-ui/react-menubar` - Menu bars
- `@radix-ui/react-context-menu` - Context menus
- `@radix-ui/react-hover-card` - Hover cards
- `@radix-ui/react-collapsible` - Collapsible content
- `@radix-ui/react-toggle` - Toggle buttons
- `@radix-ui/react-toggle-group` - Toggle groups

### Styling Utilities
- `class-variance-authority` - Component variant management
- `clsx` - Conditional className utility
- `tailwind-merge` - Tailwind class merging utility

## Available Components

### 1. Button (`src/components/ui/button.jsx`)
```jsx
import { Button } from './components/ui/button';

// Variants
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### 2. Dialog (`src/components/ui/dialog.jsx`)
```jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3. Dropdown Menu (`src/components/ui/dropdown-menu.jsx`)
```jsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Utilities

### `cn()` Function (`src/lib/utils.js`)
A utility function that combines `clsx` and `tailwind-merge` for better class management:

```jsx
import { cn } from '../lib/utils';

const buttonClass = cn(
  "base-classes",
  condition && "conditional-classes",
  className // Override classes
);
```

### Component Variants with CVA
```jsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "base-classes", // Base styles
  {
    variants: {
      variant: {
        default: "default-styles",
        secondary: "secondary-styles",
      },
      size: {
        sm: "small-styles",
        lg: "large-styles",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);
```

## Example Usage
Check `src/components/RadixUIExample.jsx` for a comprehensive example showing how to use the components.

## Adding More Components
To add more Radix UI components:

1. Install the component: `npm install @radix-ui/react-[component-name]`
2. Create a styled wrapper in `src/components/ui/[component-name].jsx`
3. Export it from `src/components/ui/index.js`
4. Follow the existing patterns for styling and variants

## Features
- ✅ Fully accessible components (ARIA compliant)
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Customizable with Tailwind CSS
- ✅ TypeScript-like prop validation with PropTypes
- ✅ Consistent styling system with variants
- ✅ Tree-shakeable - only import what you use
- ✅ Server-side rendering compatible

## Resources
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Class Variance Authority](https://cva.style/)
