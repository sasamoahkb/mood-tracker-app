// Building the SignupForm component
import React, { useState } from 'react';
import { loginUser } from '../api/api';

const SignupForm = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };  

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await registerUser(formData);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token); // Store token in localStorage
            alert('Signup successful!');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } 
    };
    return (
        <div className="login-form">
            <h2>Sign up</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Register</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            {user && <p>Welcome, {user.username}!</p>}
        </div>
    );
};
export default SignupForm;
// This component handles user login, manages form state, and displays error messages.
