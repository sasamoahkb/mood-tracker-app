import React, { useState } from 'react';
import { createMoodEntry } from '../api/api';

const MoodForm = ({ token }) => {
  const [formData, setFormData] = useState({
    mood: '',
    mood_rating: 5,
    notes: '',
    location: '',
    factors: [{ factor_id: '', intensity: 5 }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFactorChange = (index, field, value) => {
    const newFactors = [...formData.factors];
    newFactors[index][field] = value;
    setFormData({ ...formData, factors: newFactors });
  };

  const addFactor = () => {
    setFormData(prev => ({
      ...prev,
      factors: [...prev.factors, { factor_id: '', intensity: 5 }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createMoodEntry(formData, token);
      console.log('Mood entry created:', response.data);
      alert('Mood entry submitted successfully!');
    } catch (err) {
      console.error('Error submitting mood entry:', err);
      alert('Failed to submit mood entry.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log Your Mood</h2>

      <label>
        Mood:
        <input type="text" name="mood" value={formData.mood} onChange={handleChange} required />
      </label>

      <label>
        Mood Rating (1-10):
        <input type="number" name="mood_rating" min="1" max="10" value={formData.mood_rating} onChange={handleChange} required />
      </label>

      <label>
        Notes:
        <textarea name="notes" value={formData.notes} onChange={handleChange} />
      </label>

      <label>
        Location:
        <input type="text" name="location" value={formData.location} onChange={handleChange} />
      </label>

      <h3>Factors</h3>
      {formData.factors.map((factor, index) => (
        <div key={index}>
          <label>
            Factor ID:
            <input
              type="text"
              value={factor.factor_id}
              onChange={(e) => handleFactorChange(index, 'factor_id', e.target.value)}
              required
            />
          </label>

          <label>
            Intensity (1–10):
            <input
              type="number"
              min="1"
              max="10"
              value={factor.intensity}
              onChange={(e) => handleFactorChange(index, 'intensity', e.target.value)}
              required
            />
          </label>
        </div>
      ))}
      <button type="button" onClick={addFactor}>Add Another Factor</button>

      <br />
      <button type="submit">Submit Mood Entry</button>
    </form>
  );
};

export default MoodForm;
