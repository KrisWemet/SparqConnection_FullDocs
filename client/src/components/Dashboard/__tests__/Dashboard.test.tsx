import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  it('renders welcome message', () => {
    renderDashboard();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('renders all dashboard cards', () => {
    renderDashboard();
    
    // Check for all card titles
    expect(screen.getByText('Daily Prompt')).toBeInTheDocument();
    expect(screen.getByText('Relationship Quiz')).toBeInTheDocument();
    expect(screen.getByText('Love Journeys')).toBeInTheDocument();
    expect(screen.getByText('Activities')).toBeInTheDocument();
    expect(screen.getByText('Expert Advice')).toBeInTheDocument();
  });

  it('shows premium badge on premium features', () => {
    renderDashboard();
    
    const premiumBadges = screen.getAllByText('Premium');
    // Activities, Expert Advice, and Premium teaser cards
    expect(premiumBadges).toHaveLength(3);
  });

  it('displays progress bars for tracked activities', () => {
    renderDashboard();
    
    // Check Daily Prompt progress
    expect(screen.getByText('15 of 30 completed')).toBeInTheDocument();
    
    // Check Quiz progress
    expect(screen.getByText('3 of 5 completed')).toBeInTheDocument();
    
    // Check Journeys progress
    expect(screen.getByText('2 of 7 completed')).toBeInTheDocument();
  });

  it('renders premium teaser card with call to action', () => {
    renderDashboard();
    
    expect(screen.getByText('Unlock All Features')).toBeInTheDocument();
    expect(screen.getByText('Get unlimited access to premium activities, expert advice, and more.')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });
}); 