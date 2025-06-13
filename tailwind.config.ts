/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Ensure white is available for opacity variants
        white: '#ffffff',
        
        // WIRED|FRONT PULSE OS Colors - Map to CSS Variables
        'wf-purple': 'var(--wf-purple)',
        'wf-pink': 'var(--wf-pink)',
        'wf-dark-purple': 'var(--wf-dark-purple)',
        'wf-violet': 'var(--wf-violet)',
        'wf-orange': 'var(--wf-orange)',
        
        // Core WFPulse Theme Colors - Map to CSS Variables
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        success: 'var(--color-success)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        
        // Glass System Colors
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        'glass-hover': 'var(--glass-hover)',
        
        // Modal System Colors
        'modal-bg': 'var(--modal-bg)',
        'modal-border': 'var(--modal-border)',
        'modal-backdrop': 'var(--modal-backdrop)',
      },
      spacing: {
        // Layout Dimensions - Map to CSS Variables
        'topbar': 'var(--topbar-height)',
        'bottombar': 'var(--bottombar-height)',
        'sidebar': 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
        'monitor': 'var(--monitor-width)',
        
        // Spacing Scale - Map to CSS Variables
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
      },
      fontSize: {
        // Typography Scale - Map to CSS Variables
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
        '7xl': 'var(--text-7xl)',
        '8xl': 'var(--text-8xl)',
      },
      fontWeight: {
        // Font Weights - Map to CSS Variables
        'normal': 'var(--font-normal)',
        'medium': 'var(--font-medium)',
        'semibold': 'var(--font-semibold)',
        'bold': 'var(--font-bold)',
      },
      fontFamily: {
        // Font Families - Map to CSS Variables
        'ui': 'var(--font-ui)',
        'body': 'var(--font-body)',
        'mono': 'var(--font-mono)',
      },
      boxShadow: {
        // Effects & Shadows - Map to CSS Variables
        'glow': 'var(--shadow-glow)',
        'deep': 'var(--shadow-deep)',
        'neo': 'var(--shadow-neo)',
        'raised': 'var(--shadow-raised)',
        'wf-glow': 'var(--shadow-wf-glow)',
        'glass': 'var(--glass-shadow)',
        'modal': 'var(--modal-shadow)',
      },
      backdropBlur: {
        // Glass Morphism Blur - Map to CSS Variables
        'glass': 'var(--glass-blur)',
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      transitionDuration: {
        // Transitions - Map to CSS Variables
        'fast': 'var(--transition-fast)',
        'base': 'var(--transition-base)',
        'slow': 'var(--transition-slow)',
      },
      transitionTimingFunction: {
        // Easing Functions - Map to CSS Variables
        'ease-out': 'var(--ease-out)',
        'ease-in-out': 'var(--ease-in-out)',
        'ease-bounce': 'var(--ease-bounce)',
      },
      animation: {
        'gradient-slow': 'gradient-slow 8s ease infinite',
        'gradient-medium': 'gradient-medium 6s ease infinite',
        'gradient-reverse': 'gradient-reverse 10s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'letter-pulse': 'letter-pulse 0.8s ease-in-out',
        'char-hover': 'char-hover 0.3s ease-out',
        'floatUp': 'floatUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'char-reveal': 'char-reveal 0.5s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease',
      },
      keyframes: {
        'gradient-slow': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'gradient-reverse': {
          '0%, 100%': { 'background-position': '100% 50%' },
          '50%': { 'background-position': '0% 50%' },
        },
        'gradient-medium': {
          '0%, 100%': { 'background-position': '50% 0%' },
          '50%': { 'background-position': '50% 100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { 'box-shadow': '0 0 20px rgba(94, 234, 212, 0.3)' },
          '100%': { 'box-shadow': '0 0 30px rgba(94, 234, 212, 0.5)' },
        },
        'letter-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'char-hover': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'char-reveal': {
          'from': { opacity: '0', transform: 'translateY(1em)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          'from': { transform: 'scaleX(0)' },
          'to': { transform: 'scaleX(1)' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      zIndex: {
        'base': 'var(--z-base)',
        'nav': 'var(--z-nav)',
        'overlay': 'var(--z-overlay)',
        'glass': 'var(--z-glass)',
        'modal': 'var(--z-modal)',
        'toast': 'var(--z-toast)',
      },
      borderRadius: {
        'wf-sm': 'var(--wfpulse-radius-sm, 0.5rem)',
        'wf-md': 'var(--wfpulse-radius-md, 0.75rem)',
        'wf-lg': 'var(--wfpulse-radius-lg, 1.25rem)',
        'wf-xl': 'var(--wfpulse-radius-xl, 1.5rem)',
      },
    },
  },
  plugins: [],
};