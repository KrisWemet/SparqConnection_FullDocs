import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store in localStorage to prevent showing again in this session
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt || localStorage.getItem('pwaPromptDismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <PromptContainer
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <PromptContent>
            <PromptText>
              Install Sparq Connection for a better experience! Access your relationship tools even when offline.
            </PromptText>
            <ButtonGroup>
              <InstallButton 
                onClick={handleInstallClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Install App
              </InstallButton>
              <CloseButton 
                onClick={handleDismiss} 
                aria-label="Close"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </CloseButton>
            </ButtonGroup>
          </PromptContent>
        </PromptContainer>
      )}
    </AnimatePresence>
  );
};

const PromptContainer = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px;
`;

const PromptContent = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const PromptText = styled.p`
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 1rem;
  
  @media (min-width: 768px) {
    margin: 0 16px 0 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

const InstallButton = styled(motion.button)`
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 12px;
`;

const CloseButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 4px 8px;
`;

export default InstallPrompt; 