import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { newsletterAPI } from '../lib/api';

const UnsubscribePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Pre-fill email from URL params if available
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage(t('validation.emailRequired'));
      return;
    }

    setIsUnsubscribing(true);
    setStatus(null);
    setMessage('');

    try {
      await newsletterAPI.unsubscribe(email);
      setStatus('success');
      setMessage(t('footer.unsubscribeSuccess'));
    } catch (error) {
      setStatus('error');
      if (error.response?.status === 404) {
        setMessage('Email not found in newsletter subscriptions');
      } else {
        setMessage(t('footer.unsubscribeError'));
      }
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('footer.unsubscribeTitle')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('footer.unsubscribeDescription')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'success' ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unsubscribed Successfully
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {message}
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
              >
                Return to Homepage
              </a>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder={t('footer.emailPlaceholder')}
                    disabled={isUnsubscribing}
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-md ${
                  status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isUnsubscribing}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUnsubscribing ? t('common.loading') : t('footer.unsubscribe')}
                </button>
              </div>

              <div className="text-center">
                <a
                  href="/"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Return to Homepage
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;
