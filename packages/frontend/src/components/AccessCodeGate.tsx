/**
 * Access Code Gate
 * When VITE_ACCESS_CODE is set, requires the user to enter the code before accessing the app.
 * Stores confirmation in localStorage on success.
 */

import { useState } from 'react';

const ACCESS_CODE_STORAGE_KEY = 'cmms_access_code_verified';

function isAccessCodeRequired(): boolean {
  const code = import.meta.env.VITE_ACCESS_CODE;
  return typeof code === 'string' && code.trim().length > 0;
}

function isVerified(): boolean {
  const expected = import.meta.env.VITE_ACCESS_CODE;
  if (typeof expected !== 'string' || !expected.trim()) return true;
  try {
    const stored = localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
    return stored === expected.trim();
  } catch {
    return false;
  }
}

function setVerified(): void {
  const code = import.meta.env.VITE_ACCESS_CODE;
  if (typeof code === 'string' && code.trim()) {
    localStorage.setItem(ACCESS_CODE_STORAGE_KEY, code.trim());
  }
}

interface AccessCodeGateProps {
  children: React.ReactNode;
}

export function AccessCodeGate({ children }: AccessCodeGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerifiedState] = useState(isVerified);

  if (!isAccessCodeRequired()) {
    return <>{children}</>;
  }

  if (verified) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const expected = (import.meta.env.VITE_ACCESS_CODE ?? '').trim();
    if (code.trim() === expected) {
      setVerified();
      setVerifiedState(true);
    } else {
      setError('Invalid access code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CMMS System</h1>
        <p className="text-gray-600 mb-6">Enter access code to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            autoComplete="off"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          />
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
