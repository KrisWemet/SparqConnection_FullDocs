import { SVGAttributes } from 'react';

declare module 'react-icons/fa' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = (props: IconBaseProps) => JSX.Element;

  export const FaCrown: IconType;
  export const FaQuestion: IconType;
  export const FaTimes: IconType;
  export const FaSearch: IconType;
  export const FaChevronRight: IconType;
} 