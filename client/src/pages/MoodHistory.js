import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoodHistory } from '../api/api';
import { getToken } from '../utils/auth';
const MoodHistory = () => {
    
    const [moodEntries, setMoodEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = getToken(); // Retrieve token from localStorage
    const navigate = useNavigate();
    useEffect(() => {
        if (!token) {
            navigate('/login'); // Redirect to login if no token is found
        }
    }, [token, navigate]);
        if (!token) return null; // Prevent rendering if no token is available
        
    // Fetch mood history on mount
    useEffect(() => {
        
        const fetchMoodHistory = async () => {
        try {
            
            const response = await getMoodHistory(token);
            setMoodEntries(response.data); // Assuming API returns an array
        } catch (err) {
            setError('Failed to fetch mood history.');
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        if (token) {
            fetchMoodHistory();
        } else {
            setLoading(false);
            setError('No token found. Please log in to view your mood history.');
        }
    }, [token]);
    
    // Render mood history

    if (loading) return <p>Loading mood history...</p>;
    if (error) return <p>{error}</p>;
    if (!moodEntries.length) return <p>No mood entries found.</p>;

    return (
        <div>
            <h2>Your Mood History</h2>
            <ul>
                {moodEntries.map((entry) => (
                <li key={entry.id} style={{ marginBottom: '1rem' }}>
                    <strong>Date:</strong> {new Date(entry.created_at).toLocaleString()} <br />
                    <strong>Mood:</strong> {entry.mood} (Rating: {entry.mood_rating}) <br />
                    {entry.notes && <><strong>Notes:</strong> {entry.notes} <br /></>}
                    {entry.location && <><strong>Location:</strong> {entry.location} <br /></>}

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
