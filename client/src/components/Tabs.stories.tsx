import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsProps } from './Tabs';
import { useState } from 'react';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pills', 'underline'],
    },
    fullWidth: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTabs = [
  {
    id: 'tab1',
    label: 'Tab 1',
    content: (
      <div style={{ padding: '1rem' }}>
        <h3>Tab 1 Content</h3>
        <p>This is the content for Tab 1.</p>
      </div>
    ),
  },
  {
    id: 'tab2',
    label: 'Tab 2',
    content: (
      <div style={{ padding: '1rem' }}>
        <h3>Tab 2 Content</h3>
        <p>This is the content for Tab 2.</p>
      </div>
    ),
  },
  {
    id: 'tab3',
    label: 'Tab 3',
    content: (
      <div style={{ padding: '1rem' }}>
        <h3>Tab 3 Content</h3>
        <p>This is the content for Tab 3.</p>
      </div>
    ),
  },
];

const TabsDemo = ({ tabs = defaultTabs, ...args }: Partial<TabsProps>) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  return <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} {...args} />;
};

export const Default: Story = {
  render: (args: Partial<TabsProps>) => <TabsDemo {...args} />,
};

export const Pills: Story = {
  render: (args: Partial<TabsProps>) => <TabsDemo {...args} />,
  args: {
    variant: 'pills',
  },
};

export const Underline: Story = {
  render: (args: Partial<TabsProps>) => <TabsDemo {...args} />,
  args: {
    variant: 'underline',
  },
};

export const FullWidth: Story = {
  render: (args: Partial<TabsProps>) => <TabsDemo {...args} />,
  args: {
    fullWidth: true,
  },
};

export const WithDisabledTab: Story = {
  render: (args: Partial<TabsProps>) => (
    <TabsDemo
      {...args}
      tabs={[
        ...defaultTabs.slice(0, 2),
        { ...defaultTabs[2], disabled: true },
      ]}
    />
  ),
};

export const WithLongContent: Story = {
  render: (args: Partial<TabsProps>) => (
    <TabsDemo
      {...args}
      tabs={[
        {
          id: 'tab1',
          label: 'Long Content Tab',
          content: (
            <div style={{ padding: '1rem' }}>
              <h3>Long Content</h3>
              <p>
                This tab contains a longer content section to demonstrate how the
                tabs component handles larger amounts of content. The content can
                include any React components or HTML elements.
              </p>
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
                <li>List item 3</li>
              </ul>
              <p>
                Additional paragraphs and content can be added to make the tab
                panel as long as needed.
              </p>
            </div>
          ),
        },
        ...defaultTabs.slice(1),
      ]}
    />
  ),
};

export const WithManyTabs: Story = {
  render: (args: Partial<TabsProps>) => (
    <TabsDemo
      {...args}
      tabs={[
        ...defaultTabs,
        {
          id: 'tab4',
          label: 'Tab 4',
          content: <div style={{ padding: '1rem' }}>Tab 4 Content</div>,
        },
        {
          id: 'tab5',
          label: 'Tab 5',
          content: <div style={{ padding: '1rem' }}>Tab 5 Content</div>,
        },
        {
          id: 'tab6',
          label: 'Tab 6',
          content: <div style={{ padding: '1rem' }}>Tab 6 Content</div>,
        },
      ]}
    />
  ),
}; 