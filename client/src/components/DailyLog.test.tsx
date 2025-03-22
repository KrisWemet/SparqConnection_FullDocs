import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';
import DailyLog from './DailyLog';
import { AuthProvider } from '../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    },
    isAuthenticated: true
  })
}));

describe('DailyLog Component', () => {
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <DailyLog />
        </AuthProvider>
      </ThemeProvider>
    );
  };

  it('renders the daily log form', async () => {
    renderComponent();
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(/Daily Log/i)).toBeInTheDocument();
    });
  });

  it('allows users to input their daily reflection', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Find and interact with form elements
    const reflectionInput = screen.getByLabelText(/reflection/i);
    await user.type(reflectionInput, 'Test reflection');

    expect(reflectionInput).toHaveValue('Test reflection');
  });

  it('submits the form successfully', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Fill out the form
    const reflectionInput = screen.getByLabelText(/reflection/i);
    await user.type(reflectionInput, 'Test reflection');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText(/successfully submitted/i)).toBeInTheDocument();
    });
  });

  it('displays error message when submission fails', async () => {
    // TODO: Implement error case test
    // This would involve mocking the API to return an error
    // and verifying that the error message is displayed
  });
}); 