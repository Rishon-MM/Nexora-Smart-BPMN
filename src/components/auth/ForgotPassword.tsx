import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { resetPasswordWithSecurityQuestion, error, isLoading, clearError, getSecurityQuestion } = useAuthStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingEmail(true);
    clearError();

    try {
      const question = await getSecurityQuestion(email);
      if (question) {
        setSecurityQuestion(question);
      } else {
        throw new Error('No account found with this email address');
      }
    } catch (error: any) {
      useAuthStore.getState().error = error.message;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await resetPasswordWithSecurityQuestion(email, securityAnswer);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          {securityQuestion 
            ? "Please answer your security question to continue."
            : "Enter your email address to start the password reset process."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {!securityQuestion ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isCheckingEmail}
              className={cn(
                "flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isCheckingEmail ? 'Checking...' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Security Question
            </label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {securityQuestion}
            </p>
          </div>

          <div>
            <label htmlFor="security-answer" className="block text-sm font-medium text-gray-700">
              Your Answer
            </label>
            <input
              id="security-answer"
              type="text"
              required
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSecurityQuestion(null);
                setSecurityAnswer('');
                clearError();
              }}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}