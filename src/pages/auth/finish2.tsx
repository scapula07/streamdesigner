
import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '@/components/AuthGuard';
import { userApi } from '@/firebase/user';
import { userStore } from '@/recoil';
import { useRecoilValue } from 'recoil';
const options = [
  'Personal referral',
  'Social media',
  'Google search',
  'AI (ChatGPT, Gemini, etc.)',
  'YouTube',
  'Other',
];

export default function SignupFinish() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useRecoilValue(userStore) as { id: string };
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSelect = (option: string) => {
    setSelected(option);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selected) {
      setError('Please select an option.');
      return;
    }
    setIsLoading(true);
    try {
     const response= await userApi.updateUserInfo(user?.id,{ howDidYouHear: selected });
     if (response.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="w-screen h-screen flex bg-white">
        {/* Left: Question & Options */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-40 xl:px-56 2xl:px-72 py-8">
          <h1 className="text-3xl font-bold mb-8 text-[#23272e]">How did you hear about us?</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {options.map(option => (
              <button
                type="button"
                key={option}
                className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all font-medium text-lg ${selected === option ? 'border-[#6c63ff] bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-[#bdb8f5]'} focus:outline-none`}
                onClick={() => handleSelect(option)}
                tabIndex={0}
                aria-pressed={selected === option}
              >
                {option}
              </button>
            ))}
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            <button
              type="submit"
              className="mt-4 w-32 py-3 rounded-lg bg-gray-300 text-gray-600 font-semibold text-base shadow hover:bg-gray-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!selected || isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </form>
        </div>
        {/* Right: Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-white min-h-screen">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="100" height="100" rx="20" fill="#E6E6FA" />
                <circle cx="60" cy="60" r="35" fill="#BDB8F5" />
                <rect x="40" y="40" width="40" height="40" rx="10" fill="#fff" />
                <circle cx="60" cy="60" r="10" fill="#6c63ff" />
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-[#f6f4fa] flex items-center justify-center">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fff"/><path d="M8 12h8M12 8v8" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <div className="w-24 h-24 rounded-lg bg-[#f6f4fa] flex items-center justify-center">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fff"/><path d="M16 8l-8 8M8 8l8 8" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
