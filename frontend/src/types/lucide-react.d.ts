// frontend/src/types/lucide-react.d.ts
declare module 'lucide-react/dist/esm/icons/*' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number;
    className?: string;
  }

  const Icon: React.FC<LucideProps>;
  export default Icon;
}

// Optional: fallback for root import (older style)
declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number;
    className?: string;
  }

  export const X: React.FC<LucideProps>;
  export const Search: React.FC<LucideProps>;
  export const Mail: React.FC<LucideProps>;
  export const Phone: React.FC<LucideProps>;

  const icons: Record<string, React.FC<LucideProps>>;
  export default icons;
}
