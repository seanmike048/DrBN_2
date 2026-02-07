import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '../components/Layout';
import HomeScreen from '../components/HomeScreen';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, isGuest, continueAsGuest } = useAuth();

  const handleStart = () => {
    // If already logged in or guest, go to dashboard
    // Otherwise, go to auth with intent to return to dashboard
    if (user || isGuest) {
      navigate('/dashboard');
    } else {
      navigate('/auth?action=signup');
    }
  };

  const handleLogin = () => {
    navigate('/auth?action=login');
  };

  const handleSignup = () => {
    navigate('/auth?action=signup');
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gold border-t-transparent" />
      </div>
    );
  }

  // Always show homepage - no auto-redirect
  return (
    <Layout showLanguageToggle={true}>
      <HomeScreen
        onStart={handleStart}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onGuest={handleGuest}
      />
    </Layout>
  );
};

export default Index;
