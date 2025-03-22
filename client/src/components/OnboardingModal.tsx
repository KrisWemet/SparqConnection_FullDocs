import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useJourneys } from '../hooks/useJourneys';

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
}

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const StepContent = styled(motion.div)`
  text-align: center;
  padding: 1rem;
`;

const StepImage = styled.img`
  max-width: 200px;
  height: auto;
  margin: 1rem auto;
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  gap: 0.5rem;
`;

const ProgressDot = styled.div<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#4CAF50' : '#E0E0E0'};
  transition: background 0.3s ease;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  background: ${props => props.primary ? '#4CAF50' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#666'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.primary ? '0 4px 12px rgba(76, 175, 80, 0.2)' : 'none'};
  }
`;

const JourneyCard = styled.div<{ selected: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#4CAF50' : '#E0E0E0'};
  border-radius: 10px;
  margin: 0.5rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4CAF50;
    transform: translateY(-2px);
  }
`;

const NotificationPrompt = styled.div`
  background: #F5F5F5;
  padding: 1.5rem;
  border-radius: 10px;
  margin: 1rem 0;
  text-align: left;
`;

const OnboardingModal: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { journeys, suggestJourney } = useJourneys();

  const steps: OnboardingStep[] = [
    {
      title: 'Welcome to Sparq Connection',
      description: 'Begin your journey to personal growth and meaningful connections.',
      image: '/assets/welcome-illustration.svg',
    },
    {
      title: 'Find Your Path',
      description: 'Choose a journey that resonates with your goals.',
      image: '/assets/journey-illustration.svg',
    },
    {
      title: 'Stay Connected',
      description: 'Enable notifications to stay on track with your journey.',
      image: '/assets/notification-illustration.svg',
    },
  ];

  useEffect(() => {
    // Check if this is user's first login
    if (user && !localStorage.getItem('onboardingComplete')) {
      setShowModal(true);
    }
  }, [user]);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleJourneySelect = (journeyId: string) => {
    setSelectedJourney(journeyId);
  };

  const requestNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notifications:', error);
      return false;
    }
  };

  const completeOnboarding = async () => {
    if (selectedJourney) {
      // Start the selected journey
      await suggestJourney(selectedJourney);
    }

    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    setShowModal(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepContent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <StepImage src={steps[0].image} alt="Welcome" />
            <h2>{steps[0].title}</h2>
            <p>{steps[0].description}</p>
          </StepContent>
        );
      case 1:
        return (
          <StepContent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2>{steps[1].title}</h2>
            <p>{steps[1].description}</p>
            <div>
              {journeys.map(journey => (
                <JourneyCard
                  key={journey.id}
                  selected={selectedJourney === journey.id}
                  onClick={() => handleJourneySelect(journey.id)}
                >
                  <h3>{journey.title}</h3>
                  <p>{journey.description}</p>
                </JourneyCard>
              ))}
            </div>
          </StepContent>
        );
      case 2:
        return (
          <StepContent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <StepImage src={steps[2].image} alt="Notifications" />
            <h2>{steps[2].title}</h2>
            <p>{steps[2].description}</p>
            <NotificationPrompt>
              <p>
                Get timely reminders about:
                <ul>
                  <li>Daily activities</li>
                  <li>Partner connections</li>
                  <li>Journey milestones</li>
                </ul>
              </p>
              <Button primary onClick={requestNotifications}>
                Enable Notifications
              </Button>
            </NotificationPrompt>
          </StepContent>
        );
      default:
        return null;
    }
  };

  if (!showModal) return null;

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ModalContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        <ProgressBar>
          {steps.map((_, index) => (
            <ProgressDot key={index} active={currentStep === index} />
          ))}
        </ProgressBar>

        <ButtonGroup>
          {currentStep > 0 && (
            <Button onClick={handleBack}>
              Back
            </Button>
          )}
          <Button primary onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default OnboardingModal; 