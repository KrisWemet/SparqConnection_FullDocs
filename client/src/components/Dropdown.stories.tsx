import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown, DropdownProps } from './Dropdown';
import { useState } from 'react';

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
  { value: 'option5', label: 'Option 5' },
];

const DropdownDemo = ({ options = defaultOptions, ...args }: Partial<DropdownProps>) => {
  const [value, setValue] = useState<string>();
  return <Dropdown options={options} {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: (args: Partial<DropdownProps>) => <DropdownDemo {...args} />,
  args: {
    placeholder: 'Select an option',
  },
};

export const WithLabel: Story = {
  render: (args: Partial<DropdownProps>) => <DropdownDemo {...args} />,
  args: {
    ...Default.args,
    label: 'Select Option',
  },
};

export const WithError: Story = {
  render: (args: Partial<DropdownProps>) => <DropdownDemo {...args} />,
  args: {
    ...Default.args,
    error: 'Please select an option',
  },
};

export const Disabled: Story = {
  render: (args: Partial<DropdownProps>) => <DropdownDemo {...args} />,
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const FullWidth: Story = {
  render: (args: Partial<DropdownProps>) => <DropdownDemo {...args} />,
  args: {
    ...Default.args,
    fullWidth: true,
  },
};

export const WithDisabledOptions: Story = {
  render: (args: Partial<DropdownProps>) => <DropdownDemo {...args} />,
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', disabled: true },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4', disabled: true },
      { value: 'option5', label: 'Option 5' },
    ],
    placeholder: 'Select an option',
  },
};

export const WithLongOptions: Story = {
  render: (args: Partial<DropdownProps>) => <DropdownDemo {...args} />,
  args: {
    options: [
      {
        value: 'option1',
        label: 'This is a very long option that should be truncated',
      },
      {
        value: 'option2',
        label: 'Another very long option that demonstrates text overflow',
      },
      { value: 'option3', label: 'Short option' },
      {
        value: 'option4',
        label: 'Yet another long option to show ellipsis behavior',
      },
    ],
    placeholder: 'Select an option',
  },
}; 