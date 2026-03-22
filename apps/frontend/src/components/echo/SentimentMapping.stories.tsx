import React from 'react';
import SentimentMapping from './SentimentMapping';

const meta = {
  title: 'Echo/SentimentMapping',
  component: SentimentMapping,
};

export default meta;

export const Default = () => <SentimentMapping audio={null} />;
