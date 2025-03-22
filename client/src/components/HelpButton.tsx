import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestion, FaTimes, FaSearch, FaChevronRight } from 'react-icons/fa';
import { trackEvent } from '../utils/analytics';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface HelpButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const HelpButton: React.FC<HelpButtonProps> = React.memo(({ 
  position = 'bottom-right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  // Fetch FAQs
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/faq');
        const data = await response.json();
        setFaqs(data.faqs);
        setFilteredFaqs(data.faqs);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchFaqs();
      trackEvent('help_button_opened');
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const lowercaseQuery = query.toLowerCase();
    
    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(lowercaseQuery) ||
      faq.answer.toLowerCase().includes(lowercaseQuery) ||
      faq.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredFaqs(filtered);
    trackEvent('faq_searched', { query });
  }, [faqs]);

  // Handle FAQ selection
  const handleFaqSelect = useCallback((faq: FAQ) => {
    setSelectedFaq(faq);
    trackEvent('faq_viewed', { faqId: faq.id });
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedFaq(null);
    setSearchQuery('');
    trackEvent('help_button_closed');
  }, []);

  return (
    <>
      {/* Help Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionStyles[position]} z-50 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open help"
      >
        <FaQuestion size={24} />
      </motion.button>

      {/* FAQ Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedFaq ? 'FAQ Details' : 'Help Center'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close help"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Search Bar */}
              {!selectedFaq && (
                <div className="p-4 border-b">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search FAQs..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : selectedFaq ? (
                  <div>
                    <button
                      onClick={() => setSelectedFaq(null)}
                      className="mb-4 text-purple-600 hover:text-purple-700 flex items-center"
                    >
                      <FaChevronRight className="transform rotate-180 mr-1" />
                      Back to FAQs
                    </button>
                    <h3 className="text-xl font-semibold mb-4">{selectedFaq.question}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedFaq.answer}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedFaq.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : filteredFaqs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq) => (
                      <motion.button
                        key={faq.id}
                        onClick={() => handleFaqSelect(faq)}
                        className="w-full text-left p-4 rounded-lg hover:bg-purple-50 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                        <p className="text-gray-600 line-clamp-2">{faq.answer}</p>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No FAQs found matching your search.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

HelpButton.displayName = 'HelpButton';

export default HelpButton; 