import { cva, type VariantProps } from 'class-variance-authority';

export const topBarVariants = cva(
  "wf-topbar flex items-center justify-between",
  {
    variants: {
      theme: {
        default: "wf-glass-topbar",
        elevated: "wf-glass-elevated"
      }
    },
    defaultVariants: {
      theme: "default"
    }
  }
);

export const bottomBarVariants = cva(
  "wf-bottombar flex items-center justify-between",
  {
    variants: {
      theme: {
        default: "wf-glass-topbar",
        elevated: "wf-glass-elevated"
      }
    },
    defaultVariants: {
      theme: "default"
    }
  }
);

export const navItemVariants = cva(
  "wf-nav-item",
  {
    variants: {
      state: {
        default: "",
        active: "active"
      }
    },
    defaultVariants: {
      state: "default"
    }
  }
);

export const barItemVariants = cva(
  "wf-bar-item",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
      }
    },
    defaultVariants: {
      size: "sm"
    }
  }
);

export type TopBarVariants = VariantProps<typeof topBarVariants>;
export type BottomBarVariants = VariantProps<typeof bottomBarVariants>;
export type NavItemVariants = VariantProps<typeof navItemVariants>;
export type BarItemVariants = VariantProps<typeof barItemVariants>;