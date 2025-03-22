import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: string;
  padding?: string;
  fullHeight?: boolean;
  centerContent?: boolean;
  bgColor?: string;
  className?: string;
}

const StyledContainer = styled.div<Omit<ResponsiveContainerProps, 'children'>>`
  width: 100%;
  max-width: ${props => props.maxWidth || '1200px'};
  margin: 0 auto;
  padding: ${props => props.padding || '1rem'};
  height: ${props => props.fullHeight ? '100%' : 'auto'};
  background-color: ${props => props.bgColor || 'transparent'};
  
  ${props => props.centerContent && `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `}
  
  /* Responsive padding adjustments */
  @media (max-width: 768px) {
    padding: ${props => props.padding ? props.padding : '0.75rem'};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.padding ? props.padding : '0.5rem'};
  }
`;

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth,
  padding,
  fullHeight,
  centerContent,
  bgColor,
  className
}) => {
  return (
    <StyledContainer
      maxWidth={maxWidth}
      padding={padding}
      fullHeight={fullHeight}
      centerContent={centerContent}
      bgColor={bgColor}
      className={className}
    >
      {children}
    </StyledContainer>
  );
};

export default ResponsiveContainer; 