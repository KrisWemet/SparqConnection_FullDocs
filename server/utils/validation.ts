/**
 * Validates an email address
 * @param email The email address to validate
 * @returns boolean indicating if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number
 * @param phone The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export const isValidPhone = (phone: string): boolean => {
  // Accepts formats: +1234567890, 1234567890, +1 (234) 567-890
  const phoneRegex = /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone);
}; 