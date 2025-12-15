'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError(language === 'en' ? 'Invalid reset link' : 'رابط إعادة التعيين غير صالح');
    }
  }, [searchParams, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!newPassword || !confirmPassword) {
      setError(language === 'en' ? 'Please fill in all fields' : 'الرجاء ملء جميع الحقول');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 8) {
      setError(language === 'en' ? 'Password must be at least 8 characters' : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage(
        language === 'en'
          ? 'Password reset successfully! Redirecting to login...'
          : 'تم إعادة تعيين كلمة المرور بنجاح! جاري التوجيه إلى تسجيل الدخول...'
      );

      // Redirect to account page after 2 seconds
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setError(
        (err as Error).message ||
        (language === 'en'
          ? 'Failed to reset password. Please try again.'
          : 'فشل في إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.')
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
            {language === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور'}
          </h1>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Enter your new password below.'
              : 'أدخل كلمة المرور الجديدة أدناه.'}
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

          {!token && !message ? (
            <div className="text-center py-4">
              <p className="text-red-600 mb-4">
                {language === 'en' ? 'Invalid or missing reset token' : 'رمز إعادة التعيين غير صالح أو مفقود'}
              </p>
              <Link
                href="/forgot-password"
                className="text-tea-green hover:underline"
              >
                {language === 'en' ? 'Request a new reset link' : 'طلب رابط إعادة تعيين جديد'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={language === 'en' ? '••••••••' : '••••••••'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
                disabled={loading || !!message}
              />

              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'en' ? '••••••••' : '••••••••'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-2"
                disabled={loading || !!message}
              />

              <p className="text-xs text-gray-500 mb-4">
                {language === 'en'
                  ? 'Password must be at least 8 characters'
                  : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'}
              </p>

              <button
                type="submit"
                disabled={loading || !!message}
                className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition mb-4"
              >
                {loading
                  ? (language === 'en' ? 'Resetting...' : 'جاري إعادة التعيين...')
                  : (language === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور')}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tea-green"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
