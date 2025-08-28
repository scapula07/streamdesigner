'use client'
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkSpaces from "../../components/dashboard/WorkSpaces";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { userStore } from "@/recoil";
import { useRecoilValue } from "recoil";

export default function Dashboard() {
  const user = useRecoilValue(userStore);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && user.onboarded === false) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user]);

  return (
    <DashboardLayout>
      {showOnboarding && (
        <OnboardingModal user={user} onClose={() => setShowOnboarding(false)} />
      )}
      <WorkSpaces />
    </DashboardLayout>
  );
}
