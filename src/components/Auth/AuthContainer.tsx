import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const AuthContainer: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, register } = useAuth();

  const handleLoginSuccess = () => {
    // Authentication is handled by the AuthContext
    // This is just a callback for the Login component
    console.log('Login successful');
  };

  const handleRegisterSuccess = () => {
    // Authentication is handled by the AuthContext
    // This is just a callback for the Register component
    console.log('Registration successful');
    // Switch to login view after successful registration
    setIsLoginView(true);
  };

  return (
    <div className="auth-wrapper">
      {isLoginView ? (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onRegisterClick={() => setIsLoginView(false)} 
        />
      ) : (
        <Register 
          onRegisterSuccess={handleRegisterSuccess} 
          onLoginClick={() => setIsLoginView(true)} 
        />
      )}
    </div>
  );
};

export default AuthContainer;
