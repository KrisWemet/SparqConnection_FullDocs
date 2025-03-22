import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
    },
    padding: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
    },
    radius: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
    },
    fullWidth: {
      control: 'boolean',
    },
    hoverable: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story: StoryFn) => (
      <div style={{ padding: '2rem', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const ExampleContent = () => (
  <div>
    <h3 style={{ margin: '0 0 1rem 0' }}>Card Title</h3>
    <p style={{ margin: '0' }}>
      This is an example of card content. You can put any content here, including
      text, images, or other components.
    </p>
  </div>
);

export const Default: Story = {
  args: {
    children: <ExampleContent />,
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: <ExampleContent />,
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <ExampleContent />,
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'small',
    children: <ExampleContent />,
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'large',
    children: <ExampleContent />,
  },
};

export const LargeRadius: Story = {
  args: {
    radius: 'large',
    children: <ExampleContent />,
  },
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: <ExampleContent />,
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: <ExampleContent />,
  },
}; 