import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import CreateMoodPage from './pages/CreateMoodPage';
import MoodHistory from './pages/MoodHistory';

const App = () => {
  return (
    <Router>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/create-mood-entry" element={<CreateMoodPage />} />
        <Route path="/history" element={<MoodHistory />} />
      </Routes>
    </Router>
  );
};

export default App;
