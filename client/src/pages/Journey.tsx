import React from 'react';
import { useParams } from 'react-router-dom';
import { Journey as JourneyComponent } from '../components/journey/Journey';

const Journey: React.FC = () => {
  const { journeyId } = useParams<{ journeyId: string }>();

  if (!journeyId) {
    return <div>Journey ID is required</div>;
  }

  return <JourneyComponent journeyId={journeyId} />;
};

export default Journey; 