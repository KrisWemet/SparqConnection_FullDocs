import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface InvitePartnerProps {
  onClose: () => void;
}

const InvitePartner: React.FC<InvitePartnerProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Implement invitation logic here
      // Example:
      // await invitePartner(email, user.id);
      
      // For now, just simulate a successful invite
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSent(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">Invite Your Partner</h2>
      
      {!sent ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Partner's Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="partner@example.com"
              required
            />
          </div>
          
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-md disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-green-600">
            Invitation sent to {email}!
          </p>
          <p className="mb-6 text-gray-600">
            Your partner will receive an email with instructions on how to join.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-blue-600 rounded-md"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default InvitePartner; 