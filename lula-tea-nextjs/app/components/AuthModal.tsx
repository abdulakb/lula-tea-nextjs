'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/lib/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
  language: 'en' | 'ar';
}

type AuthStep = 'phone' | 'otp' | 'profile' | 'email-login' | 'email-signup';
type AuthMethod = 'phone' | 'email';

export default function AuthModal({ isOpen, onClose, onSuccess, language }: AuthModalProps) {
  const t = translations[language];
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOTP, setDevOTP] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setAuthMethod('phone');
      setStep('phone');
      setPhone('');
      setOtp('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setDevOTP('');
    }
  }, [isOpen]);

  const sanitizePhone = (phoneNumber: string) => {
    // Remove any non-digit characters
    let digits = phoneNumber.replace(/\D/g, '');
    
    // If starts with 966, keep as is
    if (digits.startsWith('966')) {
      return '+' + digits;
    }
    
    // If starts with 0, replace with 966
    if (digits.startsWith('0')) {
      return '+966' + digits.slice(1);
    }
    
    // If starts with 5 (mobile number without country code), add 966
    if (digits.startsWith('5') && digits.length === 9) {
      return '+966' + digits;
    }
    
    // Otherwise, assume it needs 966 prefix
    return '+966' + digits;
  };

  const handleRequestOTP = async () => {
    setError('');
    
    if (!phone.trim()) {
      setError(language === 'en' ? 'Please enter your phone number' : 'الرجاء إدخال رقم الهاتف');
      return;
    }

    const sanitizedPhone = sanitizePhone(phone);
    
    // Basic Saudi phone validation
    if (!sanitizedPhone.match(/^\+9665\d{8}$/)) {
      setError(
        language === 'en'
          ? 'Please enter a valid Saudi phone number (e.g., 0501234567)'
          : 'الرجاء إدخال رقم هاتف سعودي صحيح (مثال: 0501234567)'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-otp',
          phone: sanitizedPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Store dev OTP if provided
      if (data.devOTP) {
        setDevOTP(data.devOTP);
      }

      setStep('otp');
      setCountdown(600); // 10 minutes
      setPhone(sanitizedPhone); // Update with sanitized version
    } catch (err) {
      console.error('Error requesting OTP:', err);
      setError(
        language === 'en'
          ? 'Failed to send OTP. Please try again.'
          : 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    
    if (!otp.trim() || otp.length !== 6) {
      setError(language === 'en' ? 'Please enter the 6-digit code' : 'الرجاء إدخال الرمز المكون من 6 أرقام');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          phone,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Check if customer has profile info
      if (data.customer && data.customer.name) {
        // Complete profile, save to session and close
        saveCustomerSession(data.customer);
        onSuccess(data.customer);
        onClose();
      } else {
        // New customer, go to profile step
        setStep('profile');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(
        language === 'en'
          ? 'Invalid or expired code. Please try again.'
          : 'رمز غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError(language === 'en' ? 'Please enter email and password' : 'الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save to session and close
      saveCustomerSession(data.customer);
      onSuccess(data.customer);
      onClose();
    } catch (err) {
      console.error('Error logging in:', err);
      setError(
        language === 'en'
          ? 'Invalid email or password'
          : 'بريد إلكتروني أو كلمة مرور غير صحيحة'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    setError('');
    
    if (!email.trim() || !name.trim() || !password.trim()) {
      setError(language === 'en' ? 'Please fill in all required fields' : 'الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 8) {
      setError(language === 'en' ? 'Password must be at least 8 characters' : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Save to session and close
      saveCustomerSession(data.customer);
      onSuccess(data.customer);
      onClose();
    } catch (err) {
      console.error('Error signing up:', err);
      setError(
        language === 'en'
          ? (err as Error).message || 'Failed to create account'
          : 'فشل في إنشاء الحساب'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    setError('');
    
    if (!name.trim()) {
      setError(language === 'en' ? 'Please enter your name' : 'الرجاء إدخال اسمك');
      return;
    }

    setLoading(true);

    try {
      // Update customer profile
      const response = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name,
          email: email || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Save to session and close
      saveCustomerSession(data.customer);
      onSuccess(data.customer);
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(
        language === 'en'
          ? 'Failed to save profile. Please try again.'
          : 'فشل في حفظ الملف الشخصي. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  const saveCustomerSession = (customer: any) => {
    localStorage.setItem('lula_customer', JSON.stringify(customer));
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-deep-brown mb-6">
          {(step === 'phone' || step === 'email-login' || step === 'email-signup') && (language === 'en' ? 'Sign In / Sign Up' : 'تسجيل الدخول / إنشاء حساب')}
          {step === 'otp' && (language === 'en' ? 'Verify Your Phone' : 'تحقق من هاتفك')}
          {step === 'profile' && (language === 'en' ? 'Complete Your Profile' : 'أكمل ملفك الشخصي')}
        </h2>

        {/* Auth Method Tabs */}
        {(step === 'phone' || step === 'email-login' || step === 'email-signup') && (
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setAuthMethod('phone');
                setStep('phone');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                authMethod === 'phone'
                  ? 'bg-white text-tea-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'en' ? '📱 Phone' : '📱 الهاتف'}
            </button>
            <button
              onClick={() => {
                setAuthMethod('email');
                setStep('email-login');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                authMethod === 'email'
                  ? 'bg-white text-tea-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'en' ? '✉️ Email' : '✉️ البريد'}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === 'phone' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Phone Number' : 'رقم الهاتف'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={language === 'en' ? '0501234567' : '٠٥٠١٢٣٤٥٦٧'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mb-4">
              {language === 'en'
                ? 'Enter your Saudi phone number. We\'ll send you a verification code via WhatsApp.'
                : 'أدخل رقم هاتفك السعودي. سنرسل لك رمز التحقق عبر الواتساب.'}
            </p>
            <button
              onClick={handleRequestOTP}
              disabled={loading}
              className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
            >
              {loading
                ? (language === 'en' ? 'Sending...' : 'جاري الإرسال...')
                : (language === 'en' ? 'Send Code' : 'إرسال الرمز')}
            </button>
          </div>
        )}

        {/* Email Login */}
        {step === 'email-login' && (
          <div>
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
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Password' : 'كلمة المرور'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'en' ? '••••••••' : '••••••••'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-2"
            />
            
            <div className="text-right mb-4">
              <a 
                href="/forgot-password" 
                target="_blank"
                className="text-sm text-tea-green hover:underline"
              >
                {language === 'en' ? 'Forgot Password?' : 'نسيت كلمة المرور؟'}
              </a>
            </div>
            
            <button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition mb-3"
            >
              {loading
                ? (language === 'en' ? 'Signing In...' : 'جاري تسجيل الدخول...')
                : (language === 'en' ? 'Sign In' : 'تسجيل الدخول')}
            </button>
            
            <div className="text-center">
              <button
                onClick={() => setStep('email-signup')}
                className="text-sm text-gray-600 hover:text-tea-green"
              >
                {language === 'en' ? 'Don\'t have an account? Sign Up' : 'ليس لديك حساب؟ سجل الآن'}
              </button>
            </div>
          </div>
        )}

        {/* Email Signup */}
        {step === 'email-signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Full Name' : 'الاسم الكامل'} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'en' ? 'Ahmed Abdullah' : 'أحمد عبدالله'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'en' ? 'your@email.com' : 'your@email.com'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
              dir="ltr"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Password' : 'كلمة المرور'} *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'en' ? '••••••••' : '••••••••'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'} *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={language === 'en' ? '••••••••' : '••••••••'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-2"
            />
            
            <p className="text-xs text-gray-500 mb-4">
              {language === 'en'
                ? 'Password must be at least 8 characters'
                : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'}
            </p>
            
            <button
              onClick={handleEmailSignup}
              disabled={loading}
              className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition mb-3"
            >
              {loading
                ? (language === 'en' ? 'Creating Account...' : 'جاري إنشاء الحساب...')
                : (language === 'en' ? 'Sign Up' : 'إنشاء حساب')}
            </button>
            
            <div className="text-center">
              <button
                onClick={() => setStep('email-login')}
                className="text-sm text-gray-600 hover:text-tea-green"
              >
                {language === 'en' ? 'Already have an account? Sign In' : 'لديك حساب؟ سجل الدخول'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {language === 'en'
                ? `We sent a 6-digit code to ${phone} via WhatsApp.`
                : `أرسلنا رمزًا مكونًا من 6 أرقام إلى ${phone} عبر الواتساب.`}
            </p>
            
            {devOTP && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                <strong>Development Mode:</strong> OTP Code: <code className="font-mono">{devOTP}</code>
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Verification Code' : 'رمز التحقق'}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-2 text-center text-2xl tracking-widest font-mono"
              dir="ltr"
            />
            
            {countdown > 0 && (
              <p className="text-xs text-gray-500 mb-4 text-center">
                {language === 'en' ? 'Code expires in' : 'ينتهي الرمز في'} {formatCountdown(countdown)}
              </p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition mb-3"
            >
              {loading
                ? (language === 'en' ? 'Verifying...' : 'جاري التحقق...')
                : (language === 'en' ? 'Verify Code' : 'تحقق من الرمز')}
            </button>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-tea-green py-2 text-sm hover:underline"
            >
              {language === 'en' ? 'Change Phone Number' : 'تغيير رقم الهاتف'}
            </button>
          </div>
        )}

        {/* Step 3: Profile Completion */}
        {step === 'profile' && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {language === 'en'
                ? 'Please complete your profile to continue.'
                : 'يرجى إكمال ملفك الشخصي للمتابعة.'}
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Full Name' : 'الاسم الكامل'} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'en' ? 'Ahmed Abdullah' : 'أحمد عبدالله'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Email (Optional)' : 'البريد الإلكتروني (اختياري)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'en' ? 'ahmed@example.com' : 'ahmed@example.com'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green mb-4"
              dir="ltr"
            />

            <button
              onClick={handleCompleteProfile}
              disabled={loading || !name.trim()}
              className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
            >
              {loading
                ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...')
                : (language === 'en' ? 'Complete Profile' : 'إكمال الملف الشخصي')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
