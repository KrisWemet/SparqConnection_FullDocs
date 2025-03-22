import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const UpdatePrompt: React.FC = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for the controlling service worker changing
      // and reload the page
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // Check for service worker updates
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          // Check for updates every hour
          setInterval(async () => {
            await registration.update();
          }, 60 * 60 * 1000);

          // Listen for new service workers
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              // When the new service worker is installed, show the update prompt
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdatePrompt(true);
              }
            });
          });
        } catch (error) {
          console.error('Error checking for service worker updates:', error);
        }
      };

      checkForUpdates();
    }
  }, []);

  const handleUpdate = () => {
    // Trigger the reload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  };

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <UpdateBanner
          onClick={handleUpdate}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <IconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </IconWrapper>
          <span>Update available! Click to refresh</span>
        </UpdateBanner>
      )}
    </AnimatePresence>
  );
};

const UpdateBanner = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: var(--primary);
  color: white;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  gap: 8px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default UpdatePrompt; 