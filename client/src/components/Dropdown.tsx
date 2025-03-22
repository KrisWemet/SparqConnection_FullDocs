import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  fullWidth?: boolean;
  label?: string;
}

const Container = styled.div<{ fullWidth?: boolean }>`
  display: inline-block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DropdownButton = styled.button<{ hasError?: boolean; isOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.625rem 1rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme, hasError }) =>
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: 0.375rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors['primary-light']};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors['primary-light']};
  }

  ${({ isOpen }) =>
    isOpen &&
    css`
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors['primary-light']};
    `}
`;

const OptionsContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 15rem;
  overflow-y: auto;
  z-index: 10;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

const Option = styled.button<{ isSelected?: boolean; isDisabled?: boolean }>`
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  text-align: left;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.colors['primary-light']};
      color: ${theme.colors.primary};
      font-weight: 500;
    `}

  ${({ isDisabled, theme }) =>
    isDisabled &&
    css`
      color: ${theme.colors.text.secondary};
      cursor: not-allowed;
    `}

  &:hover:not(:disabled) {
    background-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors['primary-light'] : theme.colors.border};
  }

  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const Error = styled.span`
  display: block;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.75rem;
`;

const ButtonContent = styled.span`
  margin-right: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RelativeContainer = styled.div`
  position: relative;
`;

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  fullWidth = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen((prev) => !prev);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = value
            ? options.findIndex((option) => option.value === value)
            : -1;
          const nextOption = options[currentIndex + 1];
          if (nextOption && !nextOption.disabled) {
            onChange(nextOption.value);
          }
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = value
            ? options.findIndex((option) => option.value === value)
            : options.length;
          const prevOption = options[currentIndex - 1];
          if (prevOption && !prevOption.disabled) {
            onChange(prevOption.value);
          }
        }
        break;
    }
  };

  return (
    <Container fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <RelativeContainer ref={containerRef}>
        <DropdownButton
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          hasError={!!error}
          isOpen={isOpen}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? 'dropdown-label' : undefined}
        >
          <ButtonContent>
            {selectedOption ? selectedOption.label : placeholder}
          </ButtonContent>
          <FiChevronDown
            size={20}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </DropdownButton>
        <OptionsContainer isOpen={isOpen} role="listbox">
          {options.map((option) => (
            <Option
              key={option.value}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
              isSelected={option.value === value}
              isDisabled={option.disabled}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </Option>
          ))}
        </OptionsContainer>
      </RelativeContainer>
      {error && <Error role="alert">{error}</Error>}
    </Container>
  );
}; 