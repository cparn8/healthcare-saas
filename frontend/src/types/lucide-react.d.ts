declare module 'lucide-react' {
  import * as React from 'react';

  // Minimal generic icon props used by lucide-react icons
  export type LucideProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number;
    className?: string;
  };

  // Generic icon component type
  export type IconComponent = React.FC<LucideProps>;

  // Default export: an indexable object of icons
  const _default: { [key: string]: IconComponent };
  export default _default;

  // Also export commonly used named icons as loose types so `import { X } from 'lucide-react'` works
  // Add more named exports here if your code imports other icons and TS still errors.
  export const X: IconComponent;
}
