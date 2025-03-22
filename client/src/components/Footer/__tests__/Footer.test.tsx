import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../Footer';
import { useAuth } from '../../../hooks/useAuth';
import { encrypt, decrypt } from '../../../utils/encryption';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
}));

// Mock hooks and utilities
jest.mock('../../../hooks/useAuth');
jest.mock('../../../utils/encryption');

const mockUser = {
  id: 'user123',
  privateKey: 'test-key',
};

const mockMessages = [
  {
    id: 'msg1',
    senderId: 'user123',
    content: 'Hello!',
    iv: 'test-iv',
    timestamp: new Date(),
  },
  {
    id: 'msg2',
    senderId: 'partner456',
    content: 'Hi there!',
    iv: 'test-iv',
    timestamp: new Date(),
  },
];

describe('Footer Component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (encrypt as jest.Mock).mockResolvedValue({
      data: 'encrypted-content',
      iv: 'test-iv',
    });

    (decrypt as jest.Mock).mockResolvedValue('decrypted-content');
  });

  const renderFooter = () => {
    return render(
      <BrowserRouter>
        <Footer partnerId="partner456" />
      </BrowserRouter>
    );
  };

  it('renders chat toggle button', () => {
    renderFooter();
    expect(screen.getByLabelText('Toggle chat')).toBeInTheDocument();
  });

  it('opens chat window on toggle button click', () => {
    renderFooter();
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    expect(screen.getByText('Private Messages')).toBeInTheDocument();
  });

  it('shows message input when chat is open', () => {
    renderFooter();
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('handles message submission', async () => {
    renderFooter();
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    
    const input = screen.getByPlaceholderText('Type a message...');
    await userEvent.type(input, 'Test message');
    fireEvent.click(screen.getByRole('button', { name: '' })); // Submit button

    expect(encrypt).toHaveBeenCalledWith('Test message', mockUser.privateKey);
  });

  it('displays encrypted messages after decryption', async () => {
    renderFooter();
    fireEvent.click(screen.getByLabelText('Toggle chat'));

    await waitFor(() => {
      expect(decrypt).toHaveBeenCalled();
    });
  });

  it('closes chat window', () => {
    renderFooter();
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    fireEvent.click(screen.getByLabelText('Close chat'));
    
    expect(screen.queryByText('Private Messages')).not.toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    renderFooter();
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    
    const sendButton = screen.getByRole('button', { name: '' }); // Submit button
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has content', async () => {
    renderFooter();
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    
    const input = screen.getByPlaceholderText('Type a message...');
    await userEvent.type(input, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: '' }); // Submit button
    expect(sendButton).not.toBeDisabled();
  });
}); 