import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './ToastProvider';
import { Button } from './Button';
import styled from 'styled-components';

const meta = {
  title: 'Components/ToastProvider',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
`;

const ToastDemo = () => {
  const { showToast } = useToast();

  return (
    <ButtonGroup>
      <Button
        onClick={() =>
          showToast('Operation completed successfully!', 'success')
        }
      >
        Show Success Toast
      </Button>
      <Button
        onClick={() =>
          showToast('An error occurred. Please try again.', 'error')
        }
      >
        Show Error Toast
      </Button>
      <Button
        onClick={() =>
          showToast('Here is some useful information.', 'info')
        }
      >
        Show Info Toast
      </Button>
      <Button
        onClick={() =>
          showToast('Please be careful with this action.', 'warning')
        }
      >
        Show Warning Toast
      </Button>
      <Button
        onClick={() => {
          showToast('First notification');
          setTimeout(() => {
            showToast('Second notification', 'success');
          }, 1000);
          setTimeout(() => {
            showToast('Third notification', 'warning');
          }, 2000);
        }}
      >
        Show Multiple Toasts
      </Button>
    </ButtonGroup>
  );
};

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
}; 