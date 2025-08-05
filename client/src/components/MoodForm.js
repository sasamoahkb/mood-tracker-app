import React, { useState } from 'react';
import { createMoodEntry } from '../api/api';
import { getToken } from '../utils/auth';   

const MoodForm = () => {
    const token = getToken(); // Retrieve token from localStorage
    const [formData, setFormData] = useState({
        mood: '',
        mood_rating: 5,
        notes: '',
        location: '',
        factors: [{ factor_id: '', intensity: 5 }]
    });

    const [errors, setErrors] = useState({});

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
        setFormData(prev => ({
        ...prev,
        factors: newFactors
        }));
    };

    const addFactor = () => {
        setFormData(prev => ({
        ...prev,
        factors: [...prev.factors, { factor_id: '', intensity: 5 }]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.mood.trim()) {
        newErrors.mood = 'Mood is required.';
        }

        if (formData.mood_rating < 1 || formData.mood_rating > 10) {
        newErrors.mood_rating = 'Mood rating must be between 1 and 10.';
        }

        formData.factors.forEach((factor, index) => {
            if (!factor.factor_id.trim()) {
                newErrors[`factor_id_${index}`] = 'Factor ID is required.';
            }

        const intensity = parseInt(factor.intensity);
            if (intensity < 1 || intensity > 10 || isNaN(intensity)) {
                newErrors[`intensity_${index}`] = 'Intensity must be between 1 and 10.';
            }
        });

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const response = await createMoodEntry(formData, token);
            console.log('Mood entry created:', response.data);
            alert('Mood entry submitted successfully!');

        // Reset form and errors
        setFormData({
            mood: '',
            mood_rating: 5,
            notes: '',
            location: '',
            factors: [{ factor_id: '', intensity: 5 }]
        });
            setErrors({});
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
        <input
          type="text"
          name="mood"
          value={formData.mood}
          onChange={handleChange}
          required
        />
        {errors.mood && <p className="error">{errors.mood}</p>}
      </label>

      <label>
        Mood Rating (1–10):
        <input
          type="number"
          name="mood_rating"
          min="1"
          max="10"
          value={formData.mood_rating}
          onChange={handleChange}
          required
        />
        {errors.mood_rating && <p className="error">{errors.mood_rating}</p>}
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
            {errors[`factor_id_${index}`] && (
              <p className="error">{errors[`factor_id_${index}`]}</p>
            )}
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
            {errors[`intensity_${index}`] && (
              <p className="error">{errors[`intensity_${index}`]}</p>
            )}
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
