import React from 'react';
import MoodForm from '../components/MoodForm';

const CreateMoodPage = ({ token }) => {
  return (
    <div>
      <h1>Create Mood Entry</h1>
      <MoodForm token={token} />
    </div>
  );
};

export default CreateMoodPage;
