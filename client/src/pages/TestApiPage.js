// src/pages/TestApiPage.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TestApiPage() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.get('/')
            .then(res => {
                setMessage(res.data.message || 'No message field');
            })
            .catch(err => {
                console.error(err);
                setMessage('Error connecting to API');
            });
    }, []);

    return (
        <div>
            <h1>Backend Test</h1>
            <p>{message}</p>
        </div>
    );
}
