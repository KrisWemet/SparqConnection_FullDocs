import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Modal, ModalProps } from './Modal';
import { Button } from './Button';
import { useState } from 'react';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    showCloseButton: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalDemo = ({ ...args }: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: ModalDemo,
  args: {
    title: 'Example Modal',
    children: (
      <div>
        <p>This is an example modal content.</p>
        <p>You can put any content here, including forms, images, or other components.</p>
      </div>
    ),
  },
};

export const SmallSize: Story = {
  render: ModalDemo,
  args: {
    ...Default.args,
    size: 'small',
    title: 'Small Modal',
  },
};

export const LargeSize: Story = {
  render: ModalDemo,
  args: {
    ...Default.args,
    size: 'large',
    title: 'Large Modal',
  },
};

export const WithoutCloseButton: Story = {
  render: ModalDemo,
  args: {
    ...Default.args,
    showCloseButton: false,
    title: 'No Close Button',
  },
};

export const WithoutTitle: Story = {
  render: ModalDemo,
  args: {
    ...Default.args,
    title: undefined,
    children: (
      <div>
        <p>This modal has no title.</p>
        <p>It only shows the close button in the top-right corner.</p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  render: ModalDemo,
  args: {
    ...Default.args,
    title: 'Contact Form',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Name"
          style={{ padding: '0.5rem', width: '100%' }}
        />
        <input
          type="email"
          placeholder="Email"
          style={{ padding: '0.5rem', width: '100%' }}
        />
        <textarea
          placeholder="Message"
          rows={4}
          style={{ padding: '0.5rem', width: '100%', resize: 'vertical' }}
        />
        <Button variant="primary" fullWidth>
          Submit
        </Button>
      </div>
    ),
  },
}; 