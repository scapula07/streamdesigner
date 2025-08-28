import React, { useState } from "react";
import { authApi } from '@/firebase/auth';
import { useRouter } from 'next/router';
import { FcGoogle } from "react-icons/fc";
export default function Login() {
  const [email, setEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await authApi.googleLogin();
      console.log('User logged in:', user);
      localStorage.clear();
      localStorage.setItem('user',JSON.stringify(user));
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Error during Google login:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row bg-white">
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-32 lg:px-40 xl:px-56 2xl:px-72 py-8">
        <button className="mb-8 text-sm text-gray-500 hover:text-gray-700 w-fit">Back</button>
        <h1 className="text-4xl font-bold mb-2">Log in</h1>
        <p className="text-lg text-gray-500 mb-8">Welcome back to Deptho.</p>
        <form className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg bg-black text-white font-semibold text-lg shadow hover:bg-gray-900 transition"
          >
            Log in with Email
          </button>
          <div className="flex items-center my-2">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-xs">or</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 font-medium text-gray-800"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? 'Logging in...' : <><FcGoogle size={20} /> Continue with Google</>}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <a href="/auth/signup" className="underline hover:text-black">Sign up</a>
        </p>
      </div>
      {/* Right: Animated/Graphic Area */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-black min-h-screen">
        {/* Placeholder for animated mesh graphic */}
        <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 200 Q 120 100 220 200 T 380 200" stroke="#fff" strokeWidth="2" fill="none"/>
          <path d="M20 220 Q 120 120 220 220 T 380 220" stroke="#fff" strokeWidth="2" fill="none"/>
          <path d="M20 240 Q 120 140 220 240 T 380 240" stroke="#fff" strokeWidth="2" fill="none"/>
          <path d="M20 260 Q 120 160 220 260 T 380 260" stroke="#fff" strokeWidth="2" fill="none"/>
          <path d="M20 280 Q 120 180 220 280 T 380 280" stroke="#fff" strokeWidth="2" fill="none"/>
        </svg>
      </div>
    </div>
  );
}
