'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email.trim()) {
      setError(language === 'en' ? 'Please enter your email' : 'الرجاء إدخال بريدك الإلكتروني');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError(language === 'en' ? 'Please enter a valid email address' : 'الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-reset',
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setMessage(
        language === 'en'
          ? 'If an account exists with this email, a password reset link has been sent.'
          : 'إذا كان هناك حساب مرتبط بهذا البريد، فقد تم إرسال رابط إعادة تعيين كلمة المرور.'
      );
      setEmail('');
    } catch (err) {
      console.error('Error:', err);
      setError(
        language === 'en'
          ? 'Failed to process request. Please try again.'
          : 'فشل في معالجة الطلب. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-deep-brown mb-2">
            {language === 'en' ? 'Forgot Password?' : 'نسيت كلمة المرور؟'}
          </h1>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Enter your email address and we\'ll send you a link to reset your password.'
              : 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'en' ? 'your@email.com' : 'your@email.com'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
              dir="ltr"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition mb-4"
            >
              {loading
                ? (language === 'en' ? 'Sending...' : 'جاري الإرسال...')
                : (language === 'en' ? 'Send Reset Link' : 'إرسال رابط إعادة التعيين')}
            </button>

            <div className="text-center">
              <Link
                href="/account"
                className="text-sm text-tea-green hover:underline"
              >
                {language === 'en' ? 'Back to Login' : 'العودة إلى تسجيل الدخول'}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
