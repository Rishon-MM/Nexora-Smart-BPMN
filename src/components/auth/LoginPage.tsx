import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Chrome } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ForgotPassword } from './ForgotPassword';

const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favorite book?"
];

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const { signIn, createAccount, signInWithGoogle, error, clearError, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isSignUp && !hasAcceptedTerms) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }

    try {
      if (isSignUp) {
        await createAccount(email, password, {
          question: securityQuestion,
          answer: securityAnswer
        });
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSignUp && !hasAcceptedTerms) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          <ForgotPassword onBack={() => setIsForgotPassword(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white-600 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/assets/Icon-DaJVHgnW.png" alt="Nexora Logo"></img>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-blue-600">NEXORA SMART BPMN</h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp
                ? 'Create a new account to get started'
                : 'Welcome back! Please sign in to continue'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={isSignUp ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                pattern={isSignUp ? "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$" : undefined}
                title={isSignUp ? "Password must contain at least 8 characters, including uppercase and lowercase letters, numbers and special characters" : undefined}
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
                </p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="security-question" className="block text-sm font-medium text-gray-700">
                  Security Question
                </label>
                <select
                  id="security-question"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {SECURITY_QUESTIONS.map((question) => (
                    <option key={question} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Required for password resetting"
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={isSignUp}
                />
              </div>
            )}

            {isSignUp && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I accept the terms and conditions
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    By creating an account, you agree to our data collection practices. We use Firebase
                    for authentication and data storage, and OpenAI API for AI features. We do not
                    share your personal information with third parties for marketing purposes. Your data
                    is processed in accordance with our Standard privacy policy and terms of service.
                    *Request through our website to delete your data.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || (isSignUp && !hasAcceptedTerms)}
              className={cn(
                "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            {!isSignUp && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="w-full text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || (isSignUp && !hasAcceptedTerms)}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm",
                "text-sm font-medium text-gray-700 bg-white hover:bg-gray-50",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Chrome className="w-5 h-5" />
              Google
            </button>
          </div>
        </form>

        <div className="text-center pt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
