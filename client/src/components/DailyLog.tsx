import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

interface DailyLogEntry {
  action: string;
  reflection: string;
  mood: 1 | 2 | 3 | 4 | 5;
  date: string;
}

interface MoodButtonProps {
  selected: boolean;
  disabled?: boolean;
}

interface StyledButtonProps {
  disabled?: boolean;
}

const DailyLog: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [formData, setFormData] = useState<DailyLogEntry>({
    action: '',
    reflection: '',
    mood: 3,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    checkTodaysLog();
  }, [user]);

  const checkTodaysLog = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/dailyLog/today`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasLoggedToday(data.exists);
        if (data.exists && data.log) {
          setFormData(data.log);
        }
      }
    } catch (error) {
      console.error('Error checking today\'s log:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a daily log');
      return;
    }

    if (!formData.action.trim()) {
      toast.error('Please enter an action');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dailyLog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit log');
      }

      toast.success('Daily log submitted successfully!');
      setHasLoggedToday(true);
    } catch (error) {
      toast.error('Failed to submit log. Please try again.');
      console.error('Log submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, action: e.target.value });
  };

  const handleReflectionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, reflection: e.target.value });
  };

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Daily Connection Log</Title>
        <Description>
          Record one meaningful action you took today to strengthen your relationship.
        </Description>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Today's Action</Label>
            <Input
              placeholder="What did you do today to connect with your partner?"
              value={formData.action}
              onChange={handleActionChange}
              required
              disabled={hasLoggedToday}
            />
          </InputGroup>

          <InputGroup>
            <Label>Reflection</Label>
            <TextArea
              placeholder="How did this action impact your relationship?"
              value={formData.reflection}
              onChange={handleReflectionChange}
              disabled={hasLoggedToday}
            />
          </InputGroup>

          <InputGroup>
            <Label>Mood</Label>
            <MoodSelector>
              {moodEmojis.map((emoji, index) => (
                <MoodButton
                  key={index}
                  type="button"
                  selected={formData.mood === index + 1}
                  onClick={() => setFormData({ ...formData, mood: (index + 1) as 1 | 2 | 3 | 4 | 5 })}
                  disabled={hasLoggedToday}
                >
                  {emoji}
                </MoodButton>
              ))}
            </MoodSelector>
          </InputGroup>

          <SubmitButton
            type="submit"
            disabled={loading || hasLoggedToday}
            whileHover={{ scale: hasLoggedToday ? 1 : 1.02 }}
            whileTap={{ scale: hasLoggedToday ? 1 : 0.98 }}
          >
            {hasLoggedToday ? 'Already Logged Today' : loading ? 'Submitting...' : 'Submit Log'}
          </SubmitButton>
        </Form>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: ${({ theme }) => theme.colors.background};
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 24px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  text-align: center;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    cursor: not-allowed;
  }
`;

const MoodSelector = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const MoodButton = styled.button<MoodButtonProps>`
  font-size: 24px;
  padding: 8px;
  border: 2px solid ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  background: ${({ theme, selected }) => selected ? theme.colors.primary + '20' : 'transparent'};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

const SubmitButton = styled(motion.button)<StyledButtonProps>`
  padding: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  transition: opacity 0.2s ease;
`;

export default DailyLog; 