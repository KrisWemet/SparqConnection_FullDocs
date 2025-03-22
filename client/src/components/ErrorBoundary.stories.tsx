import type { Meta, StoryObj } from '@storybook/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
  return null;
};

const meta = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithError: Story = {
  args: {
    children: <ThrowError />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <ThrowError />,
    fallback: <div>Custom error message</div>,
  },
}; 