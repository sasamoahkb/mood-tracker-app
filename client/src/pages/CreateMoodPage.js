import MoodForm from '../components/MoodForm';
import { getToken } from '../utils/auth';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateMoodPage = () => {
    const navigate = useNavigate();
    const token = getToken(); // Retrieve token from localStorage

    useEffect(() => {
        if (!token) {
            navigate('/login'); // Redirect to login if no token is found
        }
    }, [token, navigate]);

    if (!token) return null; // Prevent rendering if no token is available

    return (
        <div>
            <h1>Create Mood Entry</h1>
            <MoodForm token={token} />
        </div>
    );
};

export default CreateMoodPage;
