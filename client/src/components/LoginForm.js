// Building the LoginForm component
import React, { useState } from 'react';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom'

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

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
            const res = await login(formData);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token); // Store token in localStorage
            alert('Login successful!');
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } 
    };
    return (
        <div className="login-form">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
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
                <button type="submit">Login</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            {user && <p>Welcome, {user.username}!</p>}
        </div>
    );
};
export default LoginForm;
// This component handles user login, manages form state, and displays error messages.
