import React, { ReactNode } from 'react';
import styled from 'styled-components';

// ===== Grid Container =====
interface GridContainerProps {
  children: ReactNode;
  spacing?: string;
  columnGap?: string;
  rowGap?: string;
  className?: string;
  fullWidth?: boolean;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}

const StyledGridContainer = styled.div<Omit<GridContainerProps, 'children'>>`
  display: grid;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => props.spacing && `gap: ${props.spacing};`}
  ${props => props.columnGap && `column-gap: ${props.columnGap};`}
  ${props => props.rowGap && `row-gap: ${props.rowGap};`}
  
  ${props => props.alignItems && `align-items: ${props.alignItems};`}
  ${props => props.justifyContent && `justify-content: ${props.justifyContent};`}
`;

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  spacing,
  columnGap,
  rowGap,
  className,
  fullWidth,
  alignItems,
  justifyContent
}) => {
  return (
    <StyledGridContainer
      spacing={spacing}
      columnGap={columnGap}
      rowGap={rowGap}
      className={className}
      fullWidth={fullWidth}
      alignItems={alignItems}
      justifyContent={justifyContent}
    >
      {children}
    </StyledGridContainer>
  );
};

// ===== Grid Row =====
interface GridRowProps {
  children: ReactNode;
  spacing?: string;
  columnGap?: string;
  rowGap?: string;
  className?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}

const StyledGridRow = styled.div<Omit<GridRowProps, 'children'>>`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  width: 100%;
  
  ${props => props.spacing && `gap: ${props.spacing};`}
  ${props => props.columnGap && `column-gap: ${props.columnGap};`}
  ${props => props.rowGap && `row-gap: ${props.rowGap};`}
  
  ${props => props.alignItems && `align-items: ${props.alignItems};`}
  ${props => props.justifyContent && `justify-content: ${props.justifyContent};`}
`;

export const GridRow: React.FC<GridRowProps> = ({
  children,
  spacing,
  columnGap,
  rowGap,
  className,
  alignItems,
  justifyContent
}) => {
  return (
    <StyledGridRow
      spacing={spacing}
      columnGap={columnGap}
      rowGap={rowGap}
      className={className}
      alignItems={alignItems}
      justifyContent={justifyContent}
    >
      {children}
    </StyledGridRow>
  );
};

// ===== Grid Column =====
interface GridColumnProps {
  children: ReactNode;
  xs?: number; // Mobile
  sm?: number; // Tablet
  md?: number; // Desktop
  lg?: number; // Large desktop
  xl?: number; // Extra large desktop
  start?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
  alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
}

const StyledGridColumn = styled.div<Omit<GridColumnProps, 'children'>>`
  /* Default to 12 columns (full width) on smallest screens */
  grid-column: span 12;
  
  /* Responsive grid spans */
  ${props => props.xs && `
    @media (min-width: 0px) {
      grid-column: ${props.start?.xs ? `${props.start.xs} / span ${props.xs}` : `span ${props.xs}`};
    }
  `}
  
  ${props => props.sm && `
    @media (min-width: 600px) {
      grid-column: ${props.start?.sm ? `${props.start.sm} / span ${props.sm}` : `span ${props.sm}`};
    }
  `}
  
  ${props => props.md && `
    @media (min-width: 960px) {
      grid-column: ${props.start?.md ? `${props.start.md} / span ${props.md}` : `span ${props.md}`};
    }
  `}
  
  ${props => props.lg && `
    @media (min-width: 1280px) {
      grid-column: ${props.start?.lg ? `${props.start.lg} / span ${props.lg}` : `span ${props.lg}`};
    }
  `}
  
  ${props => props.xl && `
    @media (min-width: 1920px) {
      grid-column: ${props.start?.xl ? `${props.start.xl} / span ${props.xl}` : `span ${props.xl}`};
    }
  `}
  
  ${props => props.alignSelf && `align-self: ${props.alignSelf};`}
  ${props => props.justifySelf && `justify-self: ${props.justifySelf};`}
`;

export const GridColumn: React.FC<GridColumnProps> = ({
  children,
  xs,
  sm,
  md,
  lg,
  xl,
  start,
  className,
  alignSelf,
  justifySelf
}) => {
  return (
    <StyledGridColumn
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      start={start}
      className={className}
      alignSelf={alignSelf}
      justifySelf={justifySelf}
    >
      {children}
    </StyledGridColumn>
  );
};

// Responsive Grid System export
export default {
  Container: GridContainer,
  Row: GridRow,
  Column: GridColumn,
}; 