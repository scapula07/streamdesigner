import React, { useState } from "react";
import { userApi } from '@/firebase/user';
interface User {
  id?: string;
  email?: string;
  companyName?: string;
  industry?: string;
  discovery?: string;
  onboarded?: boolean;
}

const steps = [
  {
    key: "role",
    question: "What describes you best?",
    options: [
      "Designer",
      "Student",
      "Developer",
      "Hobbyist/Personal Use",
      "Product Manager",
      "Marketer",
      "Content Creator",
      "Educator",
      "Founder",
      "Other",
    ],
    logo: true,
    light: true,
  },
  {
    key: "industry",
    question: "What industry are you part of?",
    options: [
      "Industrial Design",
      "Automotive",
      "Architecture",
      "Footwear",
      "Fashion & Apparel",
      "Furniture",
      "Home Goods",
      "Entertainment & Gaming",
      "Other",
    ],
    icons: true,
    logo: true,
    light: true,
  },
  {
    key: "usage",
    question: "What will you use Lovable for?",
    options: [
      "Client Work",
      "For My Company",
      "Personal Projects",
      "Other",
    ],
    logo: true,
    light: true,
  },
];

export default function OnboardingModal({onClose, user}: {onClose: () => void, user: User | null}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = steps[step];

  const handleSelect = (option: string) => {
    setSelected((prev) => ({ ...prev, [current.key]: option }));
    setError(null);
  };

  const handleNext = async () => {
    if (!selected[current.key]) {
      setError('Please select an option.');
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Final step: update Firestore
      if (!user?.id) {
        setError('User not found.');
        return;
      }
      setIsLoading(true);
      try {
        await userApi.updateUserInfo(user.id, {
          role: selected.role,
          industry: selected.industry,
          usage: selected.usage,
          onboarded: true,
        });
        onClose();
      } catch (e) {
        setError('Failed to save. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="rounded-2xl shadow-2xl p-8 w-[420px] max-w-full relative bg-white text-black"
      >
        {current.logo && (
          <div className="mb-2">
            <span className="inline-block w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-purple-500 mr-2 align-middle" />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6">{current.question}</h2>
        <div className="flex flex-wrap gap-3 mb-8">
          {current.options.map((option) => (
            <button
              key={option}
              type="button"
              className={`px-4 py-2 rounded-lg font-medium border transition-all text-base min-w-[120px] ${
                selected[current.key] === option
                  ? "bg-black text-white border-black"
                  : "bg-[#f6f4fa] text-black border-[#ececec] hover:bg-gray-100"
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-4 h-2 rounded-full transition-all ${
                i === step ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            className="px-5 py-2 rounded-lg font-semibold text-base border bg-[#f6f4fa] text-black border-[#ececec] hover:bg-gray-100"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </button>
          {error && <div className="text-red-500 text-sm mb-2 w-full">{error}</div>}
          <button
            type="button"
            className="px-6 py-2 rounded-lg font-semibold text-base shadow transition-all bg-black text-white hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={isLoading || !selected[current.key]}
          >
            {isLoading ? 'Saving...' : step === steps.length - 1 ? "Continue" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
