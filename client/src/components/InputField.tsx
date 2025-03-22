import React from 'react';
import styled, { css } from 'styled-components';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
`;

const StartIconWrapper = styled(IconWrapper)`
  left: 0;
`;

const EndIconWrapper = styled(IconWrapper)`
  right: 0;
`;

const StyledInput = styled.input<{ hasError?: boolean; hasStartIcon?: boolean; hasEndIcon?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid ${({ theme, hasError }) => hasError ? theme.colors.error : theme.colors.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease-in-out;

  ${props => props.hasStartIcon && css`
    padding-left: 2.5rem;
  `}

  ${props => props.hasEndIcon && css`
    padding-right: 2.5rem;
  `}

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const HelperText = styled.span<{ hasError?: boolean }>`
  font-size: 0.75rem;
  color: ${({ theme, hasError }) => hasError ? theme.colors.error : theme.colors.text.secondary};
`;

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, startIcon, endIcon, fullWidth, ...props }, ref) => {
    return (
      <InputWrapper fullWidth={fullWidth}>
        {label && <Label>{label}</Label>}
        <InputContainer>
          {startIcon && <StartIconWrapper>{startIcon}</StartIconWrapper>}
          <StyledInput
            ref={ref}
            hasError={!!error}
            hasStartIcon={!!startIcon}
            hasEndIcon={!!endIcon}
            aria-invalid={!!error}
            {...props}
          />
          {endIcon && <EndIconWrapper>{endIcon}</EndIconWrapper>}
        </InputContainer>
        {(error || helperText) && (
          <HelperText hasError={!!error}>{error || helperText}</HelperText>
        )}
      </InputWrapper>
    );
  }
); 