import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import croixLogo from '/croix.png';

const AuthContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const [isLogin, setIsLogin] = useState(action !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, loading, isGuest, signIn, signUp, continueAsGuest } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // If already authenticated, go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          // Success - navigate to dashboard
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage(t('checkEmail'));
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex justify-end items-center px-5 h-[68px] flex-shrink-0">
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-5 py-8">
        {/* Logo */}
        <div className="w-[160px] h-auto mb-8 animate-fade-in">
          <img 
            src={croixLogo}
            alt="Docteur Beauté Noire"
            className="w-full h-auto object-contain"
            loading="eager"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="label-docteur mb-2 block">{t('docteur')}</span>
          <h1 className="heading-main text-3xl">{t('beauteNoire')}</h1>
        </div>

        {/* Auth Card */}
        <div 
          className="w-full max-w-[380px] bg-card rounded-2xl p-6 shadow-elegant animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className="text-xl font-display text-center mb-6 text-foreground">
            {isLogin ? t('signIn') : t('createAccount')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                isLogin ? t('signIn') : t('signUp')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? t('noAccount') : t('haveAccount')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const Auth: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthContent />
    </LanguageProvider>
  );
};

export default Auth;
