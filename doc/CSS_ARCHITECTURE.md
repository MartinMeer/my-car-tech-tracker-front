# CSS Architecture Documentation

## Overview
This project uses a modular CSS architecture with CSS custom properties for consistent theming and maintainable styles.

## File Structure

```
src/styles/
├── styles.css              # Main entry point with imports
├── base.css                # CSS reset, typography, variables
├── layout.css              # Header, sidebar, main content, footer
├── navigation.css          # Navigation components
├── utilities.css           # Utility classes and helpers
├── responsive.css          # Media queries and mobile styles
├── components/             # Reusable component styles
│   ├── buttons.css
│   ├── forms.css
│   ├── cards.css
│   ├── popups.css
│   └── tables.css
├── forms.css               # Form-specific styles
├── popups.css              # Modal and dialog styles
├── cars.css                # Car-related components
├── service-record.css      # Service record components
├── tables.css              # Table styles
├── messages.css            # Alert and message styles
└── cover-page.css          # Landing page styles
```

## Import Order
The import order in `styles.css` is carefully structured for proper CSS cascade:

1. **Base** - Reset, typography, variables
2. **Layout** - Structural components
3. **Navigation** - Navigation elements
4. **Components** - Reusable UI components
5. **Feature-specific** - Page/feature specific styles
6. **Utilities** - Helper classes
7. **Responsive** - Media queries (last for override priority)

## CSS Variables

### Color Palette
- `--primary-color`: Main brand color (#2d3e50)
- `--secondary-color`: Secondary brand color (#3498db)
- `--accent-color`: Accent/warning color (#e74c3c)
- `--success-color`: Success states (#27ae60)
- `--warning-color`: Warning states (#f39c12)

### Spacing Scale
- `--space-xs`: 0.25rem
- `--space-sm`: 0.5rem
- `--space-md`: 1rem
- `--space-lg`: 1.5rem
- `--space-xl`: 2rem
- `--space-2xl`: 3rem

### Layout Dimensions
- `--header-height`: 56px
- `--sidebar-width`: 220px
- `--icons-width`: 60px

## Naming Conventions

### BEM-like Structure
- `.block` - Main component
- `.block__element` - Component element
- `.block--modifier` - Component variant

### Utility Classes
- `.flex`, `.flex-col`, `.flex-center` - Layout utilities
- `.text-primary`, `.text-secondary` - Text colors
- `.bg-primary`, `.bg-secondary` - Background colors
- `.p-1`, `.p-2`, `.m-1`, `.m-2` - Spacing utilities

## Best Practices

### 1. Use CSS Variables
Always use CSS custom properties for colors, spacing, and other design tokens:
```css
/* ✅ Good */
.btn {
  background: var(--primary-color);
  padding: var(--space-md);
}

/* ❌ Avoid */
.btn {
  background: #2d3e50;
  padding: 1rem;
}
```

### 2. Mobile-First Approach
Write base styles for mobile, then enhance for larger screens:
```css
/* Base styles (mobile) */
.card {
  padding: var(--space-md);
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    padding: var(--space-lg);
  }
}
```

### 3. Component Isolation
Keep component styles self-contained and avoid deep nesting:
```css
/* ✅ Good */
.service-card {
  background: var(--surface);
  border-radius: var(--border-radius-lg);
}

.service-card__header {
  padding: var(--space-md);
}

/* ❌ Avoid */
.service-card .header .title .text {
  /* Deep nesting */
}
```

### 4. Utility Classes
Use utility classes for common patterns:
```css
/* ✅ Good */
<div class="flex flex-center p-3 bg-primary text-white">

/* ❌ Avoid */
<div style="display: flex; align-items: center; justify-content: center; padding: 1rem; background: #2d3e50; color: white;">
```

## Performance Considerations

### 1. Minimize Specificity Conflicts
- Use component-specific classes to avoid conflicts
- Avoid `!important` declarations
- Keep selectors shallow

### 2. Optimize File Sizes
- Split large files (>500 lines) into smaller components
- Remove unused CSS regularly
- Use CSS minification in production

### 3. Efficient Selectors
- Prefer class selectors over ID selectors
- Avoid universal selectors in performance-critical areas
- Use attribute selectors sparingly

## Troubleshooting

### Common Issues

1. **Styles Not Applying**
   - Check import order in `styles.css`
   - Verify CSS specificity
   - Ensure no conflicting styles

2. **Responsive Issues**
   - Confirm mobile-first approach
   - Check media query breakpoints
   - Verify viewport meta tag

3. **CSS Variables Not Working**
   - Ensure variables are defined in `:root`
   - Check for typos in variable names
   - Verify browser support

### Debugging Tools
- Browser DevTools for inspecting styles
- CSS specificity calculators
- CSS linting tools

## Future Improvements

1. **CSS-in-JS Consideration**
   - Evaluate CSS-in-JS for better component isolation
   - Consider styled-components or emotion

2. **CSS Modules**
   - Implement CSS modules for better scoping
   - Reduce global namespace pollution

3. **Design System**
   - Create comprehensive design tokens
   - Implement design system documentation
   - Add component storybook

4. **Performance Optimization**
   - Implement CSS purging for unused styles
   - Add critical CSS extraction
   - Optimize CSS delivery 