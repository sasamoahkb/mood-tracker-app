import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/me');
        setUser(data.data);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  if (!user) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Welcome back, {user.username}!</h2>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default Dashboard;
