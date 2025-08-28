

import React, { useState } from "react";
import { authApi } from "@/firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();
    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        try {
            const user = await authApi.googleAuth(null);
            console.log('User signed up:', user);
            localStorage.clear();
            localStorage.setItem('user',JSON.stringify(user));
            setNotification({ message: 'Signup successful!', type: 'success' });
            router.push('/auth/finish2'); // Redirect on successful signup
        } catch (error) {
            console.error('Error during Google signup:', error);
            setNotification({ message: 'Google signup failed. Please try again.', type: 'error' });
        } finally {
        setGoogleLoading(false);
        }
    };
  return (
    <div className="min-h-screen flex flex-row bg-white">
      {/* Left: Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-32 lg:px-40 xl:px-56 2xl:px-72 py-8">
        <button className="mb-8 text-sm text-gray-500 hover:text-gray-700 w-fit">Back</button>
        <h1 className="text-4xl font-bold mb-2">Sign up</h1>
        <p className="text-lg text-gray-500 mb-8">Sign up for Deptho for free now.</p>
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
            Sign up with Email  
           </button>
        </form>

         <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-3 text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
         <button
            className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 font-medium text-gray-800"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
          >
            {googleLoading ? 'Signing in...' : <><FcGoogle size={20} /> Continue with Google</>}
          </button>
        <p className="mt-8 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <a href="/auth/login" className="underline hover:text-black">Log in</a>
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
