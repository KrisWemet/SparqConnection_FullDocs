import React, { useState, useCallback } from 'react';
import styled, { css } from 'styled-components';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
}

const TabList = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1rem;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const TabButton = styled.button<{
  isActive?: boolean;
  variant?: TabsProps['variant'];
  fullWidth?: boolean;
}>`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text.secondary};
  font-size: 0.875rem;
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

  ${({ variant, isActive, theme }) => {
    switch (variant) {
      case 'pills':
        return css`
          border-radius: 9999px;
          background: ${isActive ? theme.colors['primary-light'] : 'transparent'};
          color: ${isActive ? theme.colors.primary : theme.colors.text.secondary};

          &:hover:not(:disabled) {
            background: ${theme.colors['primary-light']};
          }

          &:focus-visible {
            box-shadow: 0 0 0 2px ${theme.colors['primary-light']};
          }
        `;
      case 'underline':
        return css`
          border-bottom: 2px solid
            ${isActive ? theme.colors.primary : 'transparent'};
          padding-bottom: calc(0.75rem - 2px);

          &:hover:not(:disabled) {
            border-bottom-color: ${theme.colors['primary-light']};
          }

          &:focus-visible {
            border-bottom-color: ${theme.colors.primary};
          }
        `;
      default:
        return css`
          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: ${isActive ? theme.colors.primary : 'transparent'};
            transition: background-color 0.2s ease-in-out;
          }

          &:hover:not(:disabled)::after {
            background: ${theme.colors['primary-light']};
          }

          &:focus-visible::after {
            background: ${theme.colors.primary};
          }
        `;
    }
  }}
`;

const TabPanel = styled.div`
  &:focus {
    outline: none;
  }
`;

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  fullWidth = false,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (onChange) {
        onChange(tabId);
      } else {
        setInternalActiveTab(tabId);
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, tabId: string) => {
      const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
      let nextIndex: number;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) nextIndex = tabs.length - 1;
          while (nextIndex !== currentIndex && tabs[nextIndex].disabled) {
            nextIndex = nextIndex - 1;
            if (nextIndex < 0) nextIndex = tabs.length - 1;
          }
          if (!tabs[nextIndex].disabled) {
            handleTabChange(tabs[nextIndex].id);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= tabs.length) nextIndex = 0;
          while (nextIndex !== currentIndex && tabs[nextIndex].disabled) {
            nextIndex = nextIndex + 1;
            if (nextIndex >= tabs.length) nextIndex = 0;
          }
          if (!tabs[nextIndex].disabled) {
            handleTabChange(tabs[nextIndex].id);
          }
          break;
      }
    },
    [tabs, handleTabChange]
  );

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      <TabList
        role="tablist"
        aria-orientation="horizontal"
        fullWidth={fullWidth}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            isActive={activeTab === tab.id}
            disabled={tab.disabled}
            variant={variant}
            fullWidth={fullWidth}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabList>
      <TabPanel
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTabContent}
      </TabPanel>
    </div>
  );
}; 