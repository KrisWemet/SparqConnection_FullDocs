import type { Meta, StoryObj } from '@storybook/react';
import { Toast, ToastProps } from './Toast';
import { Button } from './Button';
import { useState } from 'react';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'info', 'warning'],
    },
    duration: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const ToastDemo = ({ message = '', variant, duration }: Partial<ToastProps>) => {
  const [isVisible, setIsVisible] = useState(false);

  const showToast = () => {
    setIsVisible(true);
  };

  const hideToast = () => {
    setIsVisible(false);
  };

  return (
    <div>
      <Button onClick={showToast}>Show Toast</Button>
      <Toast
        message={message}
        variant={variant}
        duration={duration}
        isVisible={isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export const Success: Story = {
  render: (args: Partial<ToastProps>) => <ToastDemo {...args} />,
  args: {
    message: 'Operation completed successfully!',
    variant: 'success',
  },
};

export const Error: Story = {
  render: (args: Partial<ToastProps>) => <ToastDemo {...args} />,
  args: {
    message: 'An error occurred. Please try again.',
    variant: 'error',
  },
};

export const Info: Story = {
  render: (args: Partial<ToastProps>) => <ToastDemo {...args} />,
  args: {
    message: 'Here is some useful information.',
    variant: 'info',
  },
};

export const Warning: Story = {
  render: (args: Partial<ToastProps>) => <ToastDemo {...args} />,
  args: {
    message: 'Please be careful with this action.',
    variant: 'warning',
  },
};

export const LongDuration: Story = {
  render: (args: Partial<ToastProps>) => <ToastDemo {...args} />,
  args: {
    message: 'This toast will stay visible for 10 seconds.',
    variant: 'info',
    duration: 10000,
  },
};

export const LongMessage: Story = {
  render: (args: Partial<ToastProps>) => <ToastDemo {...args} />,
  args: {
    message:
      'This is a very long message that will wrap to multiple lines. It demonstrates how the toast component handles longer content while maintaining its layout and readability.',
    variant: 'info',
  },
}; 