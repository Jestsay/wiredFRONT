/**
 * Design Token Management System
 * Provides utilities for admin to manage design tokens dynamically
 */

import designTokens from '../styles/design-tokens.json';

export interface DesignTokens {
  colors: {
    brand: Record<string, string>;
    core: Record<string, string>;
    glass: Record<string, string>;
  };
  spacing: {
    scale: Record<string, string>;
    layout: Record<string, string>;
  };
  typography: {
    fonts: Record<string, string>;
    sizes: Record<string, string>;
    weights: Record<string, string>;
  };
  effects: {
    shadows: Record<string, string>;
    blur: Record<string, string>;
    transitions: Record<string, string>;
  };
  components: {
    button: Record<string, any>;
    card: Record<string, any>;
    input: Record<string, any>;
  };
  animations: {
    durations: Record<string, string>;
    easings: Record<string, string>;
  };
}

/**
 * Get current design tokens
 */
export function getDesignTokens(): DesignTokens {
  return designTokens as DesignTokens;
}

/**
 * Update CSS custom properties from design tokens
 * This is what the admin interface will call to update the theme
 */
export function updateCSSTokens(tokens: Partial<DesignTokens>): void {
  const root = document.documentElement;
  
  // Update color tokens
  if (tokens.colors?.brand) {
    Object.entries(tokens.colors.brand).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }
  
  if (tokens.colors?.core) {
    Object.entries(tokens.colors.core).forEach(([key, value])=> {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
  
  // Update spacing tokens
  if (tokens.spacing?.scale) {
    Object.entries(tokens.spacing.scale).forEach(([key, value]) => {
      root.style.setProperty(`--space-${key}`, value);
    });
  }
  
  if (tokens.spacing?.layout) {
    Object.entries(tokens.spacing.layout).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }
  
  // Update typography tokens
  if (tokens.typography?.fonts) {
    Object.entries(tokens.typography.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
  }
  
  if (tokens.typography?.sizes) {
    Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });
  }
  
  // Update component tokens
  if (tokens.components?.button?.primary) {
    Object.entries(tokens.components.button.primary).forEach(([key, value]) => {
      root.style.setProperty(`--btn-primary-${key}`, value);
    });
  }
  
  if (tokens.components?.card?.default) {
    Object.entries(tokens.components.card.default).forEach(([key, value]) => {
      root.style.setProperty(`--card-${key}`, value);
    });
  }
}

/**
 * Generate CSS from design tokens
 * This can be used to generate new CSS files for deployment
 */
export function generateCSSFromTokens(tokens: DesignTokens): string {
  let css = '/* Generated from Design Tokens */\n:root {\n';
  
  // Brand colors
  Object.entries(tokens.colors.brand).forEach(([key, value]) => {
    css += `  --${key}: ${value};\n`;
  });
  
  // Core colors
  Object.entries(tokens.colors.core).forEach(([key, value]) => {
    css += `  --color-${key}: ${value};\n`;
  });
  
  // Spacing
  Object.entries(tokens.spacing.scale).forEach(([key, value]) => {
    css += `  --space-${key}: ${value};\n`;
  });
  
  Object.entries(tokens.spacing.layout).forEach(([key, value]) => {
    css += `  --${key}: ${value};\n`;
  });
  
  // Typography
  Object.entries(tokens.typography.fonts).forEach(([key, value]) => {
    css += `  --font-${key}: ${value};\n`;
  });
  
  Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
    css += `  --text-${key}: ${value};\n`;
  });
  
  // Effects
  Object.entries(tokens.effects.shadows).forEach(([key, value]) => {
    css += `  --shadow-${key}: ${value};\n`;
  });
  
  Object.entries(tokens.effects.transitions).forEach(([key, value]) => {
    css += `  --transition-${key}: ${value};\n`;
  });
  
  // Component tokens
  if (tokens.components.button.primary) {
    Object.entries(tokens.components.button.primary).forEach(([key, value]) => {
      css += `  --btn-primary-${key}: ${value};\n`;
    });
  }
  
  css += '}\n';
  return css;
}

/**
 * Apply admin overrides to specific components
 */
export function applyComponentOverride(
  componentType: string, 
  overrides: Record<string, string>
): void {
  const elements = document.querySelectorAll(`[data-admin-component="${componentType}"]`);
  
  elements.forEach(element => {
    const htmlElement = element as HTMLElement;
    Object.entries(overrides).forEach(([property, value]) => {
      htmlElement.style.setProperty(property, value);
    });
  });
}

/**
 * Save design tokens to backend (for admin use)
 */
export async function saveDesignTokens(tokens: DesignTokens): Promise<void> {
  try {
    const response = await fetch('/api/admin/design-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokens),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save design tokens');
    }
  } catch (error) {
    console.error('Error saving design tokens:', error);
    throw error;
  }
}

/**
 * Load design tokens from backend (for admin use)
 */
export async function loadDesignTokens(): Promise<DesignTokens> {
  try {
    const response = await fetch('/api/admin/design-tokens');
    
    if (!response.ok) {
      throw new Error('Failed to load design tokens');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading design tokens:', error);
    // Fallback to default tokens
    return getDesignTokens();
  }
}

/**
 * Preview design token changes without saving
 */
export function previewTokenChanges(tokens: Partial<DesignTokens>): () => void {
  const originalValues: Record<string, string> = {};
  const root = document.documentElement;
  
  // Store original values and apply new ones
  const applyChanges = (tokenPath: string, value: string) => {
    const cssVar = `--${tokenPath}`;
    originalValues[cssVar] = root.style.getPropertyValue(cssVar);
    root.style.setProperty(cssVar, value);
  };
  
  // Apply token changes
  updateCSSTokens(tokens);
  
  // Return cleanup function
  return () => {
    Object.entries(originalValues).forEach(([property, value]) => {
      if (value) {
        root.style.setProperty(property, value);
      } else {
        root.style.removeProperty(property);
      }
    });
  };
}