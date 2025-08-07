import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoodHistory } from '../services/api';
import { getToken } from '../utils/auth';

const MoodHistory = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = getToken();
  const navigate = useNavigate();

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch mood history
  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (!token) {
        setLoading(false);
        setError('No token found. Please log in to view your mood history.');
        return;
      }

      try {
        const response = await getMoodHistory(token);
        setMoodEntries(response.data.data || []);
      } catch (err) {
        setError('Failed to fetch mood history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodHistory();
  }, [token]);

  if (loading) return <p>Loading mood history...</p>;
  if (error) return <p>{error}</p>;
  if (!moodEntries.length) return <p>No mood entries found.</p>;

  return (
    <div>
      <h2>Your Mood History</h2>
      <ul>
        {moodEntries.map((entry) => (
          <li key={entry.entry_id} style={{ marginBottom: '1rem' }}>
            <strong>Date:</strong>{' '}
            {new Date(entry.created_at).toLocaleString()} <br />
            <strong>Mood:</strong> {entry.mood} (Rating: {entry.mood_rating}) <br />
            {entry.notes && (
              <>
                <strong>Notes:</strong> {entry.notes} <br />
              </>
            )}
            {entry.location && (
              <>
                <strong>Location:</strong> {entry.location} <br />
              </>
            )}
            {entry.factors?.length > 0 && (
              <>
                <strong>Factors:</strong>
                <ul>
                  {entry.factors.map((factor, idx) => (
                    <li key={idx}>
                      ID: {factor.factor_id}, Intensity: {factor.intensity}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoodHistory;
