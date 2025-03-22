declare module 'react-heatmap-grid' {
  import { FC } from 'react';

  interface HeatMapProps {
    xLabels: string[];
    yLabels: string[];
    data: number[][];
    background?: string;
    height?: number;
    squares?: boolean;
    onClick?: (x: number, y: number) => void;
    cellStyle?: (
      background: string,
      value: number,
      min: number,
      max: number,
      data: number[][],
      x: number,
      y: number
    ) => React.CSSProperties;
    cellRender?: (value: number) => React.ReactNode;
    title?: (value: number) => string;
  }

  const HeatMap: FC<HeatMapProps>;
  export default HeatMap;
} 