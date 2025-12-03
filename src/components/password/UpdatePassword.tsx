"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updatePassword } from '../../redux/thunk/updatePasswordThunk';
import { resetUpdatePassword } from '../../redux/slice/updatePasswordSlice';

export default function UpdatePasswordUI() {
  const dispatch = useAppDispatch();
  const { loading, success, error, message, validationErrors } = useAppSelector(state => state.updatePassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localValidationError, setLocalValidationError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(resetUpdatePassword());
    };
  }, [dispatch]);

  // Show toast and clear form when update is successful
  useEffect(() => {
    if (success) {
      setShowToast(true);

      // Clear form inputs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Hide toast and reset slice after 3 seconds
      const t = setTimeout(() => {
        setShowToast(false);
        dispatch(resetUpdatePassword());
      }, 3000);

      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidationError('');

    if (newPassword !== confirmPassword) {
      // Local validation - show inline message instead of alert
      setLocalValidationError('New password and confirmation do not match');
      return;
    }

    dispatch(updatePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    }));
  };

  return (
    <div className="flex items-center justify-center py-7 border rounded-2xl mt-2">
      <div className="w-full">
        {/* Toast */}
        {showToast && (
          <div
            aria-live="polite"
            className="fixed top-6 right-6 z-50"
          >
            <div className="max-w-sm w-full bg-green-600 dark:bg-green-500 text-white rounded-xl shadow-lg p-3 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm font-medium">
                {message ?? 'Password updated successfully'}
              </div>
            </div>
          </div>
        )}
        <div className=" dark:bg-gray-900  dark:shadow-none p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">Update Password</h2>

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Current Password */}
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showCurrent ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            {validationErrors?.current_password && (
              <p className="text-sm text-red-600">{validationErrors.current_password[0]}</p>
            )}

            {/* New Password */}
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showNew ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            {validationErrors?.new_password && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.new_password[0]}</p>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showConfirm ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            {(() => {
              const err = localValidationError
                || validationErrors?.confirm_password?.[0]
                || validationErrors?.new_password_confirmation?.[0]
                || validationErrors?.new_password?.[0]
                || validationErrors?.password_confirmation?.[0];
              return err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null;
            })()}

            {error && <p className="text-sm text-red-600 dark:text-red-400">{String(error)}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400">{message ?? 'Password updated successfully'}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-blue-600 disabled:opacity-60 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-semibold text-lg py-3 rounded-xl transition duration-200"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}